import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameEvent, MinigameDefinition } from '../types/game';
import { Zap, CheckCircle2, XCircle, Timer } from 'lucide-react';
import { sound } from '../utils/audio';

interface SaltoMinigameModalProps {
  event: GameEvent;
  onFinish: (points: number, narrativeText: string) => void;
}

type MinigamePhase = 'INTRO' | 'COUNTDOWN' | 'PLAYING' | 'RESULT';

interface MathQuestion {
  text: string;
  answer: number;
  options: number[];
}

export const SaltoMinigameModal: React.FC<SaltoMinigameModalProps> = ({
  event,
  onFinish,
}) => {
  const minigame: MinigameDefinition = event.minigame || {
    type: 'PENALTY_TIMING',
    title: 'ATAJÁ EL PENAL',
    instructions: 'Presioná el botón de atajar justo cuando la pelota vaya pasando por la zona verde.',
    success: { points: 2, text: '¡Atajadón épico! Salvaste al equipo.' },
    failure: { points: -1, text: 'Gol del rival sobre la hora.' },
  };

  const [phase, setPhase] = useState<MinigamePhase>('INTRO');
  const [countdown, setCountdown] = useState<number>(3);
  
  // 1. Penalty Timing (Oscillating Fast Ball) State
  const [penaltyBallPos, setPenaltyBallPos] = useState<number>(0);
  const [penaltyBallDir, setPenaltyBallDir] = useState<number>(1);
  const [penaltyTimeLeft, setPenaltyTimeLeft] = useState<number>(4.5);
  const [penaltyIsStopped, setPenaltyIsStopped] = useState<boolean>(false);
  const penaltyBallPosRef = useRef<number>(0);
  const penaltyBallDirRef = useRef<number>(1);
  const penaltyTimerRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 2. Math Speed State
  const [mathQuestions, setMathQuestions] = useState<MathQuestion[]>([]);
  const [currentMathIndex, setCurrentMathIndex] = useState<number>(0);
  const [mathScore, setMathScore] = useState<number>(0);
  const [mathTimeLeft, setMathTimeLeft] = useState<number>(3.5);
  const mathTimerRef = useRef<number | null>(null);

  // 3. Tactical Code State
  const [tacticalCode, setTacticalCode] = useState<number[]>([]);
  const [tacticalSubPhase, setTacticalSubPhase] = useState<'SHOWING' | 'INPUT'>('SHOWING');
  const [tacticalUserSequence, setTacticalUserSequence] = useState<number[]>([]);
  const [tacticalTimeLeft, setTacticalTimeLeft] = useState<number>(1.5);
  const tacticalTimerRef = useRef<number | null>(null);
  const tacticalCodeRef = useRef<number[]>([]);
  const tacticalUserSeqRef = useRef<number[]>([]);

  // Final Outcome State
  const [resultPoints, setResultPoints] = useState<number>(0);
  const [resultText, setResultText] = useState<string>('');
  const [resultTier, setResultTier] = useState<'success' | 'failure'>('success');
  const gameEvaluatedRef = useRef<boolean>(false);

  // Generate 3 Math Questions if minigame is MATH_SPEED
  const generateQuestions = useCallback((): MathQuestion[] => {
    const list: MathQuestion[] = [];
    for (let i = 0; i < 3; i++) {
      const isAddition = Math.random() > 0.4;
      let a: number, b: number, ans: number;
      if (isAddition) {
        a = Math.floor(Math.random() * 9) + 4; // 4 to 12
        b = Math.floor(Math.random() * 8) + 3; // 3 to 10
        ans = a + b;
      } else {
        ans = Math.floor(Math.random() * 8) + 4; // 4 to 11
        b = Math.floor(Math.random() * 7) + 2; // 2 to 8
        a = ans + b;
      }
      
      const distractors = new Set<number>([ans]);
      while (distractors.size < 3) {
        const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
        const cand = ans + offset;
        if (cand > 0 && cand !== ans) distractors.add(cand);
      }

      const opts = Array.from(distractors).sort(() => Math.random() - 0.5);
      list.push({
        text: `${a} ${isAddition ? '+' : '-'} ${b}`,
        answer: ans,
        options: opts,
      });
    }
    return list;
  }, []);

  // Generate 3 random digits for TACTICAL_CODE
  const generateTacticalCode = useCallback((): number[] => {
    const d1 = Math.floor(Math.random() * 9) + 1; // 1 to 9
    const d2 = Math.floor(Math.random() * 10);     // 0 to 9
    const d3 = Math.floor(Math.random() * 10);     // 0 to 9
    return [d1, d2, d3];
  }, []);

  // Initialize questions or codes based on minigame type
  useEffect(() => {
    if (minigame.type === 'MATH_SPEED') {
      setMathQuestions(generateQuestions());
    } else if (minigame.type === 'TACTICAL_CODE') {
      const code = generateTacticalCode();
      setTacticalCode(code);
      tacticalCodeRef.current = code;
    }
  }, [minigame.type, generateQuestions, generateTacticalCode]);

  // Start Countdown Sequence
  const handleStartGame = () => {
    sound.playClick();
    gameEvaluatedRef.current = false;
    setPhase('COUNTDOWN');
    setCountdown(3);
  };

  useEffect(() => {
    if (phase !== 'COUNTDOWN') return;

    sound.playTick();
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        sound.playTick();
        return prev - 1;
      });
    }, 800);

    return () => clearInterval(timer);
  }, [phase]);

  // When countdown completes, transition to PLAYING and start minigame exactly once
  useEffect(() => {
    if (phase === 'COUNTDOWN' && countdown === 0) {
      setPhase('PLAYING');
      startActiveMinigame();
    }
  }, [phase, countdown]);

  // Start actual game logic once countdown ends
  const startActiveMinigame = () => {
    gameEvaluatedRef.current = false;

    // Reset any lingering timers
    if (mathTimerRef.current) {
      clearInterval(mathTimerRef.current);
      mathTimerRef.current = null;
    }
    if (tacticalTimerRef.current) {
      clearInterval(tacticalTimerRef.current);
      tacticalTimerRef.current = null;
    }
    if (penaltyTimerRef.current) {
      clearInterval(penaltyTimerRef.current);
      penaltyTimerRef.current = null;
    }

    if (minigame.type === 'PENALTY_TIMING') {
      setPenaltyBallPos(0);
      setPenaltyBallDir(1);
      setPenaltyTimeLeft(4.5);
      setPenaltyIsStopped(false);
      penaltyBallPosRef.current = 0;
      penaltyBallDirRef.current = 1;
      gameEvaluatedRef.current = false;

      let lastTimestamp = performance.now();
      let currentPos = 0;
      let direction = 1;
      // High speed: 145% per second (traverses 0 to 100 in ~690ms)
      const speed = 145;

      const step = (timestamp: number) => {
        if (gameEvaluatedRef.current) return;
        const delta = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
        lastTimestamp = timestamp;

        currentPos += direction * speed * delta;
        if (currentPos >= 100) {
          currentPos = 100;
          direction = -1;
        } else if (currentPos <= 0) {
          currentPos = 0;
          direction = 1;
        }

        penaltyBallPosRef.current = currentPos;
        penaltyBallDirRef.current = direction;
        setPenaltyBallPos(currentPos);
        setPenaltyBallDir(direction);

        animFrameRef.current = requestAnimationFrame(step);
      };

      animFrameRef.current = requestAnimationFrame(step);

      // 4.5s countdown timer
      const startTime = Date.now();
      const timerInterval = window.setInterval(() => {
        if (gameEvaluatedRef.current) {
          window.clearInterval(timerInterval);
          return;
        }
        const elapsed = (Date.now() - startTime) / 1000;
        const remain = Math.max(0, 4.5 - elapsed);
        setPenaltyTimeLeft(remain);

        if (remain <= 0) {
          window.clearInterval(timerInterval);
          handlePenaltyTap(true);
        }
      }, 50);
      penaltyTimerRef.current = timerInterval;
    } else if (minigame.type === 'MATH_SPEED') {
      setCurrentMathIndex(0);
      setMathScore(0);
      setMathTimeLeft(3.5);

      const interval = window.setInterval(() => {
        if (gameEvaluatedRef.current) {
          window.clearInterval(interval);
          return;
        }
        setMathTimeLeft((prev) => {
          if (prev <= 0.1) {
            window.clearInterval(interval);
            finishMathGame();
            return 0;
          }
          return Math.max(0, prev - 0.1);
        });
      }, 100);
      mathTimerRef.current = interval;
    } else if (minigame.type === 'TACTICAL_CODE') {
      const code = tacticalCode.length === 3 ? tacticalCode : generateTacticalCode();
      setTacticalCode(code);
      tacticalCodeRef.current = code;
      setTacticalUserSequence([]);
      tacticalUserSeqRef.current = [];
      setTacticalSubPhase('SHOWING');
      setTacticalTimeLeft(1.5);

      // Phase 1: DT indicates the code for 1.5s
      const startTime = Date.now();
      const interval = window.setInterval(() => {
        if (gameEvaluatedRef.current) {
          window.clearInterval(interval);
          return;
        }
        const elapsed = (Date.now() - startTime) / 1000;
        const remain = Math.max(0, 1.5 - elapsed);
        setTacticalTimeLeft(remain);

        if (remain <= 0) {
          window.clearInterval(interval);
          if (tacticalTimerRef.current === interval) {
            tacticalTimerRef.current = null;
          }
          startTacticalInputPhase();
        }
      }, 50);
      tacticalTimerRef.current = interval;
    }
  };

  // ============================================
  // MINIGAME 1: OSCILLATING PENALTY TIMING
  // ============================================
  const handlePenaltyTap = useCallback((isTimeout = false) => {
    if (phase !== 'PLAYING' || gameEvaluatedRef.current) return;
    gameEvaluatedRef.current = true;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (penaltyTimerRef.current) {
      window.clearInterval(penaltyTimerRef.current);
      penaltyTimerRef.current = null;
    }

    setPenaltyIsStopped(true);
    const finalPos = Math.round(penaltyBallPosRef.current);
    const isSuccess = !isTimeout && finalPos >= 40 && finalPos <= 60;

    if (isSuccess) {
      sound.playSuccess();
    } else {
      sound.playFail();
    }

    // Freeze briefly (600ms) so player clearly sees where the ball stopped
    setTimeout(() => {
      if (isTimeout) {
        setResultTier('failure');
        setResultPoints(minigame.failure.points);
        setResultText('¡SE TE ACABÓ EL TIEMPO!');
      } else if (isSuccess) {
        setResultTier('success');
        setResultPoints(minigame.success.points);
        setResultText(minigame.success.text);
      } else {
        setResultTier('failure');
        setResultPoints(minigame.failure.points);
        setResultText(
          finalPos < 40
            ? 'Te tiraste antes de tiempo!.'
            : 'Reaccionaste tarde, la pelota ya había entrado!.'
        );
      }
      setPhase('RESULT');
    }, 600);
  }, [phase, minigame]);

  // Spacebar support for Penalty Timing
  useEffect(() => {
    if (phase !== 'PLAYING' || minigame.type !== 'PENALTY_TIMING') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handlePenaltyTap(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase, minigame.type, handlePenaltyTap]);

  // Clean up animation frames & timers
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (penaltyTimerRef.current) clearInterval(penaltyTimerRef.current);
      if (mathTimerRef.current) clearInterval(mathTimerRef.current);
      if (tacticalTimerRef.current) clearInterval(tacticalTimerRef.current);
    };
  }, []);

  // ============================================
  // MINIGAME 2: MATH SPEED
  // ============================================
  const handleMathAnswer = (chosenOpt: number) => {
    if (phase !== 'PLAYING') return;

    const currentQ = mathQuestions[currentMathIndex];
    if (!currentQ) return;

    const isCorrect = chosenOpt === currentQ.answer;
    let newScore = mathScore;
    if (isCorrect) {
      sound.playClick();
      newScore += 1;
      setMathScore(newScore);
    } else {
      sound.playFail();
    }

    if (currentMathIndex + 1 < mathQuestions.length) {
      setCurrentMathIndex(currentMathIndex + 1);
    } else {
      if (mathTimerRef.current) clearInterval(mathTimerRef.current);
      evaluateMathResult(newScore);
    }
  };

  const finishMathGame = () => {
    evaluateMathResult(mathScore);
  };

  const evaluateMathResult = (finalScore: number) => {
    if (gameEvaluatedRef.current) return;
    gameEvaluatedRef.current = true;

    if (mathTimerRef.current) {
      window.clearInterval(mathTimerRef.current);
      mathTimerRef.current = null;
    }

    if (finalScore === 3) {
      setResultTier('success');
      setResultPoints(minigame.success.points);
      setResultText(minigame.success.text);
      sound.playSuccess();
    } else {
      setResultTier('failure');
      setResultPoints(minigame.failure.points);
      setResultText(minigame.failure.text);
      sound.playFail();
    }
    setPhase('RESULT');
  };

  // ============================================
  // MINIGAME 3: TACTICAL CODE
  // ============================================
  const startTacticalInputPhase = () => {
    if (gameEvaluatedRef.current) return;

    if (tacticalTimerRef.current) {
      window.clearInterval(tacticalTimerRef.current);
      tacticalTimerRef.current = null;
    }

    setTacticalSubPhase('INPUT');
    setTacticalTimeLeft(3.2);
    sound.playClick();

    const startTime = Date.now();
    const interval = window.setInterval(() => {
      if (gameEvaluatedRef.current) {
        window.clearInterval(interval);
        return;
      }
      const elapsed = (Date.now() - startTime) / 1000;
      const remain = Math.max(0, 3.2 - elapsed);
      setTacticalTimeLeft(remain);

      if (remain <= 0) {
        window.clearInterval(interval);
        if (tacticalTimerRef.current === interval) {
          tacticalTimerRef.current = null;
        }
        evaluateTacticalResult(false);
      }
    }, 50);
    tacticalTimerRef.current = interval;
  };

  const handleTacticalInput = (digit: number) => {
    if (phase !== 'PLAYING' || tacticalSubPhase !== 'INPUT' || gameEvaluatedRef.current) return;

    const currentSeq = tacticalUserSeqRef.current;
    const targetCode = tacticalCodeRef.current;
    const expected = targetCode[currentSeq.length];

    if (digit === expected) {
      sound.playClick();
      const nextSeq = [...currentSeq, digit];
      tacticalUserSeqRef.current = nextSeq;
      setTacticalUserSequence(nextSeq);

      if (nextSeq.length === targetCode.length) {
        if (tacticalTimerRef.current) {
          window.clearInterval(tacticalTimerRef.current);
          tacticalTimerRef.current = null;
        }
        evaluateTacticalResult(true);
      }
    } else {
      sound.playFail();
      if (tacticalTimerRef.current) {
        window.clearInterval(tacticalTimerRef.current);
        tacticalTimerRef.current = null;
      }
      evaluateTacticalResult(false);
    }
  };

  const evaluateTacticalResult = (isSuccess: boolean) => {
    if (gameEvaluatedRef.current) return;
    gameEvaluatedRef.current = true;

    if (tacticalTimerRef.current) {
      window.clearInterval(tacticalTimerRef.current);
      tacticalTimerRef.current = null;
    }

    if (isSuccess) {
      setResultTier('success');
      setResultPoints(minigame.success.points);
      setResultText(minigame.success.text);
      sound.playSuccess();
    } else {
      setResultTier('failure');
      setResultPoints(minigame.failure.points);
      setResultText(minigame.failure.text);
      sound.playFail();
    }
    setPhase('RESULT');
  };

  // Complete and report back to App
  const handleCompleteModal = () => {
    sound.playClick();
    onFinish(resultPoints, resultText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn select-none">
      <div className="w-full max-w-sm sm:max-w-md rounded-2xl p-4 sm:p-5 border border-white/10 bg-[#0d0f12] shadow-2xl relative overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Top ambient highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent" />

        {/* Phase 1: INTRO (Clean, focused challenge card matching requested layout) */}
        {phase === 'INTRO' && (
          <div className="space-y-4">
            {/* Minigame Challenge Card */}
            <div className="rounded-2xl p-4 sm:p-5 border border-white/10 bg-[#14171c] space-y-4">
              {/* Minimalist Top Row: Clean Title + MINIJUEGO pill */}
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-base sm:text-lg font-black font-display text-[#38BDF8] uppercase tracking-wide leading-tight">
                  {minigame.title}
                </h4>
                <div className="px-2.5 py-1 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[11px] font-mono-code font-bold text-[#38BDF8] uppercase tracking-wider shrink-0">
                  MINIJUEGO
                </div>
              </div>

              {/* Divider */}
              <div className="border-b border-white/10" />

              {/* Simple Instructions */}
              <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
                {minigame.instructions}
              </p>

              {/* Rewards Preview (2 boxes: VERDE - ROJO) */}
              <div className="grid grid-cols-2 gap-2.5 pt-1 text-center font-mono-code">
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400">
                  <div className="font-black text-xs sm:text-sm">+{minigame.success.points} PTS</div>
                  <div className="text-[10px] sm:text-[11px] text-emerald-400/80 uppercase tracking-tight font-bold mt-0.5">
                    VERDE // ACIERTO
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-400">
                  <div className="font-black text-xs sm:text-sm">{minigame.failure.points} PT</div>
                  <div className="text-[10px] sm:text-[11px] text-rose-400/80 uppercase tracking-tight font-bold mt-0.5">
                    ROJO // FALLO
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={handleStartGame}
              className="w-full py-3.5 px-4 rounded-xl bg-[#38BDF8] hover:bg-[#7dd3fc] text-black font-black font-display uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#38BDF8]/20"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>COMENZAR DESAFÍO</span>
            </button>
          </div>
        )}

        {/* Phase 2: COUNTDOWN */}
        {phase === 'COUNTDOWN' && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <span className="text-sm font-mono-code uppercase tracking-widest text-[#38BDF8]">
              PREPARÁ TUS REFLEJOS
            </span>
            <div className="text-7xl font-black font-display text-white animate-bounce">
              {countdown}
            </div>
            <p className="text-xs text-white/50 font-mono-code uppercase">
              {minigame.title}
            </p>
          </div>
        )}

        {/* Phase 3A: PLAYING - Minigame 1: PENALTY_TIMING */}
        {phase === 'PLAYING' && minigame.type === 'PENALTY_TIMING' && (
          <div className="space-y-4 py-1 animate-fadeIn">
            {/* Header with timer & speed badge */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono-code font-bold flex items-center gap-1.5 uppercase text-amber-400">
                <Timer className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>¡ATAJÁ CUANDO CRUCE LO VERDE!</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono-code text-[#38BDF8] font-bold bg-[#38BDF8]/15 border border-[#38BDF8]/30 px-2 py-0.5 rounded-full uppercase">
                  ⚡ RÁPIDO
                </span>
                <span className="text-xs font-mono-code text-white font-bold bg-white/10 px-2 py-0.5 rounded">
                  {penaltyTimeLeft.toFixed(1)}s
                </span>
              </div>
            </div>

            {/* Time progress bar */}
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ease-linear rounded-full ${
                  penaltyTimeLeft > 1.2 ? 'bg-[#38BDF8]' : 'bg-rose-500 animate-pulse'
                }`}
                style={{ width: `${Math.max(0, (penaltyTimeLeft / 4.5) * 100)}%` }}
              />
            </div>

            {/* Visual Penalty Arena Track */}
            <div className="rounded-2xl p-3 sm:p-4 border border-white/15 bg-[#0e141d] relative shadow-2xl">
              {/* Goal crossbar header */}
              <div className="flex justify-between items-center text-[11px] font-mono-code px-1 mb-2">
                <span className="text-rose-400 font-bold uppercase">PALO IZQ (-1)</span>
                <span className="text-emerald-400 font-black uppercase flex items-center gap-1">
                  <span>🎯</span>
                  <span>ZONA VERDE (40-60% // +5 PTS)</span>
                </span>
                <span className="text-rose-400 font-bold uppercase">PALO DER (-1)</span>
              </div>

              {/* Goal Track Arena */}
              <div
                onClick={() => !penaltyIsStopped && handlePenaltyTap(false)}
                className="relative h-24 sm:h-28 w-full rounded-xl bg-black/60 border-2 border-white/20 overflow-hidden cursor-pointer select-none bg-[radial-gradient(#ffffff12_1px,transparent_1px)] [background-size:10px_10px]"
              >
                {/* Zones: 40% Red | 20% Green | 40% Red */}
                <div className="absolute inset-0 flex">
                  <div className="w-[40%] bg-rose-500/10 border-r border-rose-500/30 flex items-center justify-center">
                    <span className="text-[11px] font-mono-code text-rose-400/60 font-bold uppercase">
                      FUERA
                    </span>
                  </div>

                  <div className="w-[20%] bg-emerald-500/20 border-x-2 border-emerald-400 flex flex-col items-center justify-center relative shadow-[inset_0_0_20px_rgba(16,185,129,0.3)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mb-0.5" />
                    <span className="text-[12px] font-mono-code text-emerald-300 font-black uppercase tracking-wider">
                      ATAJADA
                    </span>
                  </div>

                  <div className="w-[40%] bg-rose-500/10 border-l border-rose-500/30 flex items-center justify-center">
                    <span className="text-[11px] font-mono-code text-rose-400/60 font-bold uppercase">
                      FUERA
                    </span>
                  </div>
                </div>

                {/* Net Texture Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />

                {/* Oscillating Ball */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform duration-75 ease-out z-10"
                  style={{ left: `${penaltyBallPos}%` }}
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-2xl transition-all ${
                      penaltyIsStopped
                        ? penaltyBallPos >= 40 && penaltyBallPos <= 60
                          ? 'bg-emerald-400/90 scale-125 ring-4 ring-emerald-300 shadow-[0_0_25px_rgba(52,211,153,0.8)]'
                          : 'bg-rose-500/90 scale-125 ring-4 ring-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.8)]'
                        : 'bg-white/95 ring-2 ring-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.7)] animate-pulse'
                    }`}
                  >
                    ⚽
                  </div>
                  {!penaltyIsStopped && (
                    <div
                      className={`text-[10px] font-mono-code font-black text-center mt-1 uppercase ${
                        penaltyBallDir > 0 ? 'text-[#38BDF8]' : 'text-amber-400'
                      }`}
                    >
                      {penaltyBallDir > 0 ? '→' : '←'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tap Button */}
            <button
              onClick={() => !penaltyIsStopped && handlePenaltyTap(false)}
              disabled={penaltyIsStopped}
              className={`w-full py-5 sm:py-6 rounded-2xl font-display font-black text-lg sm:text-xl uppercase tracking-wider transition-all select-none shadow-2xl flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                penaltyIsStopped
                  ? penaltyBallPos >= 40 && penaltyBallPos <= 60
                    ? 'bg-emerald-500 text-black ring-4 ring-emerald-300 shadow-emerald-500/50'
                    : 'bg-rose-600 text-white ring-4 ring-rose-400 shadow-rose-500/50'
                  : 'bg-[#38BDF8] hover:bg-[#7dd3fc] text-black shadow-[0_0_25px_rgba(56,189,248,0.4)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl">
                  {penaltyIsStopped
                    ? penaltyBallPos >= 40 && penaltyBallPos <= 60
                      ? '🧤'
                      : '🥅'
                    : '🧤'}
                </span>
                <span>
                  {penaltyIsStopped
                    ? penaltyBallPos >= 40 && penaltyBallPos <= 60
                      ? '¡PENAL ATAJADO!'
                      : '¡GOL DEL RIVAL!'
                    : '¡ATAJAR AHORA!'}
                </span>
              </div>
              <span className="text-[11px] sm:text-xs font-mono-code font-bold opacity-80">
                {penaltyIsStopped
                  ? penaltyBallPos >= 40 && penaltyBallPos <= 60
                    ? 'Reflejos insuperables en la hora'
                    : 'No lograste bloquear el remate'
                  : 'Tocá acá o presioná ESPACIO justo en la zona verde'}
              </span>
            </button>
          </div>
        )}

        {/* Phase 3B: PLAYING - Minigame 2: MATH_SPEED */}
        {phase === 'PLAYING' && minigame.type === 'MATH_SPEED' && (
          <div className="space-y-4 py-2">
            {/* Header with timer & score */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono-code text-white/70">
                <Timer className="w-4 h-4 text-[#38BDF8]" />
                <span className="font-black text-[#38BDF8] text-sm">{mathTimeLeft.toFixed(1)}s</span>
              </div>
              <div className="text-xs font-mono-code text-white/70">
                PREGUNTA <span className="text-white font-bold">{currentMathIndex + 1} / 3</span>
              </div>
              <div className="text-xs font-mono-code text-emerald-400 font-black">
                {mathScore} / 3 ACIERTOS
              </div>
            </div>

            {/* Time progress bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#38BDF8] transition-all duration-100"
                style={{ width: `${(mathTimeLeft / 3.5) * 100}%` }}
              />
            </div>

            {/* Math Formula Card */}
            {mathQuestions[currentMathIndex] && (
              <div className="py-6 px-4 rounded-2xl bg-white/[0.04] border border-white/10 text-center space-y-2">
                <span className="text-[11px] font-mono-code uppercase tracking-widest text-white/50">
                  RESOLVÉ RÁPIDO:
                </span>
                <div className="text-4xl sm:text-5xl font-black font-display tracking-tight text-white">
                  {mathQuestions[currentMathIndex].text} = ?
                </div>
              </div>
            )}

            {/* Answer Options Grid */}
            {mathQuestions[currentMathIndex] && (
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {mathQuestions[currentMathIndex].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleMathAnswer(opt)}
                    className="py-4 sm:py-5 rounded-xl bg-white/[0.08] hover:bg-[#38BDF8] hover:text-black border border-white/20 text-white font-display font-black text-xl sm:text-2xl transition-all active:scale-95 shadow-md"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Phase 3C: PLAYING - Minigame 3: TACTICAL_CODE */}
        {phase === 'PLAYING' && minigame.type === 'TACTICAL_CODE' && (
          <div className="space-y-4 py-1">
            {/* SUBPHASE 1: SHOWING CODE (1.5s) */}
            {tacticalSubPhase === 'SHOWING' && (
              <div className="rounded-2xl p-5 border border-[#38BDF8]/40 bg-[#14171c] text-center space-y-4 shadow-xl shadow-[#38BDF8]/10 animate-fadeIn">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-mono-code font-black uppercase tracking-wider animate-pulse">
                  <span>🎙️</span>
                  <span>CÓDIGO DE JUEGO</span>
                </div>

                <div className="py-2">
                  <div className="text-[12px] font-mono-code uppercase tracking-widest text-white/50 mb-3">
                    EL DT GRITA LA INDICACIÓN:
                  </div>
                  <div className="flex items-center justify-center gap-2.5 sm:gap-3">
                    {tacticalCode.map((digit, idx) => (
                      <React.Fragment key={idx}>
                        <div className="w-14 h-18 sm:w-16 sm:h-20 rounded-xl bg-gradient-to-b from-[#38BDF8]/20 to-black/80 border-2 border-[#38BDF8] flex items-center justify-center text-3xl sm:text-4xl font-black font-display text-white shadow-[0_0_20px_rgba(56,189,248,0.4)] animate-bounce">
                          {digit}
                        </div>
                        {idx < tacticalCode.length - 1 && (
                          <span className="text-xl sm:text-2xl font-black text-[#38BDF8] font-mono-code">
                            →
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Progress bar countdown */}
                <div className="space-y-1.5 pt-1">
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#38BDF8] transition-all duration-75 ease-linear rounded-full"
                      style={{ width: `${(tacticalTimeLeft / 1.5) * 100}%` }}
                    />
                  </div>
                  <div className="text-[11px] font-mono-code text-white/70 font-bold uppercase tracking-wider">
                    ¡MEMORIZÁ LA SECUENCIA!
                  </div>
                </div>
              </div>
            )}

            {/* SUBPHASE 2: INPUT CODE (3.2s limit) */}
            {tacticalSubPhase === 'INPUT' && (
              <div className="space-y-3.5 animate-fadeIn">
                {/* Timer Header */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-mono-code text-amber-400 font-bold flex items-center gap-1.5 uppercase">
                    <Timer className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>¿CUÁL ERA EL CÓDIGO?</span>
                  </span>
                  <span className="text-xs font-mono-code text-white font-bold bg-white/10 px-2 py-0.5 rounded">
                    {tacticalTimeLeft.toFixed(1)}s
                  </span>
                </div>

                {/* Time progress bar */}
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-75 ease-linear rounded-full ${
                      tacticalTimeLeft > 1.0 ? 'bg-emerald-400' : 'bg-rose-500 animate-pulse'
                    }`}
                    style={{ width: `${Math.max(0, (tacticalTimeLeft / 3.2) * 100)}%` }}
                  />
                </div>

                {/* Entered Code Slots */}
                <div className="rounded-xl p-3 bg-white/[0.04] border border-white/10 flex items-center justify-center gap-3">
                  {[0, 1, 2].map((idx) => {
                    const entered = tacticalUserSequence[idx];
                    const isFilled = entered !== undefined;
                    return (
                      <div
                        key={idx}
                        className={`w-12 h-14 rounded-lg flex items-center justify-center font-display font-black text-2xl transition-all border ${
                          isFilled
                            ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-white shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                            : 'bg-black/50 border-white/20 text-white/30'
                        }`}
                      >
                        {isFilled ? entered : '_'}
                      </div>
                    );
                  })}
                </div>

                <div className="text-center text-[11px] font-mono-code text-white/60 font-medium">
                  Toca en orden...
                </div>

                {/* Number Keypad in 2 rows: [1][2][3][4][5] and [6][7][8][9][0] */}
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {[5, 2, 4, 3, 1].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleTacticalInput(num)}
                        className="h-12 sm:h-14 rounded-xl bg-white/[0.08] hover:bg-[#38BDF8] hover:text-black active:scale-95 border border-white/15 text-white font-display font-black text-lg sm:text-xl transition-all flex items-center justify-center shadow-md cursor-pointer"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {[0, 7, 9, 8, 6].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleTacticalInput(num)}
                        className="h-12 sm:h-14 rounded-xl bg-white/[0.08] hover:bg-[#38BDF8] hover:text-black active:scale-95 border border-white/15 text-white font-display font-black text-lg sm:text-xl transition-all flex items-center justify-center shadow-md cursor-pointer"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase 4: RESULT (Matching user's reference layout) */}
        {phase === 'RESULT' && (
          <div className="space-y-3.5 py-1 animate-fadeIn">
            {/* Top Card: Big Outcome Banner (Verde / Rojo) */}
            <div
              className={`p-6 sm:p-7 rounded-2xl border text-center flex flex-col items-center justify-center ${
                resultTier === 'success'
                  ? 'bg-[#052219] border-[#00E599]/40 text-[#00E599]'
                  : 'bg-[#260c11] border-rose-500/40 text-rose-400'
              }`}
            >
              <div className="inline-flex items-center gap-1.5 text-xs font-mono-code font-bold uppercase tracking-wider mb-2">
                {resultTier === 'success' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#00E599]" />
                    <span>¡DESAFÍO SUPERADO!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>DESAFÍO FALLIDO</span>
                  </>
                )}
              </div>

              <div className="text-4xl sm:text-5xl font-black font-display tracking-tight leading-none my-1">
                {resultPoints > 0 ? `+${resultPoints}` : resultPoints} {Math.abs(resultPoints) === 1 ? 'PUNTO' : 'PUNTOS'}
              </div>

              <div
                className={`text-[11px] sm:text-[12px] font-mono-code uppercase tracking-widest mt-2 ${
                  resultTier === 'success' ? 'text-[#00E599]/70' : 'text-rose-400/70'
                }`}
              >
                APLICADOS AL PUNTAJE DEL EQUIPO
              </div>
            </div>

            {/* Bottom Card: Narrative Story Resolution */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#14171c] border border-white/10 text-xs sm:text-sm text-white/90 leading-relaxed font-sans font-medium text-left">
              {resultText}
            </div>

            {/* Continue Button */}
            <button
              onClick={handleCompleteModal}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-black font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-[0.99] shadow-lg cursor-pointer text-center mt-2"
            >
              CONTINUAR CON LA FORMACIÓN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
