import type { Request, Response, NextFunction } from 'express';
import { createSupabaseUserClient, isServiceRoleKeyConfigured, supabaseAdmin, supabaseAuth } from '../supabaseClient';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '') : undefined;
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: 'Token inválido' });

  (req as any).user = data.user;
  (req as any).supabase = isServiceRoleKeyConfigured ? supabaseAdmin : createSupabaseUserClient(token);
  next();
}