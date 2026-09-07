import React, { useState } from 'react';
import { GameMode, ModeRecord } from '../types/game';
import { Volume2, VolumeX, Users, Shield, Flame, Home, MapPin, Info } from 'lucide-react';
import { sound } from '../utils/audio';
import { InfoDisclaimerModal } from './InfoDisclaimerModal';

interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  isGameInProgress: boolean;
  bestRecord: ModeRecord | null;
  lastRun: ModeRecord | null;
  onOpenCodeModal?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  eventsEnabled: boolean;
  onToggleEvents: () => void;
  isHome?: boolean;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  isGameInProgress,
  bestRecord,
  isMuted,
  onToggleMute,
  eventsEnabled,
  onToggleEvents,
  isHome = false,
  onGoHome,
}) => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleModeChange = (mode: GameMode) => {
    if (mode === currentMode && !isHome) return;
    sound.playClick();
    onSelectMode(mode);
  };

  const handleHomeClick = () => {
    if (isHome) return;
    sound.playClick();
    if (onGoHome) onGoHome();
  };

  return (
    <header className="w-full bg-[#050505]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 px-4 py-3.5">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-baseline gap-3">
            <button
              onClick={handleHomeClick}
              className="text-left group transition-transform active:scale-95"
              title="Volver a la pantalla de inicio"
            >
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-white font-display flex items-center gap-1.5">
                SoyDT<span className="text-[#38BDF8]">!</span>
              </h1>
            </button>
            <div className="h-3 w-[1px] bg-white/20 hidden sm:inline-block"></div>
          </div>

          {/* Mobile Quick Controls: Flame (Quilombo events) and Sound Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              id="header-home-toggle-desktop"
              onClick={handleHomeClick}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 hover:text-white"
              title={'Volver al inicio'}
            >
              <Home className="w-4 h-4 text-[#38BDF8]" />
            </button>
            
            {/* Quilombo Events Toggle Button (Fueguito) */}
            <button
              onClick={onToggleEvents}
              className={`p-2 rounded-xl border transition-all ${eventsEnabled
                ? 'bg-orange-500/10 border-orange-500/40 text-orange-400'
                : 'bg-white/[0.04] border-white/10 text-white/30'
                }`}
              title={
                eventsEnabled
                  ? 'Eventos QUILOMBO: ACTIVADOS (Click para desactivar)'
                  : 'Eventos QUILOMBO: DESACTIVADOS (Click para activar)'
              }
            >
              <div className="relative flex items-center justify-center">
                <Flame className={`w-4 h-4 ${eventsEnabled ? 'text-orange-400 fill-orange-400/20' : 'text-white/30'}`} />
                {!eventsEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-5 h-[1.5px] bg-rose-500 rotate-45 rounded-full" />
                  </div>
                )}
              </div>
            </button>

            {/* Sound Mute Toggle */}
            <button
              id="header-mute-toggle-mobile"
              onClick={onToggleMute}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 hover:text-white"
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#38BDF8]" />}
            </button>

            {/* Info Disclaimer Modal Button */}
            <button
              id="header-info-button-mobile"
              onClick={() => {
                sound.playClick();
                setIsInfoModalOpen(true);
              }}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Información sobre puntajes y valoraciones"
            >
              <Info className="w-4 h-4 text-[#38BDF8]" />
            </button>
          </div>
        </div>

        {/* Center: Mode Indicator & Return to Home Button */}
        {/* {!isHome ? (
          <div className="flex items-center justify-between sm:justify-center gap-2 w-full md:w-auto">
            <div className="px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono-code font-bold uppercase text-white/90 flex items-center gap-2">
              {currentMode === 'FUTBOL11_SALTO' ? (
                <>
                  <MapPin className="w-4 h-4 text-[#38BDF8]" />
                  <span>FÚTBOL 11 SALTO</span>
                </>
              ) : currentMode === 'FUTBOL11' ? (
                <>
                  <Users className="w-4 h-4 text-[#38BDF8]" />
                  <span>FÚTBOL 11</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-[#38BDF8]" />
                  <span>FÚTBOL 5</span>
                </>
              )}
            </div>

            {onGoHome && (
              <button
                onClick={handleHomeClick}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-white/30 text-white text-xs font-mono-code font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm"
                title="Volver al menú inicial"
              >
                <Home className="w-4 h-4 text-[#38BDF8]" />
                <span>VOLVER AL INICIO</span>
              </button>
            )}
          </div>
        ) : (
            <span></span>
        )} */}

        {/* Desktop Technical Info & Actions */}
        <div className="hidden md:flex items-center gap-3">

          {/* Go Gome */}
          <button
            id="header-home-toggle-desktop"
            onClick={handleHomeClick}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white transition-colors"
            title={'Volver al inicio'}
          >
            <Home className="w-4 h-4 text-[#38BDF8]" />
          </button>

          {/* Quilombo Events Toggle Button (Fueguito) */}
          <button
            onClick={onToggleEvents}
            className={`p-2 rounded-xl border transition-all ${eventsEnabled
              ? 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/40 text-orange-400'
              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/30'
              }`}
            title={
              eventsEnabled
                ? 'Eventos QUILOMBO: ACTIVADOS (Click para desactivar)'
                : 'Eventos QUILOMBO: DESACTIVADOS (Click para activar)'
            }
          >
            <div className="relative flex items-center justify-center">
              <Flame className={`w-4 h-4 ${eventsEnabled ? 'text-orange-400 fill-orange-400/20' : 'text-white/30'}`} />
              {!eventsEnabled && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-5 h-[1.5px] bg-rose-500 rotate-45 rounded-full" />
                </div>
              )}
            </div>
          </button>

          {/* Sound Mute Toggle */}
          <button
            id="header-mute-toggle-desktop"
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white transition-colors"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#38BDF8]" />}
          </button>

          {/* Info Disclaimer Modal Button */}
          <button
            id="header-info-button-desktop"
            onClick={() => {
              sound.playClick();
              setIsInfoModalOpen(true);
            }}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Información sobre puntajes y valoraciones"
          >
            <Info className="w-4 h-4 text-[#38BDF8]" />
          </button>
        </div>
      </div>

      {/* Info Disclaimer Modal */}
      <InfoDisclaimerModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </header>
  );
};



