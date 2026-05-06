import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getApiUrl() {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  }

  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  const ip = debuggerHost?.split(':')[0];

  if (ip) {
    return `http://${ip}:3000/api`;
  }

  return 'http://localhost:3000/api';
}

const API_URL = getApiUrl();

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

  getClasses: () => request('/classes'),

  getClassDetail: (claseId: string) => request(`/classes/${claseId}`),

  getMyBookings: () => request('/bookings'),

  createBooking: (claseId: string, fecha: string) =>
    request('/bookings', {
      method: 'POST',
      body: JSON.stringify({ clase_id: claseId, fecha_reserva: fecha }),
    }),

  cancelBooking: (reservaId: string) =>
    request(`/bookings/${reservaId}/cancel`, { method: 'PATCH' }),
};