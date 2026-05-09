import React, { useEffect, useState, useCallback } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Platform, RefreshControl,
} from 'react-native';
import { api } from '../services/api';
import { Clase } from '../types';

export default function AdminClassesScreen({ navigation }: any) {
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const cargarClases = useCallback(async () => {
    try {
      const data = await api.adminGetClasses();
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

  const clasesFiltradas = clases.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.instructor?.nombre_completo || '').toLowerCase().includes(busqueda.toLowerCase())
  );

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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Clases</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <FontAwesome5 name="search" size={14} color="#9CA3AF" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o monitor..."
          placeholderTextColor="#9CA3AF"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {/* Lista */}
      <FlatList
        data={clasesFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.claseItem}
            onPress={() => navigation.navigate('AdminHome', { claseEditar: item })}
            activeOpacity={0.7}
          >
            <View style={styles.claseInfo}>
              <Text style={styles.claseNombre}>{item.nombre}</Text>
              <Text style={styles.claseMonitor}>{item.instructor?.nombre_completo || 'Sin monitor'}</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargarClases(); }} tintColor="#1D74F2" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No se encontraron clases</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F8FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: 56, paddingHorizontal: 16, marginTop: Platform.OS === 'ios' ? 50 : 30,
  },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 24, color: '#111827' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#111827' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    marginHorizontal: 16, marginBottom: 16, borderRadius: 8, borderWidth: 1,
    borderColor: '#E5E7EB', paddingHorizontal: 12, height: 44,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  listContent: { paddingBottom: 24 },
  claseItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 16,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  claseInfo: { flex: 1 },
  claseNombre: { fontSize: 16, fontWeight: '600', color: '#111827' },
  claseMonitor: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  emptyState: { padding: 48, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#6B7280' },
});
