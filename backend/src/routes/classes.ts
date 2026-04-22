import { Router } from 'express';
import { supabase } from '../supabaseClient';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('clases')
    .select('*')
    .order('nombre');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/:id/horarios', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('horarios')
    .select('*')
    .eq('clase_id', id)
    .eq('activo', true)
    .order('dia_semana')
    .order('hora_inicio');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;