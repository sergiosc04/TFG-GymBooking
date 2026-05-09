-- ============================================================
-- GYMBOOKING — Reset completo de la base de datos
-- Ejecutar en Supabase SQL Editor (todo de una vez)
-- ============================================================

-- 1. LIMPIEZA: Eliminar tablas existentes (en orden por dependencias)
DROP TABLE IF EXISTS public.reservas CASCADE;
DROP TABLE IF EXISTS public.clases CASCADE;
DROP TABLE IF EXISTS public.perfiles CASCADE;

-- Eliminar funciones y triggers previos
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.reservar_clase(uuid, uuid, date) CASCADE;
DROP FUNCTION IF EXISTS public.contar_reservas_clase(date) CASCADE;


-- ============================================================
-- 2. TABLAS
-- ============================================================

CREATE TABLE public.perfiles (
  id uuid NOT NULL,
  nombre_completo text NOT NULL DEFAULT 'Usuario',
  apellidos text,
  telefono text,
  rol text NOT NULL DEFAULT 'socio' CHECK (rol IN ('socio', 'admin')),
  url_avatar text,
  fecha_creacion timestamptz DEFAULT now(),
  CONSTRAINT perfiles_pkey PRIMARY KEY (id),
  CONSTRAINT perfiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE public.clases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  instructor_id uuid,
  duracion_min integer NOT NULL DEFAULT 60,
  capacidad_max integer NOT NULL DEFAULT 20,
  horario text NOT NULL,
  sala text,
  url_imagen text,
  fecha_creacion timestamptz DEFAULT now(),
  CONSTRAINT clases_pkey PRIMARY KEY (id),
  CONSTRAINT clases_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.perfiles(id)
);

CREATE TABLE public.reservas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  perfil_id uuid NOT NULL,
  clase_id uuid NOT NULL,
  fecha_reserva date NOT NULL,
  estado text DEFAULT 'confirmada' CHECK (estado IN ('confirmada', 'cancelada')),
  fecha_creacion timestamptz DEFAULT now(),
  CONSTRAINT reservas_pkey PRIMARY KEY (id),
  CONSTRAINT reservas_perfil_id_fkey FOREIGN KEY (perfil_id) REFERENCES public.perfiles(id),
  CONSTRAINT reservas_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES public.clases(id)
);

-- Índice único parcial: impide duplicados a nivel de BD
CREATE UNIQUE INDEX uq_reserva_activa
  ON public.reservas (perfil_id, clase_id, fecha_reserva)
  WHERE estado = 'confirmada';


-- ============================================================
-- 3. TRIGGER: Crear perfil automáticamente al registrar usuario
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre_completo, telefono)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', 'Usuario'),
    NEW.raw_user_meta_data->>'telefono'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 4. FUNCIÓN RPC: Reservar clase con control de capacidad
-- ============================================================

CREATE OR REPLACE FUNCTION public.reservar_clase(
  p_perfil_id uuid,
  p_clase_id uuid,
  p_fecha_reserva date
)
RETURNS uuid AS $$
DECLARE
  v_capacidad integer;
  v_ocupadas integer;
  v_reserva_existente uuid;
  v_nueva_reserva uuid;
BEGIN
  -- Verificar que el perfil existe
  IF NOT EXISTS (SELECT 1 FROM public.perfiles WHERE id = p_perfil_id) THEN
    RAISE EXCEPTION 'El perfil no existe. Completa tu registro primero.';
  END IF;

  -- Verificar que la clase existe y obtener capacidad
  SELECT capacidad_max INTO v_capacidad
  FROM public.clases
  WHERE id = p_clase_id;

  IF v_capacidad IS NULL THEN
    RAISE EXCEPTION 'La clase no existe.';
  END IF;

  -- Verificar si ya tiene una reserva activa para esta clase en esta fecha
  SELECT id INTO v_reserva_existente
  FROM public.reservas
  WHERE perfil_id = p_perfil_id
    AND clase_id = p_clase_id
    AND fecha_reserva = p_fecha_reserva
    AND estado = 'confirmada';

  IF v_reserva_existente IS NOT NULL THEN
    RAISE EXCEPTION 'Ya tienes una reserva para esta clase en esta fecha.';
  END IF;

  -- Contar reservas activas para esta clase en esta fecha
  SELECT COUNT(*) INTO v_ocupadas
  FROM public.reservas
  WHERE clase_id = p_clase_id
    AND fecha_reserva = p_fecha_reserva
    AND estado = 'confirmada';

  -- Verificar capacidad
  IF v_ocupadas >= v_capacidad THEN
    RAISE EXCEPTION 'La clase está completa. No hay plazas disponibles.';
  END IF;

  -- Crear la reserva
  INSERT INTO public.reservas (perfil_id, clase_id, fecha_reserva, estado)
  VALUES (p_perfil_id, p_clase_id, p_fecha_reserva, 'confirmada')
  RETURNING id INTO v_nueva_reserva;

  RETURN v_nueva_reserva;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 5. FUNCIÓN: Contar reservas confirmadas por clase para una fecha
-- ============================================================

CREATE OR REPLACE FUNCTION public.contar_reservas_clase(p_fecha date)
RETURNS TABLE(clase_id uuid, total bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT r.clase_id, COUNT(*) AS total
  FROM public.reservas r
  WHERE r.fecha_reserva = p_fecha
    AND r.estado = 'confirmada'
  GROUP BY r.clase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 6. PERMISOS (GRANT) — Necesarios al crear tablas por SQL Editor
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON public.perfiles TO authenticated, service_role;
GRANT ALL ON public.clases TO authenticated, service_role;
GRANT ALL ON public.reservas TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.reservar_clase(uuid, uuid, date) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.contar_reservas_clase(date) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;


-- ============================================================
-- 7. POLÍTICAS RLS
-- ============================================================

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Perfiles: cada usuario ve y edita solo su perfil
CREATE POLICY "Usuarios ven su propio perfil"
  ON public.perfiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuarios editan su propio perfil"
  ON public.perfiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Insertar perfil propio"
  ON public.perfiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Clases: todos los autenticados pueden ver
CREATE POLICY "Usuarios autenticados ven clases"
  ON public.clases FOR SELECT
  USING (auth.role() = 'authenticated');

-- Reservas: cada usuario ve y gestiona solo sus reservas
CREATE POLICY "Usuarios ven sus reservas"
  ON public.reservas FOR SELECT
  USING (auth.uid() = perfil_id);

CREATE POLICY "Usuarios crean sus reservas"
  ON public.reservas FOR INSERT
  WITH CHECK (auth.uid() = perfil_id);

CREATE POLICY "Usuarios actualizan sus reservas"
  ON public.reservas FOR UPDATE
  USING (auth.uid() = perfil_id);


-- ============================================================
-- 7. DATOS SEED: Clases de ejemplo
-- ============================================================

-- Nota: instructor_id es NULL porque aún no hay usuarios registrados.
-- Cuando se cree un usuario admin, se puede actualizar este campo.

INSERT INTO public.clases (nombre, descripcion, duracion_min, capacidad_max, horario, sala, url_imagen) VALUES
(
  'Yoga',
  'Clase de yoga para todos los niveles. Mejora tu flexibilidad, equilibrio y bienestar mental con posturas guiadas y técnicas de respiración.',
  60, 15,
  'Lunes y Miércoles 09:00',
  'Sala 1',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop'
),
(
  'Spinning',
  'Sesión de ciclismo indoor de alta intensidad. Quema calorías, mejora tu resistencia cardiovascular y fortalece tus piernas al ritmo de la música.',
  45, 20,
  'Martes y Jueves 10:00',
  'Sala Spinning',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=400&fit=crop'
),
(
  'CrossFit',
  'Entrenamiento funcional de alta intensidad que combina ejercicios de fuerza, cardio y gimnasia. Cada día un WOD diferente.',
  50, 12,
  'Lunes a Viernes 18:00',
  'Box CrossFit',
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&h=400&fit=crop'
),
(
  'Pilates',
  'Fortalece tu core, mejora tu postura y gana flexibilidad con ejercicios controlados. Ideal para complementar cualquier deporte.',
  55, 18,
  'Miércoles y Viernes 11:00',
  'Sala 2',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=400&fit=crop'
),
(
  'Boxeo',
  'Aprende técnica de boxeo mientras te pones en forma. Trabajo de saco, guantes y circuitos de alta intensidad.',
  60, 16,
  'Martes y Jueves 19:00',
  'Sala de Combate',
  'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&h=400&fit=crop'
),
(
  'Zumba',
  'Baila y diviértete mientras quemas calorías con ritmos latinos. No necesitas experiencia previa, solo ganas de moverte.',
  50, 25,
  'Lunes y Miércoles 20:00',
  'Sala Principal',
  'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=800&h=400&fit=crop'
),
(
  'HIIT',
  'Intervalos de alta intensidad para maximizar la quema de grasa en poco tiempo. Sesiones cortas pero muy efectivas.',
  30, 20,
  'Martes, Jueves y Sábado 08:00',
  'Sala 1',
  'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800&h=400&fit=crop'
),
(
  'Estiramientos',
  'Sesión guiada de estiramientos y movilidad articular. Perfecta para recuperar después de entrenar o para mejorar la flexibilidad general.',
  40, 20,
  'Viernes 13:00',
  'Sala 2',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&h=400&fit=crop'
);
