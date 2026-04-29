const API_URL = "http://localhost:3000/api";

import AsyncStorage from "@react-native-async-storage/async-storage";

// --- FUNCIONES DE ALMACENAMIENTO DEL TOKEN ---

export const getStoredToken = async () => {
  try {
    return await AsyncStorage.getItem("jwt_token");
  } catch (error) {
    console.error("Error leyendo el token", error);
    return null;
  }
};

export const setStoredToken = async (token: string) => {
  try {
    await AsyncStorage.setItem("jwt_token", token);
  } catch (error) {
    console.error("Error guardando el token", error);
  }
};

export const removeStoredToken = async () => {
  try {
    await AsyncStorage.removeItem("jwt_token");
  } catch (error) {
    console.error("Error borrando el token", error);
  }
};

// --- FUNCIÓN BASE DE PETICIONES ---

async function request(endpoint: string, options: RequestInit = {}) {
  const token = await getStoredToken(); // ¡Ahora sí existe!

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
<<<<<<< HEAD
      'Content-Type': 'application/json',
=======
      "Content-Type": "application/json",
>>>>>>> origin/main
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json();
<<<<<<< HEAD
    throw new Error(error.error || 'Error del servidor');
=======
    throw new Error(error.error || "Error del servidor");
>>>>>>> origin/main
  }
  return res.json();
}

export const api = {
<<<<<<< HEAD
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
=======
  // Clases
  getClasses: () => request("/classes"),
  getClassDetail: (id: string) => request(`/classes/${id}`),

  // Reservas
  getMyBookings: () => request("/bookings"),
  createBooking: (claseId: string, fecha: string) =>
    request("/bookings", {
      method: "POST",
      body: JSON.stringify({
        clase_id: claseId,
        fecha_reserva: fecha,
      }),
    }),
  cancelBooking: (bookingId: string) =>
    request(`/bookings/${bookingId}/cancel`, {
      method: "PATCH",
    }),
};
>>>>>>> origin/main
