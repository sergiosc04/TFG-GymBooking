import { Router } from 'express';
import { isServiceRoleKeyConfigured, supabaseAdmin, supabaseAuth } from '../supabaseClient';
import { requireAuth } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
// Registro de nuevo usuario con email y contraseña.
// Los metadatos (nombre_completo, telefono) se pasan a Supabase Auth
// y el trigger on_auth_user_created crea el perfil automáticamente.
router.post('/register', async (req, res) => {
  const { email, password, nombre_completo, telefono } = req.body;

  const { data, error } = await supabaseAuth.auth.signUp({
    email,
    password,
    options: {
      data: { nombre_completo, telefono },
    },
  });

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json({ user: data.user, session: data.session });
});

// POST /api/auth/login
// Inicio de sesión con email y contraseña.
// Devuelve el usuario y la sesión con el token JWT.
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data.user, session: data.session });
});

// GET /api/auth/profile
// Obtiene los datos del perfil del usuario autenticado desde la tabla perfiles.
// Se usa para cargar los datos actuales en la pantalla de datos personales.
router.get('/profile', requireAuth, async (req, res) => {
  const supabase = (req as any).supabase;
  const userId = (req as any).user.id;

  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return res.status(404).json({ error: 'Perfil no encontrado' });
  res.json(data);
});

// PUT /api/auth/profile
// Actualiza nombre_completo y telefono del perfil del usuario autenticado.
// Se llama desde la pantalla de datos personales al pulsar "Guardar cambios".
router.put('/profile', requireAuth, async (req, res) => {
  const supabase = (req as any).supabase;
  const userId = (req as any).user.id;
  const { nombre_completo, telefono } = req.body;

  const { error } = await supabase
    .from('perfiles')
    .update({ nombre_completo, telefono })
    .eq('id', userId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Perfil actualizado correctamente' });
});

// PUT /api/auth/password
// Cambia la contraseña del usuario autenticado.
// Se llama desde la pantalla de cambiar contraseña.
// Usa la API admin de Supabase para actualizar la contraseña por ID de usuario.
router.put('/password', requireAuth, async (req, res) => {
  const { password } = req.body;

  if (!isServiceRoleKeyConfigured) {
    return res.status(500).json({
      error:
        'SUPABASE_SERVICE_ROLE_KEY no está configurada (service_role). No se puede cambiar la contraseña desde el backend.',
    });
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    (req as any).user.id,
    { password }
  );

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Contraseña actualizada correctamente' });
});

export default router;