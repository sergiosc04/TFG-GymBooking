import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { api } from '../services/api';
import { Reserva } from '../types';
import BookingCard from '../components/BookingCard';

export default function BookingsScreen({ navigation }: any) {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tabActiva, setTabActiva] = useState<'proximas' | 'pasadas'>('proximas');

  const cargarReservas = useCallback(async () => {
    try {
      const data = await api.getMyBookings();
      setReservas(data);
    } catch (error) {
      console.error('Error cargando reservas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarReservas();
  }, [cargarReservas]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarReservas();
  };

  const handleCancelar = async (reservaId: string) => {
    try {
      await api.cancelBooking(reservaId);
      Alert.alert('Reserva cancelada', 'Tu reserva ha sido cancelada.');
      cargarReservas();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo cancelar');
    }
  };

  const hoy = new Date().toISOString().split('T')[0];

  const proximas = reservas.filter(
    r => r.estado === 'confirmada' && r.fecha_reserva >= hoy
  );

  const pasadas = reservas.filter(
    r => r.estado === 'cancelada' || r.fecha_reserva < hoy
  );

  const datosActivos = tabActiva === 'proximas' ? proximas : pasadas;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D74F2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Mis reservas</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tabActiva === 'proximas' && styles.tabActiva]}
          onPress={() => setTabActiva('proximas')}
        >
          <Text style={[styles.tabText, tabActiva === 'proximas' && styles.tabTextActiva]}>
            Próximas ({proximas.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tabActiva === 'pasadas' && styles.tabActiva]}
          onPress={() => setTabActiva('pasadas')}
        >
          <Text style={[styles.tabText, tabActiva === 'pasadas' && styles.tabTextActiva]}>
            Pasadas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={datosActivos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <BookingCard
              reserva={item}
              esFutura={tabActiva === 'proximas'}
              onCancel={handleCancelar}
              onPress={() => {
                if (item.clase_id) {
                  navigation.navigate('ClassDetail', { claseId: item.clase_id });
                }
              }}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1D74F2" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>{tabActiva === 'proximas' ? '📅' : '📖'}</Text>
            <Text style={styles.emptyTitle}>
              {tabActiva === 'proximas'
                ? 'No tienes reservas próximas'
                : 'Aún no tienes historial'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {tabActiva === 'proximas'
                ? '¡Apúntate a tu primera clase!'
                : '¡Apúntate a tu primera clase!'}
            </Text>
            {tabActiva === 'proximas' && (
              <TouchableOpacity
                style={styles.explorarBtn}
                onPress={() => navigation.navigate('Clases')}
              >
                <Text style={styles.explorarBtnText}>Explorar clases</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 8,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActiva: {
    borderBottomColor: '#1D74F2',
  },
  tabText: {
    fontSize: 15,
    color: '#6B7280',
  },
  tabTextActiva: {
    color: '#1D74F2',
    fontWeight: '600',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  cardContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  explorarBtn: {
    backgroundColor: '#1D74F2',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 16,
  },
  explorarBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});