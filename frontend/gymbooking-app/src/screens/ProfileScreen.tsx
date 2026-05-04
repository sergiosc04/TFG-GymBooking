import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Reserva } from '../types';

export default function ProfileScreen() {
  const { userName, userEmail, logout } = useAuth();
  const [totalReservas, setTotalReservas] = useState(0);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const reservas = await api.getMyBookings();
      const confirmadas = reservas.filter((r: Reserva) => r.estado === 'confirmada');
      setTotalReservas(confirmadas.length);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      '¿Cerrar sesión?',
      '¿Seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
      ]
    );
  };

  const iniciales = userName
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Cabecera con avatar */}
      <View style={styles.cabecera}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{iniciales || 'U'}</Text>
        </View>
        <Text style={styles.nombre}>{userName}</Text>
        <Text style={styles.email}>{userEmail}</Text>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumero}>{totalReservas}</Text>
          <Text style={styles.statLabel}>Reservas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumero}>-</Text>
          <Text style={styles.statLabel}>Favorita</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumero}>-</Text>
          <Text style={styles.statLabel}>Este mes</Text>
        </View>
      </View>

      {/* Sección Cuenta */}
      <Text style={styles.seccionTitulo}>CUENTA</Text>
      <View style={styles.opcionesContainer}>
        <TouchableOpacity style={styles.opcion}>
          <Text style={styles.opcionIcono}>👤</Text>
          <Text style={styles.opcionTexto}>Datos personales</Text>
          <Text style={styles.opcionChevron}>›</Text>
        </TouchableOpacity>
        <View style={styles.separador} />
        <TouchableOpacity style={styles.opcion}>
          <Text style={styles.opcionIcono}>🔒</Text>
          <Text style={styles.opcionTexto}>Cambiar contraseña</Text>
          <Text style={styles.opcionChevron}>›</Text>
        </TouchableOpacity>
        <View style={styles.separador} />
        <TouchableOpacity style={styles.opcion}>
          <Text style={styles.opcionIcono}>🔔</Text>
          <Text style={styles.opcionTexto}>Notificaciones</Text>
          <Text style={styles.opcionChevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Sección Sobre */}
      <Text style={styles.seccionTitulo}>SOBRE LA APP</Text>
      <View style={styles.opcionesContainer}>
        <TouchableOpacity style={styles.opcion}>
          <Text style={styles.opcionIcono}>📄</Text>
          <Text style={styles.opcionTexto}>Términos y condiciones</Text>
          <Text style={styles.opcionChevron}>›</Text>
        </TouchableOpacity>
        <View style={styles.separador} />
        <TouchableOpacity style={styles.opcion}>
          <Text style={styles.opcionIcono}>🔐</Text>
          <Text style={styles.opcionTexto}>Política de privacidad</Text>
          <Text style={styles.opcionChevron}>›</Text>
        </TouchableOpacity>
        <View style={styles.separador} />
        <TouchableOpacity style={styles.opcion}>
          <Text style={styles.opcionIcono}>❓</Text>
          <Text style={styles.opcionTexto}>Ayuda y soporte</Text>
          <Text style={styles.opcionChevron}>›</Text>
        </TouchableOpacity>
        <View style={styles.separador} />
        <View style={styles.opcion}>
          <Text style={styles.opcionIcono}>ℹ️</Text>
          <Text style={styles.opcionTexto}>Versión 1.0</Text>
        </View>
      </View>

      {/* Botón cerrar sesión */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  cabecera: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6F1FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D74F2',
  },
  nombre: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumero: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D74F2',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  seccionTitulo: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  opcionesContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
  },
  opcionIcono: {
    fontSize: 18,
    marginRight: 12,
  },
  opcionTexto: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  opcionChevron: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  separador: {
    height: 0.5,
    backgroundColor: '#E5E7EB',
    marginLeft: 46,
  },
  logoutBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});