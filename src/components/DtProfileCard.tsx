import React, { useState, useEffect } from 'react';
import { RunHistoryItem } from '../types/game';
import { UserCheck, Edit3, Check, Clock, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { sound } from '../utils/audio';

interface DtProfileCardProps {
  playerName: string;
  onSavePlayerName: (newName: string) => Promise<boolean> | void;
  recentRuns: RunHistoryItem[];
  autoEdit?: boolean;
}

export const DtProfileCard: React.FC<DtProfileCardProps> = ({
  playerName,
  onSavePlayerName,
  recentRuns,
  autoEdit = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (autoEdit) setIsEditing(true);
  }, [autoEdit]);
  const [inputName, setInputName] = useState(playerName);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleStartEdit = () => {
    sound.playClick();
    setInputName(playerName);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setInputName(playerName);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputName.trim().slice(0, 30).toUpperCase() || 'DT';
    setIsSaving(true);
    try {
      await onSavePlayerName(clean);
      sound.playClick();
      setSavedSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      // Ignore
    } finally {
      setIsSaving(false);
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'FUTBOL11_SALTO':
        return 'SALTO (11)';
      case 'FUTBOL11':
        return 'FÚTBOL 11';
      case 'FUTBOL5':
        return 'FÚTBOL 5';
      default:
        return mode;
    }
  };

  return (
    <div
      id="dt-profile-welcome-card"
      className="w-full rounded-2xl bg-[#0a0a0a] border border-white/10 p-4 sm:p-5 shadow-xl transition-all relative overflow-hidden"
    >
      {/* Ambient highlight line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#38BDF8]/40 to-transparent" />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Left Side: Avatar & Name Editor */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center flex-shrink-0 text-[#38BDF8]">
            <UserCheck className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[13px] font-mono-code font-bold uppercase tracking-[0.2em] text-[#38BDF8]">
                INGRESÁ TU NOMBRE
              </span>
              {savedSuccess && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono-code font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 animate-fadeIn">
                  <Check className="w-3 h-3" /> ¡ACTUALIZADO!
                </span>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleFormSubmit} className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  autoFocus
                  maxLength={25}
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value.toUpperCase())}
                  placeholder="APODO DE DT"
                  className="bg-black/80 border border-[#38BDF8] rounded-lg px-2.5 py-1 text-xs font-mono-code font-bold uppercase text-white tracking-wider focus:outline-none w-35 sm:w-45"
                  style={{ fontSize: '16px' }}
                />
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-2.5 py-1 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-black font-mono-code font-bold text-[12px] uppercase transition-all flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaving ? '...' : 'OK'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-[12px] font-mono-code uppercase transition-all"
                >
                  ✕
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2.5">
                <h3 className="text-base sm:text-lg font-black bg-white/20 uppercase font-display tracking-tight text-white truncate">
                  {playerName || 'PEP GUARDIOLA'}
                </h3>
                <button
                  id="dt-edit-name-btn"
                  onClick={handleStartEdit}
                  className="p-2 rounded-md text-[#38BDF8] hover:text-[#38BDF8] hover:bg-white/5 transition-colors cursor-pointer"
                  title="Cambiar apodo de DT"
                >
                  <Edit3 className="w-4.5 h-4.5" />
                </button>
              </div>
            )}
            <p className="text-[14px] truncate">
              {isEditing ? 'Nombre que figurará en el ranking' : 'Nombre para récords y partidas'}
            </p>
          </div>
        </div>

        {/* Right Side: Toggle Historial Reciente */}
        {/*<div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
          <button
            id="dt-toggle-history-btn"
            onClick={() => {
              sound.playClick();
              setShowHistory(!showHistory);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono-code font-bold uppercase tracking-wider flex items-center gap-2 border transition-all cursor-pointer ${
              showHistory
                ? 'bg-[#38BDF8]/15 border-[#38BDF8]/40 text-[#38BDF8]'
                : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-white/70 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>ÚLTIMAS PARTIDAS ({recentRuns.length})</span>
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>*/}
      </div>

      {/* Accordion: Historial de últimas 5 formaciones jugadas */}
      {showHistory && (
        <div className="mt-4 pt-4 border-t border-white/10 animate-fadeIn">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-mono-code uppercase tracking-[0.2em] text-white/40 font-bold">
              HISTORIAL RECIENTE PERSONAL (ÚLTIMAS {recentRuns.length})
            </span>
            <span className="text-[11px] font-mono-code text-white/30">
              Formación • Rango • Puntaje
            </span>
          </div>

          {recentRuns.length === 0 ? (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs font-mono-code text-white/40">
              Todavía no completaste partidas en este navegador. ¡Elegí un modo y armá tu primer 11!
            </div>
          ) : (
            <div className="space-y-2">
              {recentRuns.map((run, idx) => (
                <div
                  key={run.id || idx}
                  className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 flex items-center justify-between gap-3 transition-colors text-xs font-mono-code"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-white/30 font-bold text-[12px] w-4 text-center">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white uppercase truncate">
                          {run.formationName || '4-3-3'}
                        </span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/[0.05] text-[#38BDF8] border border-white/10 uppercase">
                          {getModeLabel(run.mode)}
                        </span>
                        {run.eventsEnabled === false && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase">
                            SIN QUILOMBOS
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-white/40 flex items-center gap-2 mt-0.5 truncate">
                        <span>{run.date}</span>
                        <span>•</span>
                        <span className="text-white/60 truncate">{run.rankingTierTitle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 text-right">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-sm font-black text-white font-mono-code">
                      {run.score}
                    </span>
                    <span className="text-[11px] text-white/40">PTS</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
