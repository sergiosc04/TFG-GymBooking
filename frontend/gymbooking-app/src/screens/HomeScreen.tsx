import React, { useEffect, useState, useCallback } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Clase, Reserva } from '../types';
import ClassCard from '../components/ClassCard';

export default function HomeScreen({ navigation }: any) {
  const { userName } = useAuth();
  const [clases, setClases] = useState<Clase[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      const [clasesData, reservasData] = await Promise.all([
        api.getClasses(),
        api.getMyBookings(),
      ]);
      setClases(clasesData);
      setReservas(reservasData.filter((r: Reserva) => r.estado === 'confirmada'));
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  // Próxima reserva (la más cercana en el futuro)
  const hoy = new Date().toISOString().split('T')[0];
  const proximaReserva = reservas
    .filter(r => r.fecha_reserva >= hoy)
    .sort((a, b) => a.fecha_reserva.localeCompare(b.fecha_reserva))[0];

  const primerNombre = userName.split(' ')[0] || 'Usuario';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D74F2" />
      </View>
    );
  }

  const ListHeader = () => (
    <View>
      {/* Header con saludo */}
      <View style={styles.header}>
        <View>
          <Text style={styles.saludoGris}>Hola,</Text>
          <Text style={styles.saludoNombre}>
            {primerNombre}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => navigation.navigate('Perfil')}
        >
          <Text style={styles.avatarText}>
            {primerNombre.charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Próxima reserva */}
      {proximaReserva ? (
        <TouchableOpacity
          style={styles.proximaCard}
          onPress={() => navigation.navigate('ClassDetail', { claseId: proximaReserva.clase_id })}
          activeOpacity={0.7}
        >
          <Text style={styles.proximaLabel}>PRÓXIMA RESERVA</Text>
          <Text style={styles.proximaNombre}>{proximaReserva.clases?.nombre || 'Clase'}</Text>
          <Text style={styles.proximaInfo}>
            {proximaReserva.clases?.horario || ''}{proximaReserva.clases?.sala ? ` · ${proximaReserva.clases.sala}` : ''}
          </Text>
          <Text style={styles.proximaFecha}>{proximaReserva.fecha_reserva}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.sinReservasCard}>
          <Text style={styles.sinReservasTexto}>No tienes reservas próximas</Text>
          <Text style={styles.sinReservasSubtexto}>¡Reserva una clase!</Text>
          <TouchableOpacity
            style={styles.verClasesBtn}
            onPress={() => navigation.navigate('Clases')}
          >
            <Text style={styles.verClasesBtnText}>Ver clases</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Título sección clases */}
      <View style={styles.seccionHeader}>
        <Text style={styles.seccionTitulo}>Clases disponibles</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Clases')}>
          <Text style={styles.verTodas}>Ver todas →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={clases.slice(0, 4)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <ClassCard
              clase={item}
              onPress={() => navigation.navigate('ClassDetail', { claseId: item.id })}
            />
          </View>
        )}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1D74F2" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay clases disponibles</Text>
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
  listContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 24,
  },
  saludoGris: {
    fontSize: 16,
    color: '#6B7280',
  },
  saludoNombre: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F1FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D74F2',
  },
  proximaCard: {
    backgroundColor: '#E6F1FB',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  proximaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1D74F2',
    letterSpacing: 0.5,
  },
  proximaNombre: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  proximaInfo: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  proximaFecha: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D74F2',
    marginTop: 8,
  },
  sinReservasCard: {
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  sinReservasTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sinReservasSubtexto: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  verClasesBtn: {
    backgroundColor: '#1D74F2',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 16,
  },
  verClasesBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  seccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  seccionTitulo: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  verTodas: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D74F2',
  },
  cardContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
  },
});