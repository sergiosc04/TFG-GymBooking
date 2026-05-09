import React, { useEffect, useState, useCallback } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator,
} from 'react-native';
import { api } from '../services/api';
import { Clase } from '../types';
import ClassCard from '../components/ClassCard';

export default function ClassesScreen({ navigation }: any) {
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarClases = useCallback(async () => {
    try {
      const data = await api.getClasses();
      setClases(data);
    } catch (error) {
      console.error('Error cargando clases:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarClases();
  }, [cargarClases]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarClases();
  };

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
        <Text style={styles.titulo}>Clases</Text>
      </View>

      <FlatList
        data={clases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <ClassCard
              clase={item}
              onPress={() => navigation.navigate('ClassDetail', { claseId: item.id })}
              reservasActuales={(item as any).reservas_hoy || 0}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1D74F2" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome5 name="clipboard-list" size={48} color="#9CA3AF" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>No hay clases disponibles</Text>
            <Text style={styles.emptySubtitle}>Vuelve más tarde para ver las clases programadas</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  listContent: {
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
});