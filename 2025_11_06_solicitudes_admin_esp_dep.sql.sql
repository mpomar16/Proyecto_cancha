-- 1) Permitir espacios "libres": id_admin_esp_dep puede ser NULL
ALTER TABLE public.espacio_deportivo
  ALTER COLUMN id_admin_esp_dep DROP NOT NULL;

-- 2) Cambiar FK: no borrar espacios al borrar admin; dejar el campo en NULL
ALTER TABLE public.espacio_deportivo DROP CONSTRAINT fk_espacio_admin;
ALTER TABLE public.espacio_deportivo
  ADD CONSTRAINT fk_espacio_admin
  FOREIGN KEY (id_admin_esp_dep)
  REFERENCES public.admin_esp_dep(id_admin_esp_dep)
  ON DELETE SET NULL;

-- 3) Enum de estado de la solicitud
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_solicitud_admin_enum') THEN
    CREATE TYPE public.estado_solicitud_admin_enum AS ENUM (
      'pendiente',
      'aprobada',
      'rechazada',
      'anulada'
    );
  END IF;
END$$;

-- 4) Tabla de solicitudes para ser ADM_ESP_DEP de un espacio
CREATE TABLE IF NOT EXISTS public.solicitud_admin_esp_dep (
  id_solicitud SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES public.usuario(id_persona) ON DELETE CASCADE,
  id_espacio INTEGER NOT NULL REFERENCES public.espacio_deportivo(id_espacio) ON DELETE CASCADE,
  motivo TEXT,
  fecha_solicitud TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  estado public.estado_solicitud_admin_enum NOT NULL DEFAULT 'pendiente',
  decidido_por_admin INTEGER REFERENCES public.usuario(id_persona),
  fecha_decision TIMESTAMP WITHOUT TIME ZONE,
  comentario_decision TEXT
);

-- 5) Evitar duplicar solicitudes PENDIENTES del mismo usuario sobre el mismo espacio
CREATE UNIQUE INDEX IF NOT EXISTS ux_solicitud_unica_pendiente
  ON public.solicitud_admin_esp_dep (id_usuario, id_espacio)
  WHERE estado = 'pendiente';
