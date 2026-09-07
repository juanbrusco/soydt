import React, { useEffect, useRef, useState } from 'react';
import { X, Download, Share2, MessageCircle, Copy, Check, Loader2 } from 'lucide-react';
import { Formation, Player, RankingTier } from '../types/game';
import { generateTacticalCard, canvasToBlob, downloadCard } from '../utils/cardCanvasGenerator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  score: number;
  formation: Formation;
  rankingTier: RankingTier;
  runCode?: string;
  selectedPlayers: (Player | null)[];
  friendRoomResult?: { roomCode: string; roomName: string; rank: number; totalPlayers: number } | null;
}

export const ShareCardModal: React.FC<Props> = ({
  isOpen, onClose, playerName, score, formation, rankingTier, runCode, selectedPlayers, friendRoomResult,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const cardData = { playerName, score, formation, rankingTier, runCode, selectedPlayers, friendRoomResult };
  const filename = `soydt_${(playerName || 'dt').toLowerCase().replace(/[^a-z0-9]/g, '_')}_${score}pts.png`;

  useEffect(() => {
    if (!isOpen) { setPreviewUrl(null); return; }
    setLoading(true);
    generateTacticalCard(cardData).then(canvas => {
      canvasRef.current = canvas;
      setPreviewUrl(canvas.toDataURL('image/png'));
      setLoading(false);
    }).catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    await downloadCard(canvasRef.current, filename);
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    const blob = await canvasToBlob(canvasRef.current);
    const file = new File([blob], filename, { type: 'image/png' });
    const text = `⚽ ¡Armé mi equipo en SoyDT!\n🗂️ Formación: ${formation.name}\n🥇 Puntaje: ${score} PTS (${rankingTier.title})\n👉 ${window.location.origin}`;

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ title: 'Mi Táctica - SoyDT', text, files: [file] }); return; }
      catch { /* fallthrough */ }
    }
    // Fallback: WhatsApp
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    await downloadCard(canvasRef.current, filename);
  };

  const handleWhatsApp = () => {
    const text = `⚽ ¡Armé mi equipo en SoyDT!\n🗂️ Formación: ${formation.name}\n🥇 Puntaje: ${score} PTS (${rankingTier.title})\n👉 ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await canvasToBlob(canvasRef.current);
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API not supported — fallback to download
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-black text-white text-base sm:text-lg leading-tight font-display uppercase">
              Tarjeta Táctica
            </h3>
            <p className="text-xs text-slate-400">Lista para compartir en WhatsApp, redes o descargar</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center min-h-[200px]">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-mono-code uppercase tracking-wider">Generando tarjeta...</span>
            </div>
          ) : previewUrl ? (
            <img src={previewUrl} alt="Tarjeta táctica" className="w-full rounded-xl border border-slate-700/60 shadow-lg" />
          ) : (
            <p className="text-slate-500 text-sm">No se pudo generar la tarjeta.</p>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-800 grid grid-cols-2 gap-2 shrink-0">
          <button
            onClick={handleShare}
            disabled={loading}
            className="col-span-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            COMPARTIR
          </button>

          <button
            onClick={handleWhatsApp}
            disabled={loading}
            className="py-3 px-3 rounded-xl bg-[#25d366]/15 hover:bg-[#25d366]/25 border border-[#25d366]/30 disabled:opacity-50 text-[#25d366] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            WHATSAPP
          </button>

          <button
            onClick={handleDownload}
            disabled={loading}
            className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            DESCARGAR
          </button>

          <button
            onClick={handleCopy}
            disabled={loading}
            className="col-span-2 py-2.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {copied ? <><Check className="w-4 h-4 text-emerald-400" /> IMAGEN COPIADA</> : <><Copy className="w-4 h-4" /> COPIAR IMAGEN</>}
          </button>
        </div>
      </div>
    </div>
  );
};
