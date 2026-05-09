import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/bookings
// Obtiene todas las reservas del usuario autenticado, ordenadas por fecha.
// Incluye los datos de la clase asociada (join con tabla clases).
router.get('/', requireAuth, async (req, res) => {
  const supabase = (req as any).supabase;
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


// POST /api/bookings
// Crea una nueva reserva llamando a la función RPC reservar_clase.
// La función controla duplicados, capacidad máxima y existencia del perfil/clase.
router.post('/', requireAuth, async (req, res) => {
  const supabase = (req as any).supabase;
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


// PATCH /api/bookings/:id/cancel
// Cancela una reserva del usuario autenticado cambiando su estado a 'cancelada'.
// Solo puede cancelar sus propias reservas (filtra por perfil_id).
router.patch('/:id/cancel', requireAuth,
  async (req, res) => {
    const supabase = (req as any).supabase;
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
