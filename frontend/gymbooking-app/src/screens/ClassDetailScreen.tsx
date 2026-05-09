import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Platform, Image,
} from 'react-native';
import { api } from '../services/api';
import { Clase, Reserva } from '../types';
import CapacityBar from '../components/CapacityBar';

export default function ClassDetailScreen({ route, navigation }: any) {
  const { claseId } = route.params;
  const [clase, setClase] = useState<Clase | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [yaReservadaHoy, setYaReservadaHoy] = useState(false);
  const [reservaHoy, setReservaHoy] = useState<Reserva | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    cargarClase();
    comprobarReservaHoy();
  }, [claseId]);

  async function comprobarReservaHoy(): Promise<Reserva | null> {
    const hoy = new Date().toISOString().split('T')[0];
    try {
      const reservas = (await api.getMyBookings()) as Reserva[];
      const reserva =
        reservas.find((r) => r.estado === 'confirmada' && r.clase_id === claseId && r.fecha_reserva === hoy) || null;
      setReservaHoy(reserva);
      setYaReservadaHoy(!!reserva);
      return reserva;
    } catch (error) {
      console.error('Error comprobando reservas:', error);
      setYaReservadaHoy(false);
      setReservaHoy(null);
      return null;
    }
  }

  const cargarClase = async () => {
    try {
      const data = await api.getClassDetail(claseId);
      setClase(data);
    } catch (error) {
      console.error('Error cargando clase:', error);
      Alert.alert('Error', 'No se pudo cargar la clase');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleReservar = async () => {
  if (yaReservadaHoy) return;
  const hoy = new Date().toISOString().split('T')[0];

  if (Platform.OS === 'web') {
    const confirmar = window.confirm(`¿Reservar ${clase?.nombre} para hoy (${hoy})?`);
    if (!confirmar) return;

    setBooking(true);
    try {
      await api.createBooking(claseId, hoy);
      setYaReservadaHoy(true);
      comprobarReservaHoy();
      cargarClase();
      window.alert('✓ Reserva confirmada');
    } catch (error: any) {
      window.alert('Error: ' + (error.message || 'No se pudo reservar'));
    } finally {
      setBooking(false);
    }
  } else {
    Alert.alert(
      'Confirmar reserva',
      `¿Reservar ${clase?.nombre} para hoy (${hoy})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar reserva',
          onPress: async () => {
            setBooking(true);
            try {
              await api.createBooking(claseId, hoy);
              setYaReservadaHoy(true);
              comprobarReservaHoy();
              cargarClase();
              Alert.alert('✓ Reserva confirmada', `Tu plaza en ${clase?.nombre} está reservada.`);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo reservar');
            } finally {
              setBooking(false);
            }
          },
        },
      ]
    );
  }
};

  const handleCancelarReserva = async () => {
    const hoy = new Date().toISOString().split('T')[0];

    const reserva = reservaHoy || (await comprobarReservaHoy());
    if (!reserva?.id) {
      if (Platform.OS === 'web') {
        window.alert('No se encontró una reserva confirmada para cancelar.');
      } else {
        Alert.alert('Error', 'No se encontró una reserva confirmada para cancelar.');
      }
      return;
    }

    if (Platform.OS === 'web') {
      const confirmar = window.confirm(`¿Cancelar tu reserva de ${clase?.nombre} para hoy (${hoy})?`);
      if (!confirmar) return;

      setBooking(true);
      try {
        await api.cancelBooking(reserva.id);
        setReservaHoy(null);
        setYaReservadaHoy(false);
        await comprobarReservaHoy();
        await cargarClase();
        window.alert('✓ Reserva cancelada');
      } catch (error: any) {
        window.alert('Error: ' + (error.message || 'No se pudo cancelar la reserva'));
      } finally {
        setBooking(false);
      }
      return;
    }

    Alert.alert(
      '¿Cancelar reserva?'
      ,
      `¿Seguro que quieres cancelar tu reserva de ${clase?.nombre} para hoy (${hoy})?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setBooking(true);
            try {
              await api.cancelBooking(reserva.id);
              setReservaHoy(null);
              setYaReservadaHoy(false);
              await comprobarReservaHoy();
              await cargarClase();
              Alert.alert('✓ Reserva cancelada', 'Tu reserva ha sido cancelada.');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo cancelar la reserva');
            } finally {
              setBooking(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D74F2" />
      </View>
    );
  }

  if (!clase) return null;

  const instructorNombre = clase.instructor?.nombre_completo || 'Sin asignar';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cabecera con imagen o color de fondo */}
        <View style={styles.imagenCabecera}>
          {clase.url_imagen ? (
            <Image source={{ uri: clase.url_imagen }} style={styles.imagenFondo} />
          ) : (
            <Text style={styles.imagenTexto}>{clase.nombre.charAt(0)}</Text>
          )}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Contenido */}
        <View style={styles.content}>
          <Text style={styles.nombre}>{clase.nombre}</Text>
          <Text style={styles.horarioTexto}>{clase.horario}</Text>

          {/* Grid de info */}
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Instructor</Text>
              <Text style={styles.gridValue}>{instructorNombre}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Sala</Text>
              <Text style={styles.gridValue}>{clase.sala || 'No asignada'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Duración</Text>
              <Text style={styles.gridValue}>{clase.duracion_min} min</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Capacidad</Text>
              <Text style={styles.gridValue}>{clase.capacidad_max} plazas</Text>
            </View>
          </View>

          {/* Aforo */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Aforo</Text>
            <CapacityBar actual={(clase as any).reservas_hoy || 0} max={clase.capacidad_max} />
          </View>

          {/* Descripción */}
          {clase.descripcion && (
            <View style={styles.seccion}>
              <Text style={styles.seccionTitulo}>Descripción</Text>
              <Text style={styles.descripcion}>{clase.descripcion}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botón fijo abajo */}
      <View style={[styles.botonContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[
            styles.botonReservar,
            yaReservadaHoy && styles.botonCancelar,
            booking && { opacity: 0.6 },
          ]}
          onPress={yaReservadaHoy ? handleCancelarReserva : handleReservar}
          disabled={booking}
          activeOpacity={0.8}
        >
          {booking ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : yaReservadaHoy ? (
            <Text style={styles.botonTexto}>Cancelar reserva</Text>
          ) : (
            <Text style={styles.botonTexto}>Reservar plaza</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imagenCabecera: {
    width: '100%',
    height: 200,
    backgroundColor: '#1D74F2',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagenFondo: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backText: {
    fontSize: 20,
    color: '#111827',
  },
  imagenTexto: {
    fontSize: 56,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
  },
  content: {
    padding: 16,
  },
  nombre: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  horarioTexto: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 24,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    padding: 12,
  },
  gridLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  gridValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  seccion: {
    marginTop: 24,
  },
  seccionTitulo: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  botonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  botonReservar: {
    height: 56,
    backgroundColor: '#1D74F2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonCancelar: {
    backgroundColor: '#EF4444',
  },
  botonTexto: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});