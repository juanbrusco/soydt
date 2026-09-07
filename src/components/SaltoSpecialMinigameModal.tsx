import React, { useState, useEffect } from 'react';
import { 
  SPECIAL_FOOTBALL_TRIVIA, 
  SPECIAL_VARIANTS, 
  SpecialVariant, 
  WorldFootballTrivia 
} from '../data/salto/specialTrivia';
import { Sparkles, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { sound } from '../utils/audio';

interface SaltoSpecialMinigameModalProps {
  onFinish: (points: number, narrativeText: string) => void;
}

export const SaltoSpecialMinigameModal: React.FC<SaltoSpecialMinigameModalProps> = ({
  onFinish
}) => {
  const [phase, setPhase] = useState<'QUESTION' | 'RESULT'>('QUESTION');
  const [variant, setVariant] = useState<SpecialVariant | null>(null);
  const [trivia, setTrivia] = useState<WorldFootballTrivia | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Initialize random variant and random trivia question on mount
  useEffect(() => {
    sound.playEventAlert();

    // Pick 1 of the 3 variants at random
    const randomVariantIndex = Math.floor(Math.random() * SPECIAL_VARIANTS.length);
    const chosenVariant = SPECIAL_VARIANTS[randomVariantIndex];
    setVariant(chosenVariant);

    // Pick 1 of the trivia questions at random
    const randomTriviaIndex = Math.floor(Math.random() * SPECIAL_FOOTBALL_TRIVIA.length);
    const chosenTrivia = SPECIAL_FOOTBALL_TRIVIA[randomTriviaIndex];
    setTrivia(chosenTrivia);

    // Randomize option order (50/50 chance)
    const randomized = Math.random() > 0.5 
      ? [chosenTrivia.correctAnswer, chosenTrivia.wrongAnswer] 
      : [chosenTrivia.wrongAnswer, chosenTrivia.correctAnswer];
    setOptions(randomized);
  }, []);

  const handleSelectOption = (choice: string) => {
    if (!trivia || phase !== 'QUESTION') return;
    const correct = choice === trivia.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      sound.playSuccess();
    } else {
      sound.playFail();
    }

    setPhase('RESULT');
  };

  const handleFinalize = () => {
    if (!variant) return;
    sound.playClick();
    const points = isCorrect ? variant.pointsSuccess : variant.pointsFailure;
    const text = isCorrect 
      ? variant.successText 
      : `${variant.failureText} (La correcta era: ${trivia?.correctAnswer})`;
    onFinish(points, text);
  };

  if (!variant || !trivia) return null;

  return (
    <div 
      id="salto-special-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/90 backdrop-blur-md select-none overflow-hidden animate-fadeIn"
    >
      <div 
        id="salto-special-card"
        className="w-full max-w-sm sm:max-w-xl md:max-w-2xl rounded-2xl p-3 sm:p-5 border border-amber-500/40 bg-[#0c0e12] shadow-2xl relative overflow-hidden my-auto"
      >
        {/* Ambient top glowing line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.7)]" />

        {/* PHASE 1: QUESTION */}
        {phase === 'QUESTION' && (
          <div className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-5 sm:items-center animate-fadeIn">
            {/* BIG COMIC IMAGE CONTAINER */}
            <div className="sm:col-span-6 md:col-span-6 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-[220px] sm:max-w-none aspect-square sm:aspect-auto sm:h-[260px] md:h-[290px] rounded-xl overflow-hidden bg-black/70 border-2 border-amber-500/30 shadow-xl flex items-center justify-center p-1 group">
                <img
                  src={variant.image}
                  alt="Evento Especial"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain image-pixelated drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/85 backdrop-blur-sm border border-amber-400/40 text-[10px] font-mono-code font-bold text-amber-300 uppercase tracking-wider shadow">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                  <span>EVENTO ESPECIAL</span>
                </div>
              </div>
            </div>

            {/* CONTENT & TRIVIA */}
            <div className="sm:col-span-6 md:col-span-6 flex flex-col justify-center space-y-3 min-w-0">
              {/* Narrative description */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-white/95 text-xs sm:text-sm leading-relaxed font-sans font-medium">
                {variant.funnyDescription}
              </div>

              {/* Trivia Block */}
              <div className="rounded-xl p-3 bg-white/[0.04] border border-white/15 space-y-2.5">
                <div className="text-[10px] font-mono-code text-amber-400/90 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                  <span>⚽</span>
                  <span>PREGUNTA DE FÚTBOL</span>
                </div>

                <div className="text-sm font-display font-bold text-white leading-snug">
                  {trivia.question}
                </div>

                {/* 2 Choices */}
                <div className="gap-2 pt-0.5">
                  {options.map((option, idx) => (
                    <button
                      key={idx}
                      id={`salto-special-option-${idx}`}
                      onClick={() => handleSelectOption(option)}
                      className="w-full py-2.5 sm:py-3 px-2 rounded-xl bg-white/[0.08] hover:bg-amber-400 hover:text-black border border-white/20 text-white font-display font-black text-xs uppercase tracking-tight transition-all active:scale-[0.98] shadow cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 group"
                    >
                      <span className="truncate w-full font-bold">{option}</span>
                      <span className="text-[9px] font-mono-code opacity-60 group-hover:opacity-100">
                        OPCIÓN {idx === 0 ? 'A' : 'B'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 2: RESULT */}
        {phase === 'RESULT' && (
          <div className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-5 sm:items-center py-1 animate-fadeIn">
            {/* IMAGE PREVIEW */}
            <div className="sm:col-span-6 md:col-span-6 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-[200px] sm:max-w-none aspect-square sm:aspect-auto sm:h-[260px] md:h-[290px] rounded-xl overflow-hidden bg-black/70 border-2 border-white/10 shadow-lg flex items-center justify-center p-1">
                <img
                  src={variant.image}
                  alt={variant.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain image-pixelated opacity-80"
                />
              </div>
            </div>

            {/* RESOLUTION CONTENT */}
            <div className="sm:col-span-6 md:col-span-6 flex flex-col space-y-3 justify-center min-w-0">
              {/* Outcome Banner */}
              <div
                className={`p-3.5 sm:p-4 rounded-xl border text-center flex flex-col items-center justify-center ${
                  isCorrect
                    ? 'bg-[#052219] border-emerald-500/40 text-emerald-400'
                    : 'bg-[#260c11] border-rose-500/40 text-rose-400'
                }`}
              >
                <div className="inline-flex items-center gap-1.5 text-xs font-mono-code font-bold uppercase tracking-wider">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>¡CORRECTO!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>INCORRECTO</span>
                    </>
                  )}
                </div>

                <div className="text-2xl sm:text-3xl font-black font-display tracking-tight leading-none my-1">
                  {isCorrect ? `+${variant.pointsSuccess}` : variant.pointsFailure}{' '}
                  {Math.abs(isCorrect ? variant.pointsSuccess : variant.pointsFailure) === 1
                    ? 'PUNTO'
                    : 'PUNTOS'}
                </div>

                <div
                  className={`text-[10px] font-mono-code uppercase tracking-widest ${
                    isCorrect ? 'text-emerald-400/80' : 'text-rose-400/80'
                  }`}
                >
                  APLICADOS AL PUNTAJE FINAL
                </div>
              </div>

              {/* Resolution Text Card */}
              <div className="p-3 rounded-xl bg-[#14171c] border border-white/10 text-xs sm:text-sm text-white/90 leading-relaxed font-sans font-medium text-left space-y-1">
                <p>
                  {isCorrect ? variant.successText : variant.failureText}
                </p>
                {!isCorrect && (
                  <p className="text-[12px] font-mono-code text-white/60 pt-1 border-t border-white/10">
                    La respuesta correcta era:{' '}
                    <span className="text-amber-400 font-bold">{trivia.correctAnswer}</span>.
                  </p>
                )}
              </div>

              {/* Action Button */}
              <button
                id="salto-special-finish-btn"
                onClick={handleFinalize}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-[0.99] shadow-lg cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4 fill-black text-black" />
                <span>VER PUNTAJE FINAL</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
