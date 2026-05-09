import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function normalizeApiBaseUrl(baseUrl: string) {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

function getApiUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return normalizeApiBaseUrl(envUrl);
  }

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
  register: async (email: string, password: string, nombre_completo: string, telefono: string) => {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, nombre_completo, telefono }),
    });
    // Guardamos el token automáticamente si el registro devuelve sesión
    if (data.session?.access_token) {
      await saveToken(data.session.access_token);
    }
    return data;
  },

  login: async (email: string, password: string) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // Guardamos el token automáticamente al loguear
    if (data.session?.access_token) {
      await saveToken(data.session.access_token);
    }
    return data;
  },

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

  getProfile: () => request('/auth/profile'),

  updateProfile: (nombre_completo: string, telefono: string) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ nombre_completo, telefono }),
    }),

  changePassword: (password: string) =>
    request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ password }),
    }),

  // ---- Admin ----

  adminGetClasses: () => request('/admin/classes'),

  adminCreateClass: (clase: any) =>
    request('/admin/classes', {
      method: 'POST',
      body: JSON.stringify(clase),
    }),

  adminUpdateClass: (id: string, clase: any) =>
    request(`/admin/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clase),
    }),

  adminDeleteClass: (id: string) =>
    request(`/admin/classes/${id}`, { method: 'DELETE' }),

  adminUploadClassImage: async (claseId: string, imageUri: string) => {
    const token = await getStoredToken();
    if (!token) throw new Error('No autenticado');
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    if (Platform.OS === 'web') {
      const response = await fetch(imageUri);
      const blob: any = await response.blob();
      const blobWithType = blob?.type ? blob : blob?.slice?.(0, blob?.size ?? 0, type);
      formData.append('image', (blobWithType || blob) as any, filename);
    } else {
      formData.append('image', { uri: imageUri, name: filename, type } as any);
    }

    const res = await fetch(`${API_URL}/admin/classes/${claseId}/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      let message = 'Error subiendo imagen';
      try {
        const error = await res.json();
        message = error.error || message;
      } catch {
        // ignore JSON parse errors
      }
      throw new Error(message);
    }
    return res.json();
  },

  adminGetMembers: () => request('/admin/members'),

  adminUpdateMemberRole: (id: string, rol: string) =>
    request(`/admin/members/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ rol }),
    }),
};