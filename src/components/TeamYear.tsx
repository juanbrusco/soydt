import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Clock, RotateCw, Search, Trophy, Users, X } from 'lucide-react';
import { sound } from '../utils/audio';
import { submitTeamYearResult } from '../utils/globalRecords';
import { DeterministicRNG } from '../utils/rng';
import { FriendRoom } from '../types/game';

interface Props {
  playerName: string;
  onBack: () => void;
  friendRoom?: FriendRoom; // si viene, se juega en la sala: fotos fijas por su runCode
  onFinish?: (total: number) => void;
  friendRoomResult?: { roomCode: string; roomName: string; rank: number; totalPlayers: number } | null;
  onOpenFriendRoom?: (code: string) => void;
}

interface Team { id: number; equipo: string; liga: string }
interface Photo { image: string; teamId: number; year: number }
interface RoundResult { photo: Photo; teamGuess: Team | null; yearGuess: string; points: number }

const ROUNDS = 5;
const SECONDS = 15;
const TRANSITION_MS = 1500;

// Fotos en src/assets/teamyear con nombre <team_id>_<año>.<ext> (team_id = id en team_year_teams)
const PHOTOS: Photo[] = Object.entries(
  import.meta.glob('../assets/teamyear/*.{jpg,jpeg,png,webp,svg}', { eager: true, import: 'default' }) as Record<string, string>
).flatMap(([path, image]) => {
  const match = path.match(/\/(\d+)_(\d{4})\.\w+$/);
  return match ? [{ image, teamId: Number(match[1]), year: Number(match[2]) }] : [];
});

// Con semilla (sala de amigos) todos reciben las mismas fotos en el mismo orden
const pickPhotos = (seed?: string): Photo[] =>
  (seed ? new DeterministicRNG(seed).shuffle(PHOTOS) : [...PHOTOS].sort(() => Math.random() - 0.5)).slice(0, ROUNDS);

// Logos en src/assets/teamlogos/<team_id>.png (team_id = id en team_year_teams)
const LOGOS: Record<number, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/teamlogos/*.png', { eager: true, import: 'default' }) as Record<string, string>
  ).flatMap(([path, url]) => {
    const match = path.match(/\/(\d+)\.png$/);
    return match ? [[Number(match[1]), url]] : [];
  })
);

// Logo del equipo o, si no hay archivo, sus iniciales
const TeamLogo: React.FC<{ team: Team; size?: string }> = ({ team, size = 'w-9 h-9' }) =>
  LOGOS[team.id] ? (
    <img src={LOGOS[team.id]} alt="" className={`${size} object-contain flex-shrink-0`} />
  ) : (
    <span className={`${size} rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[11px] font-black text-white/70 flex-shrink-0`}>
      {team.equipo.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
    </span>
  );

// 1000 por equipo correcto; año: 1000 menos 25 por cada año de diferencia (mínimo 0, sin año = 0)
const scoreRound = (photo: Photo, guessedTeam: Team | null, yearGuess: string) =>
  (guessedTeam?.id === photo.teamId ? 1000 : 0) +
  (yearGuess.length === 4 ? Math.max(0, 1000 - 25 * Math.abs(Number(yearGuess) - photo.year)) : 0);

export const TeamYear: React.FC<Props> = ({ playerName, onBack, friendRoom, onFinish, friendRoomResult, onOpenFriendRoom }) => {
  const [round, setRound] = useState(0);
  const [roundPhotos, setRoundPhotos] = useState<Photo[]>(() => pickPhotos(friendRoom?.runCode));
  const [timeLeft, setTimeLeft] = useState(SECONDS);
  const [teamGuess, setTeamGuess] = useState<Team | null>(null);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [teamSearch, setTeamSearch] = useState('');
  const [yearGuess, setYearGuess] = useState('');
  const [results, setResults] = useState<RoundResult[]>([]);
  const [changing, setChanging] = useState(false); // overlay de cambio de foto
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    fetch('/api/team-year/teams')
      .then(res => res.json())
      .then(data => setTeams(data.teams || []))
      .catch(() => {});
  }, []);

  const submittedRef = useRef(false);

  const rounds = roundPhotos.length; // menos de ROUNDS si no hay suficientes fotos
  const finished = results.length === rounds;
  const photo = roundPhotos[round];
  const total = results.reduce((sum, r) => sum + r.points, 0);

  useEffect(() => {
    if (!finished || submittedRef.current) return;
    submittedRef.current = true;
    sound.playWhistle(); // pitazo final, igual que FinalSummary
    submitTeamYearResult(playerName, total);
    onFinish?.(total);
  }, [finished]);

  useEffect(() => {
    if (finished || changing) return;
    if (timeLeft > 0) {
      if (timeLeft <= 5) sound.playBombBeep(timeLeft === 1);
      const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
      return () => clearTimeout(t);
    }
    sound.playExplosion();
    setTeamModalOpen(false);
    setChanging(true);
  }, [timeLeft, finished, changing]);

  // Tras el overlay se puntúa la foto y se pasa a la siguiente (o al resultado final)
  useEffect(() => {
    if (!changing) return;
    const t = setTimeout(() => {
      setResults(r => [...r, { photo, teamGuess, yearGuess, points: scoreRound(photo, teamGuess, yearGuess) }]);
      if (round < rounds - 1) {
        setRound(r => r + 1);
        setTimeLeft(SECONDS);
        setTeamGuess(null);
        setYearGuess('');
        setConfirmed(false);
      }
      setChanging(false);
    }, TRANSITION_MS);
    return () => clearTimeout(t);
  }, [changing]);

  const openTeamModal = () => {
    sound.playClick();
    setTeamSearch('');
    setTeamModalOpen(true);
  };

  const chooseTeam = (team: Team) => {
    sound.playClick();
    setTeamGuess(team);
    setTeamModalOpen(false);
  };

  // Equipos filtrados por la búsqueda (nombre o liga)
  const search = teamSearch.trim().toLowerCase();
  const filteredTeams = teams.filter(
    t => !search || t.equipo.toLowerCase().includes(search) || t.liga.toLowerCase().includes(search)
  );

  const restart = () => {
    sound.playClick();
    submittedRef.current = false;
    setRoundPhotos(pickPhotos());
    setRound(0);
    setResults([]);
    setTeamGuess(null);
    setYearGuess('');
    setConfirmed(false);
    setTimeLeft(SECONDS);
  };

  return (
    <div className="w-full max-w-md mx-auto py-1 flex flex-col gap-3 animate-fadeIn">
      <button
        onClick={onBack}
        className="self-start inline-flex items-center gap-2 text-xs font-mono-code font-bold uppercase text-white/50 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      {friendRoom && (
        <div className="w-full py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-black border border-emerald-500/30 text-emerald-400 text-xs font-mono-code font-bold flex items-center justify-between">
          <span className="flex items-center gap-2 truncate">
            <span className="text-amber-400">🏆</span>
            <span className="uppercase truncate text-white">{friendRoom.name}</span>
          </span>
          <span className="flex-shrink-0">DT: {playerName}</span>
        </div>
      )}

      {finished ? (
        <div className="rounded-2xl bg-[#0a0a0a] border border-white/15 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 justify-center">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-black font-display uppercase">{total} PTS</h2>
          </div>
          <ul className="flex flex-col gap-2">
            {results.map((r, i) => {
              const teamOk = r.teamGuess?.id === r.photo.teamId;
              const yearOk = r.yearGuess === String(r.photo.year);
              const rowColor = teamOk && yearOk
                ? 'bg-emerald-500/10 border-emerald-500/25'
                : r.points > 0 ? 'bg-amber-500/10 border-amber-500/25' : 'bg-rose-500/10 border-rose-500/25';
              return (
                <li key={i} className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${rowColor}`}>
                  <span className="flex-1 min-w-0">
                    <span className="block text-base font-black font-display uppercase text-white truncate">
                      {teams.find(t => t.id === r.photo.teamId)?.equipo ?? '?'} <span className="text-amber-300">{r.photo.year}</span>
                    </span>
                    <span className="block text-sm font-mono-code text-white/50 truncate">
                      Tú: <span className={teamOk ? 'text-emerald-400' : 'text-rose-400'}>{r.teamGuess?.equipo ?? '—'}</span>{' '}
                      <span className={yearOk ? 'text-emerald-400' : 'text-rose-400'}>{r.yearGuess || '—'}</span>
                    </span>
                  </span>
                  <span className="text-lg font-black font-display text-white">{r.points}</span>
                </li>
              );
            })}
          </ul>
          {friendRoom ? (
            // En sala: un solo intento, se muestra la posición y se vuelve a la tabla
            <>
              {friendRoomResult && (
                <div className="text-center text-xs font-mono-code uppercase text-white/50">
                  Posición en la sala{' '}
                  <span className="text-xl font-display font-black text-amber-300">#{friendRoomResult.rank}</span>
                  <span className="text-white/40"> / {friendRoomResult.totalPlayers}</span>
                </div>
              )}
              <button
                onClick={() => { sound.playClick(); onOpenFriendRoom?.(friendRoom.code); }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-400 text-black hover:bg-emerald-300 font-black font-display text-xs uppercase"
              >
                <Users className="w-4 h-4" /> Ver tabla de la sala
              </button>
            </>
          ) : (
            <button
              onClick={restart}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-[#38BDF8] font-black font-display text-xs uppercase"
            >
              <RotateCw className="w-4 h-4" /> Jugar de nuevo
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs font-mono-code font-bold uppercase">
            <span className="text-white/50">Foto {round + 1}/{rounds}</span>
            <span className={`inline-flex items-center gap-1.5 ${timeLeft <= 5 ? 'text-rose-400' : 'text-amber-400'}`}>
              <Clock className="w-4 h-4" /> {timeLeft}s
            </span>
          </div>

          {/* Las fotos ya vienen con la camiseta difuminada y sin color.
              Alto = viewport menos el resto de la pantalla (~340px: controles + footer) para que nunca haya scroll */}
          <div key={round} className={`relative w-full ${friendRoom ? 'h-[calc(100dvh-385px)]' : 'h-[calc(100dvh-340px)]'} min-h-[180px] max-h-[520px] rounded-2xl overflow-hidden border border-white/15 bg-black`}>
            <div className="w-full h-full animate-teamyear-photo-in">
              <img src={photo.image} alt="Jugador" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono-code font-bold uppercase text-white/50">Equipo</label>
            <button
              onClick={openTeamModal}
              disabled={changing}
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 hover:border-[#38BDF8] flex items-center gap-3 text-left transition-colors"
            >
              {teamGuess ? (
                <>
                  <TeamLogo team={teamGuess} size="w-7 h-7" />
                  <span className="flex-1 text-base font-bold text-white truncate">{teamGuess.equipo}</span>
                </>
              ) : (
                <span className="flex-1 text-base font-bold text-white/50 uppercase">Elegir equipo</span>
              )}
              <ChevronRight className="w-4 h-4 text-white/40" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono-code font-bold uppercase text-white/50">Año</label>
            <div className="flex gap-2">
            <input
              value={yearGuess}
              onChange={e => setYearGuess(e.target.value.replace(/\D/g, '').slice(0, 4))}
              disabled={changing}
              inputMode="numeric"
              maxLength={4}
              placeholder="AAAA"
              autoComplete="off"
              className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-base text-white font-mono-code tracking-[0.3em] focus:border-[#38BDF8] outline-none"
            />
            {/* Solo visual: la ronda sigue hasta que termine el tiempo */}
            <button
              onClick={() => { sound.playClick(); setConfirmed(true); }}
              disabled={changing || confirmed}
              aria-label="Confirmar"
              className={`w-14 flex-shrink-0 rounded-xl flex items-center justify-center transition-colors ${
                confirmed ? 'bg-white/10 text-white/50 cursor-default' : 'bg-emerald-500 hover:bg-emerald-400 text-black'
              }`}
            >
              {confirmed ? <Clock className="w-5 h-5 animate-spin" /> : <Check className="w-6 h-6" strokeWidth={3} />}
            </button>
            </div>
          </div>

          {/* Modal de equipos: anclado arriba y con alto fijo para que no se mueva al filtrar */}
          {teamModalOpen && (
            <div
              className="fixed inset-0 z-40 flex items-start justify-center px-3 pt-[8dvh] bg-black/70 backdrop-blur-sm animate-fadeIn"
              onClick={() => setTeamModalOpen(false)}
            >
              <div
                className="w-full sm:max-w-md h-[60dvh] flex flex-col rounded-2xl bg-[#0a0a0a] border border-white/15 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-4 border-b border-white/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black font-display uppercase tracking-wider text-white">Elegir equipo</h3>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-mono-code font-bold ${timeLeft <= 5 ? 'text-rose-400' : 'text-amber-400'}`}>
                      <Clock className="w-4 h-4" /> {timeLeft}s
                      <button onClick={() => setTeamModalOpen(false)} className="ml-2 text-white/50 hover:text-white" aria-label="Cerrar">
                        <X className="w-5 h-5" />
                      </button>
                    </span>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={teamSearch}
                      onChange={e => setTeamSearch(e.target.value)}
                      placeholder="Buscar equipo o liga..."
                      autoComplete="off"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-base text-white focus:border-[#38BDF8] outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto p-2">
                  {filteredTeams.length === 0 ? (
                    <p className="text-xs font-mono-code text-white/30 text-center py-6">Sin resultados</p>
                  ) : (
                    filteredTeams.map(t => (
                          <button
                            key={t.id}
                            onClick={() => chooseTeam(t)}
                            className={`w-full px-2 py-2.5 rounded-xl flex items-center gap-3 text-left hover:bg-[#38BDF8]/10 transition-colors ${
                              teamGuess?.id === t.id ? 'bg-[#38BDF8]/15' : ''
                            }`}
                          >
                            <TeamLogo team={t} />
                            <span className="flex-1 min-w-0">
                              {/* Nombre difuminado: hay que guiarse por escudo y liga */}
                              <span className="block text-sm font-bold text-white truncate blur-[4px] select-none" aria-hidden>{t.equipo}</span>
                              <span className="block text-[11px] text-white/40 truncate">{t.liga}</span>
                            </span>
                          </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cambio de foto: toda la pantalla en gris con aviso */}
          {changing && (
            <div className="fixed inset-0 z-50 flex items-center backdrop-grayscale backdrop-blur-sm bg-black/50 animate-fadeIn">
              <div className="w-full py-5 animate-teamyear-banner bg-amber-400 text-black text-center font-black font-display uppercase shadow-2xl">
                <div className="text-3xl tracking-wider">¡TIEMPO!</div>
                <div className="text-sm font-mono-code tracking-widest">
                  {round < rounds - 1 ? `Siguiente: foto ${round + 2}/${rounds}` : 'Calculando puntaje...'}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
