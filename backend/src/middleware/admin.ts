import type { Request, Response, NextFunction } from 'express';

// Middleware que verifica que el usuario autenticado tiene rol 'admin'.
// Debe usarse DESPUÉS de requireAuth (necesita req.user).
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user?.id;
  const supabase = (req as any).supabase;

  if (!userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client no inicializado (requireAuth debe ejecutarse antes)' });
  }

  const { data, error } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data || data.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }

  next();
}
