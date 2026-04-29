import { Router } from 'express';
import { supabase } from '../supabaseClient';
import { requireAuth } from '../middleware/auth';


const router = Router();


// GET /api/bookings — Mis reservas
router.get('/', requireAuth, async (req, res) => {
  const userId = (req as any).user.id;


  const { data, error } = await supabase
    .from('reservas')
    .select('*, clases(*)')
    .eq('perfil_id', userId)
    .order('fecha_reserva', { ascending: false });


  if (error) return res.status(500).json(
    { error: error.message }
  );
  res.json(data);
});


// POST /api/bookings — Crear reserva
router.post('/', requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { clase_id, fecha_reserva } = req.body;


  const { data, error } = await supabase.rpc(
    'reservar_clase',
    {
      p_perfil_id: userId,
      p_clase_id: clase_id,
      p_fecha_reserva: fecha_reserva,
    }
  );


  if (error) return res.status(400).json(
    { error: error.message }
  );
  res.status(201).json({ booking_id: data });
});


// PATCH /api/bookings/:id/cancel — Cancelar
router.patch('/:id/cancel', requireAuth,
  async (req, res) => {
    const { id } = req.params;
    const userId = (req as any).user.id;


    const { error } = await supabase
      .from('reservas')
      .update({ estado: 'cancelada' })
      .eq('id', id)
      .eq('perfil_id', userId);


    if (error) return res.status(500).json(
      { error: error.message }
    );
    res.json({ message: 'Reserva cancelada' });
  }
);


export default router;
