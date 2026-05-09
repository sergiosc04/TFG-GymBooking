import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, RefreshControl,
} from 'react-native';
import { api } from '../services/api';
import { Clase } from '../types';

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const DIAS_NOMBRE: Record<string, string[]> = {
  L: ['lunes', 'lun'],
  M: ['martes', 'mar'],
  X: ['miércoles', 'miercoles', 'mié', 'mie'],
  J: ['jueves', 'jue'],
  V: ['viernes', 'vie'],
  S: ['sábado', 'sabado', 'sáb', 'sab'],
  D: ['domingo', 'dom'],
};

// Extrae la hora (HH:MM) del string de horario
function extraerHora(horario: string): string {
  const match = horario.match(/(\d{1,2}:\d{2})/);
  return match ? match[1] : '00:00';
}

// Comprueba si una clase se imparte en un día concreto
function claseEnDia(horario: string, dia: string): boolean {
  const h = horario.toLowerCase();
  // Comprobar si contiene el nombre del día
  const nombres = DIAS_NOMBRE[dia] || [];
  for (const nombre of nombres) {
    if (h.includes(nombre)) return true;
  }
  // Comprobar patrones como "Lunes a Viernes"
  if (h.includes('lunes a viernes') && ['L', 'M', 'X', 'J', 'V'].includes(dia)) return true;
  if (h.includes('lunes a sábado') && ['L', 'M', 'X', 'J', 'V', 'S'].includes(dia)) return true;
  return false;
}

export default function AdminScheduleScreen({ navigation }: any) {
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState('L');

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

  // Filtrar clases por día y ordenar por hora
  const clasesDelDia = clases
    .filter(c => claseEnDia(c.horario, diaSeleccionado))
    .sort((a, b) => extraerHora(a.horario).localeCompare(extraerHora(b.horario)));

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
        <Text style={styles.headerTitle}>Horarios</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Selector de día */}
      <View style={styles.diasRow}>
        {DIAS.map((dia) => (
          <TouchableOpacity
            key={dia}
            style={[styles.diaBtn, diaSeleccionado === dia && styles.diaBtnActivo]}
            onPress={() => setDiaSeleccionado(dia)}
          >
            <Text style={[styles.diaText, diaSeleccionado === dia && styles.diaTextActivo]}>
              {dia}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de franjas horarias */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargarClases(); }} tintColor="#1D74F2" />
        }
      >
        {clasesDelDia.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay clases programadas para este día</Text>
          </View>
        ) : (
          clasesDelDia.map((clase) => (
            <View key={clase.id} style={styles.franjaItem}>
              <View style={styles.franjaHora}>
                <Text style={styles.franjaHoraText}>{extraerHora(clase.horario)}</Text>
              </View>
              <View style={styles.franjaInfo}>
                <Text style={styles.franjaNombre}>{clase.nombre}</Text>
                <Text style={styles.franjaDetalle}>
                  {clase.instructor?.nombre_completo || 'Sin monitor'}
                  {clase.sala ? ` · ${clase.sala}` : ''}
                </Text>
                <Text style={styles.franjaDetalle}>{clase.duracion_min} min · {clase.capacidad_max} plazas</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
  diasRow: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 6, marginBottom: 20,
  },
  diaBtn: {
    flex: 1, height: 40, borderRadius: 8, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB',
  },
  diaBtnActivo: { backgroundColor: '#1D74F2', borderColor: '#1D74F2' },
  diaText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  diaTextActivo: { color: '#FFFFFF' },
  scrollContent: { paddingBottom: 24 },
  franjaItem: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 16,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  franjaHora: {
    width: 56, height: 56, backgroundColor: '#E6F1FB', borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  franjaHoraText: { fontSize: 15, fontWeight: '700', color: '#1D74F2' },
  franjaInfo: { flex: 1 },
  franjaNombre: { fontSize: 16, fontWeight: '600', color: '#111827' },
  franjaDetalle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  emptyState: { padding: 48, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#6B7280' },
});
