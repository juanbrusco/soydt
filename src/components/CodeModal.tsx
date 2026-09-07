import React, { useState } from 'react';
import { X, KeyRound, Play, AlertCircle, ShieldCheck } from 'lucide-react';
import { decodeRunCode, DecodedRunCode } from '../utils/seedCode';
import { getFormationsByMode } from '../data/formations';
import { sound } from '../utils/audio';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWithCode: (decoded: DecodedRunCode) => void;
}

export const CodeModal: React.FC<CodeModalProps> = ({
  isOpen,
  onClose,
  onStartWithCode,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<DecodedRunCode | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (val: string) => {
    setInputCode(val);
    setError(null);
    if (!val.trim()) {
      setPreview(null);
      return;
    }
    const decoded = decodeRunCode(val.trim());
    if (decoded) {
      setPreview(decoded);
      setError(null);
    } else {
      setPreview(null);
      if (val.trim().length >= 8) {
        setError('Código de run no válido o corrupto.');
      }
    }
  };

  const handleStart = () => {
    if (!preview) {
      const decoded = decodeRunCode(inputCode.trim());
      if (decoded) {
        sound.playClick();
        onStartWithCode(decoded);
        onClose();
      } else {
        setError('Ingresá un código válido para comenzar.');
      }
      return;
    }
    sound.playClick();
    onStartWithCode(preview);
    onClose();
  };

  const getModeLabel = (mode: string) => {
    if (mode === 'FUTBOL11') return 'FÚTBOL 11 (4-3-3)';
    return 'FÚTBOL 5 (1-2-1)';
  };

  const getFormationName = (decoded: DecodedRunCode) => {
    const formations = getFormationsByMode(decoded.mode);
    const form = formations[decoded.formationIndex] || formations[0];
    return form.name;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] tracking-[0.25em] uppercase font-bold text-[#38BDF8]">
              GESTIÓN DE SEED
            </p>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-display">
              Cargar Código de Run
            </h3>
          </div>
        </div>

        {/* Input */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold uppercase tracking-widest font-mono-code text-white/60 mb-2">
            Ingresá el código alfanumérico:
          </label>
          <input
            type="text"
            value={inputCode}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="SDT-11-3A4B-5C6D8"
            className="w-full px-4 py-3.5 bg-[#050505] border border-white/20 focus:border-[#38BDF8] rounded-xl text-white font-mono-code text-sm tracking-widest focus:outline-none uppercase"
            autoFocus
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-4 font-mono-code">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Preview Card */}
        {preview && (
          <div className="p-4 rounded-xl bg-[#050505] border border-[#38BDF8]/40 mb-6">
            <div className="flex items-center gap-2 text-[#38BDF8] text-[11px] font-black tracking-widest font-mono-code uppercase mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>RUN VÁLIDA DETECTADA</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono-code">
              <div>
                <span className="text-white/40 block text-[10px] uppercase tracking-wider">Modo:</span>
                <span className="text-white font-bold">{getModeLabel(preview.mode)}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px] uppercase tracking-wider">Formación:</span>
                <span className="text-white font-bold">{getFormationName(preview)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/70 font-bold uppercase tracking-wider text-xs font-display transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleStart}
            disabled={!preview}
            className={`flex-1 py-3.5 rounded-xl font-black font-display uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all ${
              preview
                ? 'bg-[#38BDF8] hover:bg-[#7dd3fc] text-black shadow-lg shadow-[#38BDF8]/20'
                : 'bg-white/[0.04] text-white/30 border border-white/5 cursor-not-allowed'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>INICIAR RUN</span>
          </button>
        </div>
      </div>
    </div>
  );
};


