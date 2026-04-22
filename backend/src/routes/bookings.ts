import { Router } from 'express';
import { supabase } from '../supabaseClient';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { data, error } = await supabase
    .from('reservas')
    .select('*, horarios(*, clases(*))')
    .eq('perfil_id', userId)
    .order('fecha_reserva', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { horario_id, fecha_reserva } = req.body;

  const { data, error } = await supabase.rpc('book_class', {
    p_perfil_id: userId,
    p_horario_id: horario_id,
    p_fecha_reserva: fecha_reserva,
  });

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ reserva_id: data });
});

router.patch('/:id/cancelar', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  const { error } = await supabase
    .from('reservas')
    .update({ estado: 'cancelada' })
    .eq('id', id)
    .eq('perfil_id', userId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Reserva cancelada' });
});

export default router;