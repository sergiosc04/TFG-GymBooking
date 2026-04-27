import { Router } from 'express';
import { supabase } from '../supabaseClient';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password, nombre_completo, telefono } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  if (data.user) {
    const { error: profileError } = await supabase.from('perfiles').insert({
      id: data.user.id,
      nombre_completo,
      telefono,
    });

    if (profileError) {
      console.log('Error al crear perfil:', profileError);
      return res.status(500).json({ error: profileError.message });
    }
  }

  res.status(201).json({ user: data.user, session: data.session });
});

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