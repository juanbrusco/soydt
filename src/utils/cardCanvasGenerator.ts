import { Formation, Player, RankingTier } from '../types/game';

interface CardData {
  playerName: string;
  score: number;
  formation: Formation;
  rankingTier: RankingTier;
  runCode?: string;
  selectedPlayers: (Player | null)[];
  friendRoomResult?: { roomName: string; rank: number; totalPlayers: number } | null;
}

export async function generateTacticalCard(data: CardData): Promise<HTMLCanvasElement> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#090d10');
  bg.addColorStop(1, '#05080a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Outer border
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 3;
  ctx.strokeRect(14, 14, W - 28, H - 28);

  // ── HEADER ──────────────────────────────────────────
  const modeLabel =
    data.formation.mode === 'FUTBOL11_SALTO' ? 'LIGA SALTEÑA' :
    data.formation.mode === 'FUTBOL5' ? 'FÚTBOL 5' : 'FÚTBOL 11 GLOBAL';

  ctx.fillStyle = '#10b981';
  ctx.fillRect(56, 48, 6, 34);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('SOYDT', 74, 65);

  ctx.fillStyle = '#10b981';
  ctx.font = '700 14px monospace';
  ctx.fillText('// TACTICAL BOARD', 208, 65);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 14px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(modeLabel, W - 56, 65);

  // Divider
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(56, 100);
  ctx.lineTo(W - 56, 100);
  ctx.stroke();

  // ── DT NAME & SCORE ──────────────────────────────────
  const name = (data.playerName || 'DIRECTOR TÉCNICO').toUpperCase();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 40px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`DT. ${name}`, 56, 158);

  ctx.fillStyle = '#64748b';
  ctx.font = '600 17px system-ui, sans-serif';
  const subtitle = `${data.formation.name}${data.runCode ? `  •  #${data.runCode}` : ''}`;
  ctx.fillText(subtitle, 56, 190);

  // Score box (right)
  const sbX = W - 56 - 240, sbY = 118, sbW = 240, sbH = 82;
  const sg = ctx.createLinearGradient(sbX, sbY, sbX + sbW, sbY + sbH);
  sg.addColorStop(0, 'rgba(16,185,129,0.15)');
  sg.addColorStop(1, 'rgba(6,78,59,0.3)');
  roundRect(ctx, sbX, sbY, sbW, sbH, 12);
  ctx.fillStyle = sg;
  ctx.fill();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#10b981';
  ctx.font = '800 13px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PUNTAJE FINAL', sbX + sbW / 2, sbY + 26);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 34px monospace';
  ctx.fillText(`${data.score} PTS`, sbX + sbW / 2, sbY + 58);

  // Ranking tier pill
  const tierY = 204;
  roundRect(ctx, 56, tierY, 170, 34, 8);
  ctx.fillStyle = '#10b981';
  ctx.fill();
  ctx.fillStyle = '#022c22';
  ctx.font = '900 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(data.rankingTier.title.toUpperCase(), 141, tierY + 17);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '500 15px system-ui, sans-serif';
  ctx.textAlign = 'left';
  const comment = data.rankingTier.comment ?? '';
  ctx.fillText(comment.length > 62 ? comment.slice(0, 60) + '…' : comment, 238, tierY + 17);

  // Friend room badge
  let pitchTop = 252;
  if (data.friendRoomResult) {
    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 15px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `🏆 SALA ${data.friendRoomResult.roomName}: PUESTO #${data.friendRoomResult.rank} / ${data.friendRoomResult.totalPlayers}`,
      56, 246
    );
    pitchTop = 272;
  }

  // ── PITCH ─────────────────────────────────────────────
  const px = 56, pw = W - 112;
  const ph = 960;
  const py = pitchTop;

  // Turf
  const turf = ctx.createLinearGradient(px, py, px, py + ph);
  turf.addColorStop(0, '#064e3b');
  turf.addColorStop(0.5, '#043629');
  turf.addColorStop(1, '#022c22');
  roundRect(ctx, px, py, pw, ph, 18);
  ctx.fillStyle = turf;
  ctx.fill();

  // Stripes
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, px, py, pw, ph, 18);
  ctx.clip();
  const sc = 8;
  for (let i = 0; i < sc; i += 2) {
    ctx.fillStyle = 'rgba(255,255,255,0.022)';
    ctx.fillRect(px, py + (i / sc) * ph, pw, ph / sc);
  }

  // Field lines
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2.5;
  const ins = 28;
  ctx.strokeRect(px + ins, py + ins, pw - ins * 2, ph - ins * 2);

  const midY = py + ph / 2;
  const cx = px + pw / 2;
  ctx.beginPath(); ctx.moveTo(px + ins, midY); ctx.lineTo(px + pw - ins, midY); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, midY, 84, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.arc(cx, midY, 5, 0, Math.PI * 2); ctx.fill();

  // Penalty areas
  const bw = 320, bh = 140, sbw = 150, sbh = 56;
  ctx.strokeRect(cx - bw / 2, py + ins, bw, bh);
  ctx.strokeRect(cx - sbw / 2, py + ins, sbw, sbh);
  ctx.strokeRect(cx - bw / 2, py + ph - ins - bh, bw, bh);
  ctx.strokeRect(cx - sbw / 2, py + ph - ins - sbh, sbw, sbh);

  ctx.beginPath(); ctx.arc(cx, py + ins + bh, 56, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, py + ph - ins - bh, 56, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke();

  ctx.restore();

  // ── PLAYERS ───────────────────────────────────────────
  const pitchInner = { x: px + ins, y: py + ins, w: pw - ins * 2, h: ph - ins * 2 };

  data.formation.slots.forEach((slot, idx) => {
    const player = data.selectedPlayers[idx];
    const dotX = pitchInner.x + (slot.gridX / 100) * pitchInner.w;
    const dotY = pitchInner.y + (slot.gridY / 100) * pitchInner.h;

    const isHigh = player && player.ovr >= 90;
    const isMid = player && player.ovr >= 85;

    const dotColor = !player ? '#1e293b' :
      isHigh ? '#fbbf24' : isMid ? '#38bdf8' : '#10b981';
    const textColor = !player ? '#475569' :
      isHigh ? '#000000' : '#000000';

    // Circle
    ctx.beginPath();
    ctx.arc(dotX, dotY, 28, 0, Math.PI * 2);
    ctx.fillStyle = dotColor;
    ctx.fill();
    if (player) {
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // OVR or position
    ctx.fillStyle = textColor;
    ctx.font = player ? '900 18px monospace' : '700 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player ? String(player.ovr) : slot.position, dotX, dotY);

    // Player last name below
    if (player) {
      const lastName = player.name.split(' ').pop() ?? player.name;
      const displayName = lastName.length > 9 ? lastName.slice(0, 8) + '.' : lastName;
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 15px system-ui, sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(displayName.toUpperCase(), dotX, dotY + 32);
    }
  });

  // ── FOOTER ────────────────────────────────────────────
  ctx.fillStyle = '#64748b';
  ctx.font = '700 14px monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('soydt.app • armá tu equipo', W - 56, py + ph + 34);

  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('canvas toBlob failed')), 'image/png');
  });
}

export async function downloadCard(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  const blob = await canvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Helper: roundRect polyfill
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
}
