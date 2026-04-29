//archivo centralizado para manejar todas las llamadas a la API desde el frontend, incluyendo autenticación y gestión de tokens.


import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:3000/api'; // Para emulador Android
// Si usas Expo Go en móvil físico, cambia por la IP de tu PC: http://192.168.x.x:3000/api

async function getStoredToken(): Promise<string | null> {
  return await AsyncStorage.getItem('token');
}

export async function saveToken(token: string) {
  await AsyncStorage.setItem('token', token);
}

export async function removeToken() {
  await AsyncStorage.removeItem('token');
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = await getStoredToken();

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error del servidor');
  }
  return res.json();
}

export const api = {
  // Auth
  register: (email: string, password: string, nombre_completo: string, telefono: string) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, nombre_completo, telefono }),
    }),

  login: (email: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Clases
  getClasses: () => request('/classes'),

  getHorarios: (claseId: string) => request(`/classes/${claseId}/horarios`),

  // Reservas
  getMyBookings: () => request('/bookings'),

  createBooking: (horarioId: string, fecha: string) =>
    request('/bookings', {
      method: 'POST',
      body: JSON.stringify({ horario_id: horarioId, fecha_reserva: fecha }),
    }),

  cancelBooking: (reservaId: string) =>
    request(`/bookings/${reservaId}/cancelar`, { method: 'PATCH' }),
};