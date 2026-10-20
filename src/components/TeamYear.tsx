import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Clock, RotateCw, Trophy } from 'lucide-react';
import { sound } from '../utils/audio';
import { submitTeamYearResult } from '../utils/globalRecords';

interface Props {
  playerName: string;
  onBack: () => void;
}

interface Team { id: number; equipo: string; liga: string }
interface Photo { image: string; teamId: number; year: number }
interface RoundResult { photo: Photo; teamGuess: string; yearGuess: number; points: number }

const ROUNDS = 5;
const SECONDS = 15;
const MIN_YEAR = 1900;
const MAX_YEAR = 2026;

// Fotos en src/assets/teamyear con nombre <team_id>_<año>.<ext> (team_id = id en team_year_teams)
const PHOTOS: Photo[] = Object.entries(
  import.meta.glob('../assets/teamyear/*.{jpg,jpeg,png,webp,svg}', { eager: true, import: 'default' }) as Record<string, string>
).flatMap(([path, image]) => {
  const match = path.match(/\/(\d+)_(\d{4})\.\w+$/);
  return match ? [{ image, teamId: Number(match[1]), year: Number(match[2]) }] : [];
});

const pickPhotos = (): Photo[] => [...PHOTOS].sort(() => Math.random() - 0.5).slice(0, ROUNDS);

const findTeam = (teams: Team[], name: string) =>
  teams.find(t => t.equipo.toLowerCase() === name.trim().toLowerCase());

// 1000 por equipo correcto; año: 1000 menos la diferencia absoluta (mínimo 0)
const scoreRound = (photo: Photo, guessedTeam: Team | undefined, yearGuess: number) =>
  (guessedTeam?.id === photo.teamId ? 1000 : 0) +
  Math.max(0, 1000 - Math.abs(yearGuess - photo.year));

export const TeamYear: React.FC<Props> = ({ playerName, onBack }) => {
  const [round, setRound] = useState(0);
  const [roundPhotos, setRoundPhotos] = useState<Photo[]>(pickPhotos);
  const [timeLeft, setTimeLeft] = useState(SECONDS);
  const [teamGuess, setTeamGuess] = useState('');
  const [yearGuess, setYearGuess] = useState(1990);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [teamListOpen, setTeamListOpen] = useState(false);
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
  const filteredTeams = teams.filter(t => t.equipo.toLowerCase().includes(teamGuess.trim().toLowerCase()));
  const total = results.reduce((sum, r) => sum + r.points, 0);

  useEffect(() => {
    if (!finished || submittedRef.current) return;
    submittedRef.current = true;
    submitTeamYearResult(playerName, total);
  }, [finished]);

  useEffect(() => {
    if (finished) return;
    if (timeLeft > 0) {
      if (timeLeft <= 5) sound.playBombBeep(timeLeft === 1);
      const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
      return () => clearTimeout(t);
    }
    setResults(r => [...r, { photo, teamGuess, yearGuess, points: scoreRound(photo, findTeam(teams, teamGuess), yearGuess) }]);
    if (round < rounds - 1) {
      setRound(r => r + 1);
      setTimeLeft(SECONDS);
      setTeamGuess('');
      setYearGuess(1990);
    }
  }, [timeLeft, finished]);

  const restart = () => {
    sound.playClick();
    submittedRef.current = false;
    setRoundPhotos(pickPhotos());
    setRound(0);
    setResults([]);
    setTeamGuess('');
    setYearGuess(1990);
    setTimeLeft(SECONDS);
  };

  return (
    <div className="w-full max-w-md mx-auto py-4 flex flex-col gap-5 animate-fadeIn">
      <button
        onClick={onBack}
        className="self-start inline-flex items-center gap-2 text-xs font-mono-code font-bold uppercase text-white/50 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      {finished ? (
        <div className="rounded-2xl bg-[#0a0a0a] border border-white/15 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 justify-center">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-black font-display uppercase">{total} PTS</h2>
          </div>
          <ul className="flex flex-col gap-2 text-xs font-mono-code">
            {results.map((r, i) => (
              <li key={i} className="flex justify-between gap-2 border-b border-white/10 pb-2">
                <span className="text-white/60">
                  {teams.find(t => t.id === r.photo.teamId)?.equipo ?? '?'} {r.photo.year}
                  <span className="block text-white/30">Tu respuesta: {r.teamGuess || '—'} {r.yearGuess}</span>
                </span>
                <span className="font-black text-white">{r.points}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={restart}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-[#38BDF8] font-black font-display text-xs uppercase"
          >
            <RotateCw className="w-4 h-4" /> Jugar de nuevo
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs font-mono-code font-bold uppercase">
            <span className="text-white/50">Foto {round + 1}/{rounds}</span>
            <span className={`inline-flex items-center gap-1.5 ${timeLeft <= 5 ? 'text-rose-400' : 'text-amber-400'}`}>
              <Clock className="w-4 h-4" /> {timeLeft}s
            </span>
          </div>

          {/* Las fotos ya vienen con la camiseta difuminada y sin color */}
          <div key={round} className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-white/15">
            <div className="w-full h-full animate-teamyear-photo-in">
              <img src={photo.image} alt="Jugador" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 flex items-center pointer-events-none">
              <div className="w-full py-3 animate-teamyear-banner bg-amber-400 text-black text-center font-black font-display text-2xl uppercase tracking-wider shadow-2xl">
                FOTO {round + 1}/{rounds}
              </div>
            </div>
          </div>

          {/* Combobox propio: el popup nativo de <datalist> no se puede estilizar */}
          <div className="relative flex flex-col gap-1.5">
            <label className="text-[11px] font-mono-code font-bold uppercase text-white/50">Equipo</label>
            <input
              value={teamGuess}
              onChange={e => { setTeamGuess(e.target.value); setTeamListOpen(true); }}
              onFocus={() => setTeamListOpen(true)}
              onBlur={() => setTeamListOpen(false)}
              placeholder="Buscá el equipo..."
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-sm text-white focus:border-[#38BDF8] outline-none"
            />
            {teamListOpen && filteredTeams.length > 0 && (
              <ul className="absolute top-full mt-1 z-20 w-full max-h-56 overflow-y-auto rounded-xl bg-[#0a0a0a] border border-white/15 shadow-2xl">
                {filteredTeams.map(t => (
                  <li
                    key={t.equipo}
                    onMouseDown={e => { e.preventDefault(); setTeamGuess(t.equipo); setTeamListOpen(false); }}
                    className={`px-3 py-2 flex justify-between gap-3 cursor-pointer text-sm hover:bg-[#38BDF8]/15 ${
                      t.equipo === teamGuess ? 'text-[#38BDF8]' : 'text-white'
                    }`}
                  >
                    <span className="font-bold">{t.equipo}</span>
                    <span className="text-[11px] font-mono-code text-white/40">{t.liga}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[11px] font-mono-code font-bold uppercase text-white/50">
              <span>Año</span>
              <span className="text-2xl font-black text-white font-display">{yearGuess}</span>
            </div>
            <input
              type="range"
              min={MIN_YEAR}
              max={MAX_YEAR}
              value={yearGuess}
              onChange={e => { setYearGuess(Number(e.target.value)); sound.playTick(); }}
              className="w-full accent-[#38BDF8]"
            />
            <div className="flex justify-between text-[10px] font-mono-code text-white/30">
              <span>{MIN_YEAR}</span><span>{MAX_YEAR}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
