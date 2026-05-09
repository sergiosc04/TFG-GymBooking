import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/classes
// Lista todas las clases disponibles con el nombre del instructor.
// Incluye el número de reservas confirmadas para hoy (campo reservas_hoy)
// para que el frontend pueda mostrar el aforo en tiempo real.
router.get('/', requireAuth, async (req, res) => {
  const supabase = (req as any).supabase;
  const { data: clases, error } = await supabase
    .from('clases')
    .select('*, instructor:perfiles(nombre_completo)')
    .order('nombre');

  if (error) return res.status(500).json({ error: error.message });

  // Obtener conteo de reservas de hoy
  const hoy = new Date().toISOString().split('T')[0];
  const { data: conteos } = await supabase.rpc('contar_reservas_clase', {
    p_fecha: hoy,
  });

  // Mapear conteos a cada clase
  const conteosMap = new Map(
    (conteos || []).map((c: any) => [c.clase_id, Number(c.total)])
  );

  const clasesConAforo = (clases || []).map((clase: any) => ({
    ...clase,
    reservas_hoy: conteosMap.get(clase.id) || 0,
  }));

  res.json(clasesConAforo);
});

// GET /api/classes/:id
// Obtiene el detalle de una clase por su ID, incluyendo instructor
// y el número de reservas confirmadas para hoy.
router.get('/:id', requireAuth, async (req, res) => {
  const supabase = (req as any).supabase;
  const { id } = req.params;

  const { data, error } = await supabase
    .from('clases')
    .select('*, instructor:perfiles(nombre_completo)')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ error: 'Clase no encontrada' });

  // Conteo de reservas de hoy para esta clase
  const hoy = new Date().toISOString().split('T')[0];
  const { data: conteos } = await supabase.rpc('contar_reservas_clase', {
    p_fecha: hoy,
  });

  const conteo = (conteos || []).find((c: any) => c.clase_id === id);

  res.json({
    ...data,
    reservas_hoy: conteo ? Number(conteo.total) : 0,
  });
});

export default router;
