import React, { useState, useEffect } from 'react';
import { FriendRoom, GameMode } from '../types/game';
import {
  Trophy,
  Users,
  Share2,
  Copy,
  Check,
  X,
  Play,
  Plus,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Trash2
} from 'lucide-react';
import {
  createRoomAsync,
  getRoomAsync,
  deleteRoomAsync,
  removeRecentRoom,
  getShareableRoomUrl,
  getWhatsAppShareLink,
  getRecentRooms,
  SavedRoomRef
} from '../utils/friendRooms';
import { sound } from '../utils/audio';

interface FriendRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string | null;
  currentDtName: string;
  onStartRoomMatch: (room: FriendRoom, playerName: string) => void;
}

export const FriendRoomModal: React.FC<FriendRoomModalProps> = ({
  isOpen,
  onClose,
  initialCode,
  currentDtName,
  onStartRoomMatch,
}) => {
  const [tab, setTab] = useState<'VIEW' | 'CREATE' | 'JOIN'>(initialCode ? 'VIEW' : 'CREATE');
  const [activeRoom, setActiveRoom] = useState<FriendRoom | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Form states
  const [createName, setCreateName] = useState<string>('El Trofeo de la Fecha');
  const [createMode, setCreateMode] = useState<'FUTBOL11' | 'FUTBOL11_SALTO'>('FUTBOL11_SALTO');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [recentRooms, setRecentRooms] = useState<SavedRoomRef[]>([]);

  useEffect(() => {
    if (isOpen) {
      setRecentRooms(getRecentRooms());
      if (initialCode) {
        handleLoadRoom(initialCode);
      }
    }
  }, [isOpen, initialCode]);

  const handleLoadRoom = async (code: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await getRoomAsync(code);
      if (res.success && res.room) {
        setActiveRoom(res.room);
        setTab('VIEW');
      } else {
        setErrorMessage(res.error === 'SALA_NO_ENCONTRADA' ? 'La sala no existe o el código es incorrecto.' : 'Error al cargar la sala.');
      }
    } catch {
      setErrorMessage('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = createName.trim() || 'El Trofeo de la Fecha';
    const cleanNick = currentDtName.trim().toUpperCase() || 'DT';

    setIsLoading(true);
    setErrorMessage(null);
    sound.playClick();

    try {
      const res = await createRoomAsync({
        name: cleanName,
        mode: createMode,
        createdBy: cleanNick,
      });

      if (res.success && res.room) {
        sound.playSuccess();
        setActiveRoom(res.room);
        setTab('VIEW');
        setRecentRooms(getRecentRooms());
      } else {
        setErrorMessage(res.error || 'Error creando la sala.');
      }
    } catch {
      setErrorMessage('Error de conexión al crear sala.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinByCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!cleanCode) return;
    sound.playClick();
    await handleLoadRoom(cleanCode);
  };

  const handleCopyLink = () => {
    if (!activeRoom) return;
    sound.playClick();
    const url = getShareableRoomUrl(activeRoom.code);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyCode = () => {
    if (!activeRoom) return;
    sound.playClick();
    navigator.clipboard.writeText(activeRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDeleteRoom = async () => {
    if (!activeRoom) return;
    setIsDeleting(true);
    setErrorMessage(null);
    sound.playClick();
    try {
      const res = await deleteRoomAsync(activeRoom.code);
      if (res.success) {
        sound.playSuccess();
        removeRecentRoom(activeRoom.code);
        setActiveRoom(null);
        setShowDeleteConfirm(false);
        setRecentRooms(getRecentRooms());
        setTab('CREATE');
      } else {
        setErrorMessage(res.error || 'Error al eliminar la sala.');
      }
    } catch {
      setErrorMessage('Error de conexión al eliminar la sala.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePlayMatch = () => {
    if (!activeRoom) return;
    const cleanNick = currentDtName.trim().toUpperCase();
    if (!cleanNick) {
      setErrorMessage('Configurá tu nombre de DT en la pantalla principal para participar.');
      return;
    }

    // Check if player already played
    const alreadyPlayed = activeRoom.entries.some(
      (e) => e.playerName.toUpperCase() === cleanNick
    );
    if (alreadyPlayed) {
      setErrorMessage('Este apodo ya jugó su partido en esta sala. Se permite 1 solo intento por persona.');
      return;
    }

    if (activeRoom.isFull) {
      setErrorMessage('La sala ya completó su límite de 10 participantes.');
      return;
    }

    sound.playWhistle();
    onStartRoomMatch(activeRoom, cleanNick);
    onClose();
  };

  if (!isOpen) return null;

  // Check if current user already played in active room
  const currentUserEntry = activeRoom?.entries.find(
    (e) => e.playerName.toUpperCase() === currentDtName.trim().toUpperCase()
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent" />

        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg uppercase text-white tracking-tight flex items-center gap-2">
                <span>TORNEO DE AMIGOS</span>
                <span className="text-[10px]  px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  SALA PRIVADA
                </span>
              </h3>
              <p className="text-[12px] text-white/50">
                Mismas cartas y rivales. Máximo 10 amigos, 1 intento por apodo.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (if no active room is locked) */}
        <div className="flex border-b border-white/10 bg-black/40 px-4 pt-2 gap-2 text-xs  font-bold uppercase tracking-wider">
          {activeRoom && (
            <button
              onClick={() => {
                sound.playClick();
                setTab('VIEW');
              }}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${tab === 'VIEW'
                  ? 'border-[#38BDF8] text-[#38BDF8]'
                  : 'border-transparent text-white/50 hover:text-white'
                }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>TABLA DE LA SALA</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              setTab('CREATE');
            }}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${tab === 'CREATE'
                ? 'border-[#38BDF8] text-[#38BDF8]'
                : 'border-transparent text-white/50 hover:text-white'
              }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>CREAR TORNEO</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setTab('JOIN');
            }}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${tab === 'JOIN'
                ? 'border-[#38BDF8] text-[#38BDF8]'
                : 'border-transparent text-white/50 hover:text-white'
              }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>UNIRSE CON CÓDIGO</span>
          </button>
        </div>

        {/* Modal Body with Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="">{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: ACTIVE ROOM LOBBY / TABLE */}
          {tab === 'VIEW' && activeRoom && (
            <div className="space-y-5">
              {/* Room Card Header (Compact) */}
              <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 uppercase text-[11px] ">CÓDIGO:</span>
                    <button
                      onClick={handleCopyCode}
                      className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/15 text-white  font-bold text-xs tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                      title="Copiar código"
                    >
                      <span>{activeRoom.code}</span>
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-white/40" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setShowDeleteConfirm(true);
                      }}
                      disabled={isLoading || isDeleting}
                      className="text-[12px]  text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20"
                      title="Cerrar y eliminar sala"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>ELIMINAR SALA</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                  <h2 className="text-lg sm:text-xl font-black font-display uppercase tracking-tight text-white truncate">
                    {activeRoom.name}
                  </h2>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-xs  font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10 ${activeRoom.isFull ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {activeRoom.totalPlayers} / {activeRoom.maxPlayers}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirm Delete Banner */}
              {showDeleteConfirm && (
                <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 space-y-3 shadow-xl animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-display font-black uppercase text-white tracking-wider">
                        ¿Cerrar y eliminar "{activeRoom.name}"?
                      </h4>
                      <p className="text-[12px] text-white/70">
                        Esta acción cerrará la sala y borrará la tabla de posiciones con los resultados de todos los participantes. Los enlaces compartidos quedarán inactivos.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-xs  transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={handleDeleteRoom}
                      className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-display font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      {isDeleting ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>ELIMINANDO...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>SÍ, ELIMINAR SALA</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* PROMINENT ACTION: JUGAR PARTIDO (NOW HIGHLY VISIBLE AT THE TOP) */}
              <div className="space-y-2">
                {currentUserEntry ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-black to-[#38BDF8]/10 border border-emerald-500/30 text-center space-y-2 shadow-lg">
                    <div className="flex items-center justify-center gap-2 text-xs  font-bold uppercase text-emerald-400">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>¡YA JUGASTE TU PARTIDO EN ESTE TORNEO!</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-black/60 rounded-xl border border-white/5 max-w-sm mx-auto">
                      <div>
                        <span className="text-[11px]  text-white/40 uppercase block">DT</span>
                        <span className="text-xs font-display font-black text-white truncate block">
                          {currentUserEntry.playerName}
                        </span>
                      </div>
                      <div className="border-x border-white/10">
                        <span className="text-[11px]  text-white/40 uppercase block">POSICIÓN</span>
                        <span className="text-base font-display font-black text-amber-300">
                          #{currentUserEntry.rank}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px]  text-white/40 uppercase block">PUNTAJE</span>
                        <span className="text-base  font-black text-[#38BDF8]">
                          {currentUserEntry.score}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/50 ">
                      Solo se permite 1 intento por DT para garantizar juego limpio. Seguí las posiciones de tus rivales abajo.
                    </p>
                  </div>
                ) : activeRoom.isFull ? (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-1">
                    <p className="text-xs  font-bold text-rose-400">
                      Esta sala alcanzó el cupo máximo de 10 participantes.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#38BDF8]/20 via-[#0a1622] to-black border-2 border-[#38BDF8]/60 shadow-xl space-y-2.5">
                    <button
                      onClick={handlePlayMatch}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#38BDF8] via-[#60a5fa] to-[#38BDF8] hover:brightness-110 text-black font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-[#38BDF8]/25 active:scale-98 transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current stroke-[2]" />
                      <span>JUGAR MI PARTIDO EN ESTA SALA</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action: Share on WhatsApp & Copy Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={getWhatsAppShareLink(activeRoom.name, activeRoom.code, getShareableRoomUrl(activeRoom.code))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-600/20 active:scale-95 transition-all text-center"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>INVITAR POR WHATSAPP</span>
                </a>

                <button
                  onClick={handleCopyLink}
                  className="py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white  font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                      <span className="text-emerald-400">¡ENLACE COPIADO!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-white/60" />
                      <span>COPIAR LINK DINÁMICO</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleLoadRoom(activeRoom.code)}
                  disabled={isLoading}
                  className="py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white  font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                  title="Actualizar tabla"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-[#38BDF8]' : ''}`} />
                  <span>ACTUALIZAR PUNTAJES/POSICIONES</span>
                </button>
              </div>

              {/* Leaderboard Table (Position, Name, Score) */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-sm font-black uppercase text-white tracking-wider font-display flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>POSICIONES DEL TORNEO</span>
                  </h4>
                  <span className="text-[11px]  text-white/40 uppercase">
                    {activeRoom.entries.length} {activeRoom.entries.length === 1 ? 'PARTIDO JUGADO' : 'PARTIDOS JUGADOS'}
                  </span>
                </div>

                {activeRoom.entries.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                    <p className="text-xs text-white/60 ">
                      Aún nadie completó su partido en este torneo.
                    </p>
                    <p className="text-[12px] text-white/30">
                      ¡Sé el primero en armar el 11 y poner la vara alta!
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-black/60 border border-white/10 overflow-hidden divide-y divide-white/5 shadow-inner">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 px-3.5 py-2 text-[11px]  uppercase font-bold text-white/40 bg-white/[0.02]">
                      <div className="col-span-2">PUESTO</div>
                      <div className="col-span-7">DT / NOMBRE</div>
                      <div className="col-span-3 text-right">PUNTAJE</div>
                    </div>

                    {/* Table Rows */}
                    {activeRoom.entries.map((entry, idx) => {
                      const isMe = entry.playerName.toUpperCase() === currentDtName.trim().toUpperCase();
                      const rank = entry.rank || idx + 1;
                      const isFirst = rank === 1;
                      const isSecond = rank === 2;
                      const isThird = rank === 3;

                      return (
                        <div
                          key={entry.id || idx}
                          className={`grid grid-cols-12 items-center px-3.5 py-2.5 text-xs transition-colors ${isMe ? 'bg-[#38BDF8]/10 border-l-2 border-[#38BDF8]' : 'hover:bg-white/[0.02]'
                            }`}
                        >
                          {/* Rank */}
                          <div className="col-span-2  font-black flex items-center gap-1">
                            {isFirst ? (
                              <span className="text-amber-400 flex items-center gap-0.5">
                                🥇 <span className="text-[12px]">#1</span>
                              </span>
                            ) : isSecond ? (
                              <span className="text-slate-300 flex items-center gap-0.5">
                                🥈 <span className="text-[12px]">#2</span>
                              </span>
                            ) : isThird ? (
                              <span className="text-amber-600 flex items-center gap-0.5">
                                🥉 <span className="text-[12px]">#3</span>
                              </span>
                            ) : (
                              <span className="text-white/40 text-[12px]">#{rank}</span>
                            )}
                          </div>

                          {/* Player Name */}
                          <div className="col-span-7 font-display font-black uppercase text-white truncate flex items-center gap-1.5">
                            <span className={isMe ? 'text-[#38BDF8]' : 'text-white'}>{entry.playerName}</span>
                            {isMe && (
                              <span className="text-[10px]  px-1.5 py-0.2 rounded bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30">
                                VOS
                              </span>
                            )}
                          </div>

                          {/* Score */}
                          <div className="col-span-3 text-right  font-black text-sm text-white">
                            <span className={isFirst ? 'text-amber-400' : 'text-white'}>
                              {entry.score}
                            </span>
                            <span className="text-[10px] text-white/40 ml-1">PTS</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CREATE ROOM */}
          {tab === 'CREATE' && (
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-[14px]  uppercase font-bold text-white/60 mb-1.5">
                  NOMBRE DEL TORNEO
                </label>
                <input
                  type="text"
                  maxLength={40}
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Ej: El Trofeo de la Fecha, Asado de los Viernes..."
                  className="w-full bg-black/70 border border-white/20 hover:border-white/30 focus:border-[#38BDF8] rounded-xl px-4 py-2.5 text-sm  text-white placeholder:text-white/30 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[14px]  uppercase font-bold text-white/60 mb-1.5">
                  FORMATO DE JUEGO
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setCreateMode('FUTBOL11_SALTO');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${createMode === 'FUTBOL11_SALTO'
                        ? 'bg-[#38BDF8]/15 border-[#38BDF8] text-white shadow-md'
                        : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white'
                      }`}
                  >
                    <div className="font-display font-black text-xs uppercase mb-0.5">
                      FÚTBOL 11 SALTO
                    </div>
                    <div className="text-[11px]  text-[#38BDF8]">
                      4-3-3 • Liga Salto
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setCreateMode('FUTBOL11');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${createMode === 'FUTBOL11'
                        ? 'bg-[#38BDF8]/15 border-[#38BDF8] text-white shadow-md'
                        : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white'
                      }`}
                  >
                    <div className="font-display font-black text-xs uppercase mb-0.5">
                      FÚTBOL 11 CLÁSICO
                    </div>
                    <div className="text-[11px]  text-[#38BDF8]">
                      4-3-3 • Ligas del Mundo
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-[13px] text-white/50 space-y-1">
                <p>• La sala generará una semilla compartida con las mismas cartas para todos.</p>
                <p>• Podrás compartir el link directamente por WhatsApp con un solo toque.</p>
                <p>• Límite: Mínimo 2, Máximo 10 participantes, 1 intento por apodo.</p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !createName.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-[#38BDF8] hover:bg-[#7dd3fc] text-black font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:shadow-[#38BDF8]/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>CREANDO SALA...</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>CREAR SALA Y OBTENER LINK</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: JOIN BY CODE */}
          {tab === 'JOIN' && (
            <form onSubmit={handleJoinByCode} className="space-y-4">
              <div>
                <label className="block text-[14px]  uppercase font-bold text-white/60 mb-1.5">
                  CÓDIGO DE SALA (6 LETRAS O NÚMEROS)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="EJ: SALTO9"
                  className="w-full bg-black/70 border border-white/20 hover:border-white/30 focus:border-[#38BDF8] rounded-xl px-4 py-3 text-center text-lg  font-black uppercase text-white tracking-widest placeholder:text-white/20 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !joinCodeInput.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-[#38BDF8] hover:bg-[#7dd3fc] text-black font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:shadow-[#38BDF8]/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>BUSCANDO SALA...</span>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                    <span>ENTRAR A LA SALA</span>
                  </>
                )}
              </button>

              {/* Recent Rooms */}
              {recentRooms.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <span className="text-[11px]  font-bold uppercase text-white/40 block">
                    SALAS VISITADAS RECIENTEMENTE:
                  </span>
                  <div className="space-y-1.5">
                    {recentRooms.map((r) => (
                      <div
                        key={r.code}
                        className="w-full p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between text-xs transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => handleLoadRoom(r.code)}
                          className="flex-1 truncate text-left cursor-pointer mr-2 flex items-center gap-2"
                        >
                          <span className="font-display font-black uppercase text-white truncate">{r.name}</span>
                          <span className="text-[11px]  text-[#38BDF8] px-1.5 py-0.5 rounded bg-[#38BDF8]/10 flex-shrink-0">
                            {r.code}
                          </span>
                        </button>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecentRoom(r.code);
                              setRecentRooms(getRecentRooms());
                            }}
                            className="p-1 text-white/30 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Quitar del historial"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadRoom(r.code)}
                            className="p-1 text-white/40 hover:text-white transition-colors cursor-pointer"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
