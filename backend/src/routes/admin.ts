import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';

const router = Router();

// Multer en memoria para recibir imágenes sin guardarlas en disco
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  },
});


// ============================================================
// CRUD DE CLASES
// ============================================================

// GET /api/admin/classes
// Lista todas las clases con instructor para el panel de admin.
router.get('/classes', requireAuth, requireAdmin, async (_req, res) => {
  const supabase = (_req as any).supabase;
  const { data, error } = await supabase
    .from('clases')
    .select('*, instructor:perfiles(nombre_completo)')
    .order('nombre');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/admin/classes
// Crea una nueva clase. Campos: nombre, descripcion, instructor_id,
// duracion_min, capacidad_max, horario, sala.
router.post('/classes', requireAuth, requireAdmin, async (req, res) => {
  const supabase = (req as any).supabase;
  const { nombre, descripcion, instructor_id, duracion_min, capacidad_max, horario, sala } = req.body;

  const { data, error } = await supabase
    .from('clases')
    .insert({
      nombre,
      descripcion,
      instructor_id: instructor_id || null,
      duracion_min: duracion_min || 60,
      capacidad_max: capacidad_max || 20,
      horario,
      sala,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// PUT /api/admin/classes/:id
// Actualiza una clase existente por su ID.
router.put('/classes/:id', requireAuth, requireAdmin, async (req, res) => {
  const supabase = (req as any).supabase;
  const { id } = req.params;
  const { nombre, descripcion, instructor_id, duracion_min, capacidad_max, horario, sala } = req.body;

  const { data, error } = await supabase
    .from('clases')
    .update({
      nombre,
      descripcion,
      instructor_id: instructor_id || null,
      duracion_min,
      capacidad_max,
      horario,
      sala,
    })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Clase no encontrada' });
  res.json(data);
});

// DELETE /api/admin/classes/:id
// Elimina una clase por su ID. También elimina su imagen del Storage si existe.
router.delete('/classes/:id', requireAuth, requireAdmin, async (req, res) => {
  const supabase = (req as any).supabase;
  const { id } = req.params;

  // Primero obtener la clase para saber si tiene imagen
  const { data: clase } = await supabase
    .from('clases')
    .select('url_imagen')
    .eq('id', id)
    .single();

  // Eliminar imagen del storage si existe
  if (clase?.url_imagen && clase.url_imagen.includes('clases-imagenes')) {
    const path = clase.url_imagen.split('/clases-imagenes/')[1];
    if (path) {
      await supabase.storage.from('clases-imagenes').remove([path]);
    }
  }

  // Eliminar reservas asociadas primero (FK constraint)
  await supabase.from('reservas').delete().eq('clase_id', id);

  const { error } = await supabase.from('clases').delete().eq('id', id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Clase eliminada correctamente' });
});


// ============================================================
// SUBIDA DE IMAGEN
// ============================================================

// POST /api/admin/classes/:id/image
// Sube una imagen para una clase al bucket 'clases-imagenes' de Supabase Storage.
// La imagen se envía como multipart/form-data con campo 'image'.
// Actualiza el campo url_imagen de la clase con la URL pública.
router.post('/classes/:id/image', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
  const supabase = (req as any).supabase;
  const { id } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No se ha enviado ninguna imagen' });

  // Generar nombre único para el archivo
  const ext = file.originalname.split('.').pop() || 'jpg';
  const fileName = `${id}_${Date.now()}.${ext}`;

  // Eliminar imagen anterior si existe
  const { data: clase } = await supabase
    .from('clases')
    .select('url_imagen')
    .eq('id', id)
    .single();

  if (clase?.url_imagen && clase.url_imagen.includes('clases-imagenes')) {
    const oldPath = clase.url_imagen.split('/clases-imagenes/')[1];
    if (oldPath) {
      await supabase.storage.from('clases-imagenes').remove([oldPath]);
    }
  }

  // Subir nueva imagen
  const { error: uploadError } = await supabase.storage
    .from('clases-imagenes')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) return res.status(500).json({ error: uploadError.message });

  // Obtener URL pública
  const { data: publicUrl } = supabase.storage
    .from('clases-imagenes')
    .getPublicUrl(fileName);

  // Actualizar la clase con la URL
  const { error: updateError } = await supabase
    .from('clases')
    .update({ url_imagen: publicUrl.publicUrl })
    .eq('id', id);

  if (updateError) return res.status(500).json({ error: updateError.message });

  res.json({ url_imagen: publicUrl.publicUrl });
});


// ============================================================
// GESTIÓN DE SOCIOS
// ============================================================

// GET /api/admin/members
// Lista todos los perfiles registrados para la gestión de socios.
router.get('/members', requireAuth, requireAdmin, async (_req, res) => {
  const supabase = (_req as any).supabase;
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .order('fecha_creacion', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PUT /api/admin/members/:id/role
// Cambia el rol de un socio (socio/admin).
router.put('/members/:id/role', requireAuth, requireAdmin, async (req, res) => {
  const supabase = (req as any).supabase;
  const { id } = req.params;
  const { rol } = req.body;

  if (!['socio', 'admin'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido. Debe ser socio o admin.' });
  }

  const { error } = await supabase
    .from('perfiles')
    .update({ rol })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Rol actualizado correctamente' });
});


export default router;
