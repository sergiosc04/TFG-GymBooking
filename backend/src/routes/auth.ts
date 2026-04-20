import { Router } from 'express';
import { supabase } from '../supabaseClient.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, nombre_completo, telefono } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  // Crear perfil en la tabla profiles
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      nombre_completo,
      telefono,
    });
  }

  res.status(201).json({ user: data.user, session: data.session });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ user: data.user, session: data.session });
});

export default router;