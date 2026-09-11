import React, { useState, useEffect, useRef } from 'react';
import { TriviaQuestion } from '../types/game';
import { Trophy, Clock, ArrowLeft, CheckCircle, XCircle, RotateCw, Brain } from 'lucide-react';
import { sound } from '../utils/audio';
import { submitTriviaResult, fetchTriviaLeaderboardAsync } from '../utils/globalRecords';

const TIMER_SECONDS = 15;
const QUESTIONS_COUNT = 12;

interface LeaderboardEntry { rank: number; playerName: string; score: number; timeSeconds: number }

interface Props {
  playerName: string;
  onBack: () => void;
}

async function fetchQuestions(): Promise<TriviaQuestion[]> {
  const res = await fetch('/api/trivia/questions');
  if (!res.ok) throw new Error('Error al cargar preguntas');
  const data = await res.json();
  return (data.questions || []).map((q: any) => {
    const swap = Math.random() < 0.5;
    return {
      id: q.id,
      question: q.question,
      options: swap ? [q.optionB, q.optionA] : [q.optionA, q.optionB] as [string, string],
      correct: (swap ? 1 - q.correctOption : q.correctOption) as 0 | 1,
    };
  });
}

export const TriviaGame: React.FC<Props> = ({ playerName, onBack }) => {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(0 | 1 | null)[]>(Array(QUESTIONS_COUNT).fill(null));
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [finished, setFinished] = useState(false);
  const [selected, setSelected] = useState<0 | 1 | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLb, setLoadingLb] = useState(false);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false);

  // Load questions on mount
  useEffect(() => {
    fetchQuestions()
      .then(qs => {
        setQuestions(qs);
        setAnswers(Array(qs.length).fill(null));
        startTimeRef.current = Date.now();
      })
      .catch(() => setLoadError(true));
  }, []);

  // Start timer once questions are loaded
  useEffect(() => {
    if (questions.length === 0 || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [questions.length, finished]);

  // Submit result when finished
  useEffect(() => {
    if (!finished || submittedRef.current || questions.length === 0) return;
    submittedRef.current = true;

    const correct = answers.filter((a, i) => a !== null && a === questions[i]?.correct).length;
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);

    submitTriviaResult(playerName, correct, elapsed).then(() => {
      setLoadingLb(true);
      fetchTriviaLeaderboardAsync().then(entries => {
        setLeaderboard(entries);
        setLoadingLb(false);
      });
    });
  }, [finished, answers, playerName, questions]);

  const handleAnswer = (option: 0 | 1) => {
    if (selected !== null) return;
    sound.playClick();
    setSelected(option);

    setTimeout(() => {
      const newAnswers = [...answers];
      newAnswers[current] = option;
      setAnswers(newAnswers);
      setSelected(null);

      if (current === questions.length - 1) {
        clearInterval(timerRef.current!);
        setFinished(true);
      } else {
        setCurrent(c => c + 1);
      }
    }, 600);
  };

  const correctCount = answers.filter((a, i) => a !== null && a === questions[i]?.correct).length;
  const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft > 30 ? '#38BDF8' : timeLeft > 15 ? '#f59e0b' : '#ef4444';

  // Loading screen
  if (!loadError && questions.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center gap-6 py-20 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
          <Brain className="w-7 h-7 text-violet-400 animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-[11px] font-mono-code font-bold uppercase tracking-[0.3em] text-violet-400">
            CARGANDO PREGUNTAS
          </p>
          <p className="text-[11px] font-mono-code text-white/30">Preparando el desafío...</p>
        </div>
      </div>
    );
  }

  // Error screen
  if (loadError) {
    return (
      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center gap-5 py-20 animate-fadeIn">
        <p className="text-white/50 font-mono-code text-sm">No se pudieron cargar las preguntas.</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono-code text-sm uppercase transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  // Results screen
  if (finished) {
    return (
      <div className="w-full max-w-lg mx-auto flex flex-col gap-5 animate-fadeIn py-4">
        <div className="rounded-2xl bg-[#0a0a0a] border border-white/15 p-6 flex flex-col items-center gap-5 shadow-xl">
          <div className="text-[11px] font-mono-code font-bold uppercase tracking-[0.25em] text-violet-400">
            RESULTADO FINAL
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-7xl font-black font-display text-white">{correctCount}</span>
            <span className="text-white/40 font-mono-code text-sm uppercase tracking-wider">
              de {questions.length} correctas
            </span>
          </div>

          <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-1">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-xl font-black text-white font-mono-code">{correctCount}</span>
              <span className="text-[11px] text-white/40 font-mono-code uppercase">Correctas</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex flex-col items-center gap-1">
              <Clock className="w-5 h-5 text-[#38BDF8]" />
              <span className="text-xl font-black text-white font-mono-code">{timeTaken}s</span>
              <span className="text-[11px] text-white/40 font-mono-code uppercase">Tiempo</span>
            </div>
          </div>

          <div className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-3 flex flex-col gap-2">
            {questions.map((q, i) => {
              const a = answers[i];
              const isCorrect = a === q.correct;
              return (
                <div key={q.id} className="flex items-start gap-2 text-[12px] font-mono-code">
                  {a === null ? (
                    <span className="text-white/30 mt-0.5">—</span>
                  ) : isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={a === null ? 'text-white/30' : isCorrect ? 'text-white/70' : 'text-white/40 line-through'}>
                    {q.question}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-mono-code font-bold uppercase tracking-[0.2em] text-white/60">
              RANKING TRIVIA
            </span>
            {loadingLb && <RotateCw className="w-3 h-3 text-violet-400 animate-spin ml-auto" />}
          </div>

          {leaderboard.length === 0 && !loadingLb ? (
            <p className="text-[11px] font-mono-code text-white/30 text-center py-2">Sin datos aún</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {leaderboard.map(entry => {
                const isMe = entry.playerName === playerName.trim().toUpperCase();
                return (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-[12px] font-mono-code transition-colors ${
                      isMe ? 'bg-violet-500/10 border-violet-500/30' : 'bg-white/[0.02] border-white/5'
                    }`}
                  >
                    <span className={`w-5 text-center font-black ${entry.rank <= 3 ? 'text-amber-400' : 'text-white/30'}`}>
                      {entry.rank}º
                    </span>
                    <span className={`flex-1 font-bold uppercase truncate ${isMe ? 'text-violet-300' : 'text-white/80'}`}>
                      {entry.playerName}
                    </span>
                    <span className="text-white font-black">{entry.score}</span>
                    <span className="text-white/40 text-[11px]">✓</span>
                    <span className="text-white/50 text-[11px] tabular-nums">{entry.timeSeconds}s</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl bg-white text-black font-black font-display text-sm uppercase tracking-wider hover:bg-violet-400 transition-colors"
        >
          VOLVER AL INICIO
        </button>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-5 animate-fadeIn py-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs font-mono-code uppercase transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <span className="text-[11px] font-mono-code font-bold uppercase tracking-[0.2em] text-white/40">
          {current + 1} / {questions.length}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono-code text-white/40">
          <span className="uppercase tracking-wider">Tiempo restante</span>
          <span style={{ color: timerColor }} className="font-bold tabular-nums">{timeLeft}s</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-[#0a0a0a] border border-white/15 p-6 shadow-xl">
        <p className="text-lg sm:text-xl font-black font-display text-white leading-snug mb-6">
          {q.question}
        </p>

        <div className="flex flex-col gap-3">
          {q.options.map((opt, i) => {
            const idx = i as 0 | 1;
            const isSelected = selected === idx;
            const isCorrect = idx === q.correct;
            const showFeedback = selected !== null;

            let style = 'bg-white/[0.04] border-white/15 text-white/80 hover:bg-white/[0.08] hover:border-violet-400/50';
            if (showFeedback && isSelected && isCorrect) style = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300';
            if (showFeedback && isSelected && !isCorrect) style = 'bg-red-500/20 border-red-500/60 text-red-300';
            if (showFeedback && !isSelected && isCorrect) style = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400/70';

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={selected !== null}
                className={`w-full text-left px-4 py-3.5 rounded-xl border font-mono-code font-bold text-sm transition-all ${style}`}
              >
                <span className="text-white/30 mr-3">{idx === 0 ? 'A' : 'B'}</span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        {questions.map((_, i) => {
          const a = answers[i];
          const isCorrect = a === questions[i].correct;
          return (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i === current
                  ? 'w-3 h-3 bg-violet-400'
                  : a !== null
                  ? `w-2 h-2 ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`
                  : 'w-2 h-2 bg-white/20'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
