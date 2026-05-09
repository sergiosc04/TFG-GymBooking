-- ============================================================
-- GYMBOOKING — Configuración del bloque Admin
-- Ejecutar en Supabase SQL Editor después de reset_completo.sql
-- ============================================================


-- ============================================================
-- 0. Helper anti-recursión: is_admin()
--
-- Importante:
-- - No uses policies que hagan SELECT sobre public.perfiles dentro de una policy
--   de public.perfiles (o cualquier policy que implique perfiles), porque puede
--   disparar "infinite recursion detected in policy for relation perfiles".
-- - Esta función es SECURITY DEFINER para evitar aplicar RLS dentro de la propia
--   comprobación de rol.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.perfiles
    WHERE id = auth.uid()
      AND rol = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;


-- ============================================================
-- 1. BUCKET DE STORAGE: Imágenes de clases
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('clases-imagenes', 'clases-imagenes', true)
ON CONFLICT (id) DO NOTHING;

-- Re-runnable: elimina policies previas si existen
DROP POLICY IF EXISTS "Lectura pública de imágenes de clases" ON storage.objects;
DROP POLICY IF EXISTS "Admins suben imágenes de clases" ON storage.objects;
DROP POLICY IF EXISTS "Admins actualizan imágenes de clases" ON storage.objects;
DROP POLICY IF EXISTS "Admins eliminan imágenes de clases" ON storage.objects;

-- Lectura pública (cualquiera puede ver las imágenes)
CREATE POLICY "Lectura pública de imágenes de clases"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'clases-imagenes');

-- Solo admins pueden subir imágenes
CREATE POLICY "Admins suben imágenes de clases"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'clases-imagenes'
    AND public.is_admin()
  );

-- Solo admins pueden actualizar imágenes
CREATE POLICY "Admins actualizan imágenes de clases"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'clases-imagenes'
    AND public.is_admin()
  );

-- Solo admins pueden eliminar imágenes
CREATE POLICY "Admins eliminan imágenes de clases"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'clases-imagenes'
    AND public.is_admin()
  );


-- ============================================================
-- 2. POLÍTICAS RLS ADMIN: Clases (CRUD completo para admins)
-- ============================================================

-- Re-runnable
DROP POLICY IF EXISTS "Admins crean clases" ON public.clases;
DROP POLICY IF EXISTS "Admins editan clases" ON public.clases;
DROP POLICY IF EXISTS "Admins eliminan clases" ON public.clases;

-- Admins pueden crear clases
CREATE POLICY "Admins crean clases"
  ON public.clases FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- Admins pueden editar clases
CREATE POLICY "Admins editan clases"
  ON public.clases FOR UPDATE
  USING (
    public.is_admin()
  );

-- Admins pueden eliminar clases
CREATE POLICY "Admins eliminan clases"
  ON public.clases FOR DELETE
  USING (
    public.is_admin()
  );


-- ============================================================
-- 3. POLÍTICAS RLS ADMIN: Perfiles (lectura total + editar rol)
-- ============================================================

-- Re-runnable
DROP POLICY IF EXISTS "Admins ven todos los perfiles" ON public.perfiles;

-- Admins pueden ver todos los perfiles (para gestión de socios)
CREATE POLICY "Admins ven todos los perfiles"
  ON public.perfiles FOR SELECT
  USING (
    public.is_admin()
  );


-- ============================================================
-- 4. GRANTS para storage
-- ============================================================

GRANT ALL ON storage.objects TO authenticated, service_role;
GRANT ALL ON storage.buckets TO authenticated, service_role;
