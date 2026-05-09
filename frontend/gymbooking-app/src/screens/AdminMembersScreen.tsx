import React, { useEffect, useState, useCallback } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Platform, Alert, RefreshControl,
} from 'react-native';
import { api } from '../services/api';
import { Perfil } from '../types';

export default function AdminMembersScreen({ navigation }: any) {
  const [miembros, setMiembros] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const cargarMiembros = useCallback(async () => {
    try {
      const data = await api.adminGetMembers();
      setMiembros(data);
    } catch (error) {
      console.error('Error cargando miembros:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarMiembros();
  }, [cargarMiembros]);

  const handleCambiarRol = (miembro: Perfil) => {
    const nuevoRol = miembro.rol === 'admin' ? 'socio' : 'admin';
    Alert.alert(
      'Cambiar rol',
      `¿Cambiar el rol de ${miembro.nombre_completo} a "${nuevoRol}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await api.adminUpdateMemberRole(miembro.id, nuevoRol);
              cargarMiembros();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo cambiar el rol');
            }
          },
        },
      ]
    );
  };

  const miembrosFiltrados = miembros.filter(m =>
    m.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
    (m.telefono || '').includes(busqueda)
  );

  const getIniciales = (nombre: string) =>
    nombre.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);

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
        <Text style={styles.headerTitle}>Socios</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <FontAwesome5 name="search" size={14} color="#9CA3AF" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o teléfono..."
          placeholderTextColor="#9CA3AF"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {/* Lista */}
      <FlatList
        data={miembrosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.miembroItem}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getIniciales(item.nombre_completo)}</Text>
            </View>
            <View style={styles.miembroInfo}>
              <Text style={styles.miembroNombre}>{item.nombre_completo}</Text>
              <Text style={styles.miembroEmail}>{item.telefono || 'Sin teléfono'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.rolBadge, item.rol === 'admin' && styles.rolBadgeAdmin]}
              onPress={() => handleCambiarRol(item)}
            >
              <Text style={[styles.rolText, item.rol === 'admin' && styles.rolTextAdmin]}>
                {item.rol}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargarMiembros(); }} tintColor="#1D74F2" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No se encontraron socios</Text>
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
  miembroItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#E6F1FB',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#1D74F2' },
  miembroInfo: { flex: 1 },
  miembroNombre: { fontSize: 15, fontWeight: '600', color: '#111827' },
  miembroEmail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  rolBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  rolBadgeAdmin: { backgroundColor: '#DBEAFE' },
  rolText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  rolTextAdmin: { color: '#1D74F2' },
  emptyState: { padding: 48, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#6B7280' },
});
