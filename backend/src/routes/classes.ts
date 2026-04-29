import { Router } from 'express';
import { supabase } from '../supabaseClient';
import { requireAuth } from '../middleware/auth';


const router = Router();


// GET /api/classes — Listar todas las clases
router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('clases')
    .select('*, instructor:perfiles(nombre_completo)')
    .order('nombre');


  if (error) return res.status(500).json(
    { error: error.message }
  );
  res.json(data);
});


// GET /api/classes/:id — Detalle de una clase
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;


  const { data, error } = await supabase
    .from('clases')
    .select('*, instructor:perfiles(nombre_completo)')
    .eq('id', id)
    .single();


  if (error) return res.status(404).json(
    { error: 'Clase no encontrada' }
  );
  res.json(data);
});


export default router;
