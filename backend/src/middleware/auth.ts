import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabaseClient';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: 'Token inválido' });

  (req as any).user = data.user;
  next();
}