export interface Perfil {
  id: string;
  nombre_completo: string;
  apellidos?: string;
  telefono?: string;
  rol: 'socio' | 'admin';
  url_avatar?: string;
  fecha_creacion: string;
}

export interface Clase {
  id: string;
  nombre: string;
  descripcion?: string;
  instructor_id: string;
  instructor?: { nombre_completo: string };
  duracion_min: number;
  capacidad_max: number;
  horario: string;
  sala?: string;
  url_imagen?: string;
  fecha_creacion: string;
}

export interface Reserva {
  id: string;
  perfil_id: string;
  clase_id: string;
  clases?: Clase;
  fecha_reserva: string;
  estado: 'confirmada' | 'cancelada';
  fecha_creacion: string;
}