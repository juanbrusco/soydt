import { GameMode } from '../types/game';

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
  viewport: string;
  isMobile: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  touchSupport: boolean;
  isPWA: boolean;
  hardwareConcurrency?: number;
  deviceMemory?: number;
}

/**
 * Recolecta información no invasiva del dispositivo del jugador para fines estadísticos.
 */
export function collectDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      userAgent: '',
      platform: '',
      language: '',
      screenResolution: '',
      viewport: '',
      isMobile: false,
      deviceType: 'desktop',
      touchSupport: false,
      isPWA: false,
    };
  }

  const ua = navigator.userAgent || '';
  const isMobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTouch = (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
  const isTablet = /(iPad|Tablet|(Android(?!.*Mobile)))/i.test(ua) || (isTouch && window.innerWidth >= 600 && window.innerWidth <= 1024);
  const isMobile = isMobileUA || (isTouch && window.innerWidth < 600);
  const deviceType: 'mobile' | 'tablet' | 'desktop' = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  const isPWA = 
    window.matchMedia?.('(display-mode: standalone)')?.matches || 
    (navigator as any).standalone === true;

  return {
    userAgent: ua,
    platform: navigator.platform || '',
    language: navigator.language || '',
    screenResolution: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    isMobile: isMobile || isTablet,
    deviceType,
    touchSupport: isTouch,
    isPWA,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory,
  };
}

export interface SaveStatPayload {
  mode: GameMode;
  username: string;
  score?: number;
  formationName?: string;
  runCode?: string;
}

/**
 * Envía las estadísticas de la partida al backend de manera 100% silenciosa y no bloqueante.
 * Si falla, no hay internet o hay timeout, continúa normalmente sin mostrar ningún mensaje de error al usuario.
 */
export async function sendGameStatSilently(payload: SaveStatPayload): Promise<void> {
  try {
    const deviceInfo = collectDeviceInfo();
    const cleanUsername = (payload.username || 'DT').trim().toUpperCase();

    const body = {
      mode: payload.mode,
      username: cleanUsername,
      score: payload.score,
      formationName: payload.formationName,
      runCode: payload.runCode,
      deviceInfo,
    };

    // Usar keepalive para asegurar que el request se complete sin importar si se cambia de pantalla
    fetch('/api/stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {
      // Falla silenciosa esperada cuando no hay internet
    });
  } catch {
    // Falla silenciosa esperada
  }
}
