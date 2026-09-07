import { app } from '../server/app';

/**
 * Entrada Serverless para Vercel.
 * Vercel redirige todas las llamadas /api/* hacia este handler,
 * el cual ejecuta la app de Express en modo serverless sin necesidad de un servidor persistente.
 */
export default function handler(req: any, res: any) {
  return app(req, res);
}

export { app };
