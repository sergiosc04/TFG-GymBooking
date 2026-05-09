import React, { useEffect, useState, useCallback } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Platform, Image, RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../services/api';
import { Clase } from '../types';

export default function AdminHomeScreen({ navigation, route }: any) {
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Campos del formulario
  const [editId, setEditId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [horario, setHorario] = useState('');
  const [sala, setSala] = useState('');
  const [duracionMin, setDuracionMin] = useState('60');
  const [capacidadMax, setCapacidadMax] = useState('20');
  const [descripcion, setDescripcion] = useState('');

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

  // Si venimos de AdminClassesScreen con una clase para editar
  useEffect(() => {
    if (route.params?.claseEditar) {
      const c = route.params.claseEditar;
      setEditId(c.id);
      setNombre(c.nombre);
      setHorario(c.horario);
      setSala(c.sala || '');
      setDuracionMin(String(c.duracion_min));
      setCapacidadMax(String(c.capacidad_max));
      setDescripcion(c.descripcion || '');
      setImageUri(c.url_imagen || null);
      navigation.setParams({ claseEditar: undefined });
    }
  }, [route.params?.claseEditar]);

  const limpiarFormulario = () => {
    setEditId(null);
    setNombre('');
    setHorario('');
    setSala('');
    setDuracionMin('60');
    setCapacidadMax('20');
    setDescripcion('');
    setImageUri(null);
  };

  const seleccionarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Se necesita acceso a la galería para seleccionar una imagen.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [2, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleGuardar = async () => {
    if (!nombre.trim() || !horario.trim()) {
      const msg = 'El nombre y el horario son obligatorios';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
      return;
    }

    setSaving(true);
    try {
      const claseData = {
        nombre: nombre.trim(),
        horario: horario.trim(),
        sala: sala.trim() || null,
        duracion_min: parseInt(duracionMin) || 60,
        capacidad_max: parseInt(capacidadMax) || 20,
        descripcion: descripcion.trim() || null,
      };

      let claseId: string;

      if (editId) {
        const updated = await api.adminUpdateClass(editId, claseData);
        claseId = updated.id;
      } else {
        const created = await api.adminCreateClass(claseData);
        claseId = created.id;
      }

      // Subir imagen si se seleccionó una nueva (URI local, no URL existente)
      if (imageUri && !imageUri.startsWith('http')) {
        await api.adminUploadClassImage(claseId, imageUri);
      }

      const msg = editId ? 'Clase actualizada correctamente' : 'Clase creada correctamente';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Éxito', msg);
      limpiarFormulario();
      cargarClases();
    } catch (error: any) {
      const msg = error.message || 'Error al guardar la clase';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = (clase: Clase) => {
    Alert.alert(
      '¿Eliminar clase?',
      `¿Seguro que quieres eliminar "${clase.nombre}"? Se eliminarán también todas sus reservas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.adminDeleteClass(clase.id);
              cargarClases();
              if (editId === clase.id) limpiarFormulario();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo eliminar');
            }
          },
        },
      ]
    );
  };

  const cargarClaseEnFormulario = (clase: Clase) => {
    setEditId(clase.id);
    setNombre(clase.nombre);
    setHorario(clase.horario);
    setSala(clase.sala || '');
    setDuracionMin(String(clase.duracion_min));
    setCapacidadMax(String(clase.capacidad_max));
    setDescripcion(clase.descripcion || '');
    setImageUri(clase.url_imagen || null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D74F2" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargarClases(); }} tintColor="#1D74F2" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Panel admin</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Accesos rápidos */}
      <View style={styles.accesosRow}>
        <TouchableOpacity style={styles.accesoBtn} onPress={() => navigation.navigate('AdminClasses')}>
          <FontAwesome5 name="dumbbell" size={16} color="#1D74F2" />
          <Text style={styles.accesoText}>Clases</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accesoBtn} onPress={() => navigation.navigate('AdminSchedule')}>
          <FontAwesome5 name="calendar-alt" size={16} color="#1D74F2" />
          <Text style={styles.accesoText}>Horarios</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accesoBtn} onPress={() => navigation.navigate('AdminMembers')}>
          <FontAwesome5 name="users" size={16} color="#1D74F2" />
          <Text style={styles.accesoText}>Socios</Text>
        </TouchableOpacity>
      </View>

      {/* Formulario */}
      <Text style={styles.seccionTitulo}>
        {editId ? 'Editar clase' : 'Nueva clase'}
      </Text>

      {/* Imagen */}
      <TouchableOpacity style={styles.imagePicker} onPress={seleccionarImagen}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <FontAwesome5 name="camera" size={24} color="#9CA3AF" />
            <Text style={styles.imagePlaceholderText}>Añadir imagen</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.formRow}>
        <View style={styles.formFieldHalf}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Ej: Yoga" placeholderTextColor="#9CA3AF" />
        </View>
        <View style={styles.formFieldHalf}>
          <Text style={styles.label}>Horario</Text>
          <TextInput style={styles.input} value={horario} onChangeText={setHorario} placeholder="Ej: L y X 09:00" placeholderTextColor="#9CA3AF" />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formFieldHalf}>
          <Text style={styles.label}>Sala</Text>
          <TextInput style={styles.input} value={sala} onChangeText={setSala} placeholder="Ej: Sala 1" placeholderTextColor="#9CA3AF" />
        </View>
        <View style={styles.formFieldHalf}>
          <Text style={styles.label}>Duración (min)</Text>
          <TextInput style={styles.input} value={duracionMin} onChangeText={setDuracionMin} keyboardType="numeric" placeholderTextColor="#9CA3AF" />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formFieldHalf}>
          <Text style={styles.label}>Capacidad máx.</Text>
          <TextInput style={styles.input} value={capacidadMax} onChangeText={setCapacidadMax} keyboardType="numeric" placeholderTextColor="#9CA3AF" />
        </View>
        <View style={styles.formFieldHalf} />
      </View>

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Descripción de la clase"
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={3}
      />

      <View style={styles.formActions}>
        <TouchableOpacity
          style={[styles.btnGuardar, saving && { opacity: 0.5 }]}
          onPress={handleGuardar}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnGuardarText}>{editId ? 'Guardar cambios' : 'Crear clase'}</Text>
          )}
        </TouchableOpacity>
        {editId && (
          <TouchableOpacity style={styles.btnCancelar} onPress={limpiarFormulario}>
            <Text style={styles.btnCancelarText}>Cancelar edición</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de clases */}
      <Text style={[styles.seccionTitulo, { marginTop: 32 }]}>Clases existentes ({clases.length})</Text>
      {clases.map((clase) => (
        <View key={clase.id} style={styles.claseItem}>
          {clase.url_imagen ? (
            <Image source={{ uri: clase.url_imagen }} style={styles.claseThumb} />
          ) : (
            <View style={[styles.claseThumb, styles.claseThumbPlaceholder]}>
              <Text style={styles.claseThumbText}>{clase.nombre.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.claseInfo}>
            <Text style={styles.claseNombre} numberOfLines={1}>{clase.nombre}</Text>
            <Text style={styles.claseDetalle}>{clase.horario}</Text>
            <Text style={styles.claseDetalle}>{clase.instructor?.nombre_completo || 'Sin instructor'} · {clase.sala || 'Sin sala'}</Text>
          </View>
          <View style={styles.claseActions}>
            <TouchableOpacity onPress={() => cargarClaseEnFormulario(clase)} style={styles.claseActionBtn}>
              <FontAwesome5 name="edit" size={14} color="#1D74F2" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEliminar(clase)} style={styles.claseActionBtn}>
              <FontAwesome5 name="trash" size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  scrollContent: { paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F8FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: 56, paddingHorizontal: 16, marginTop: Platform.OS === 'ios' ? 50 : 30,
  },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 24, color: '#111827' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#111827' },
  accesosRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 24 },
  accesoBtn: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB',
  },
  accesoText: { fontSize: 12, fontWeight: '600', color: '#111827', marginTop: 6 },
  seccionTitulo: { fontSize: 17, fontWeight: '600', color: '#111827', paddingHorizontal: 16, marginBottom: 12 },
  imagePicker: { marginHorizontal: 16, marginBottom: 16, borderRadius: 12, overflow: 'hidden' },
  imagePreview: { width: '100%', height: 150, borderRadius: 12 },
  imagePlaceholder: {
    width: '100%', height: 150, backgroundColor: '#E5E7EB', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#D1D5DB', borderStyle: 'dashed',
  },
  imagePlaceholderText: { fontSize: 13, color: '#9CA3AF', marginTop: 8 },
  formRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  formFieldHalf: { flex: 1 },
  label: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 4, paddingHorizontal: 16 },
  input: {
    height: 44, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1,
    borderColor: '#E5E7EB', paddingHorizontal: 12, fontSize: 14, color: '#111827', marginHorizontal: 16,
  },
  inputMultiline: { height: 80, textAlignVertical: 'top', paddingTop: 10, marginBottom: 16 },
  formActions: { paddingHorizontal: 16, gap: 8 },
  btnGuardar: {
    height: 48, backgroundColor: '#1D74F2', borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  btnGuardarText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  btnCancelar: { height: 40, justifyContent: 'center', alignItems: 'center' },
  btnCancelarText: { fontSize: 14, color: '#6B7280' },
  claseItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    marginHorizontal: 16, marginBottom: 8, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  claseThumb: { width: 48, height: 48, borderRadius: 8, marginRight: 12 },
  claseThumbPlaceholder: { backgroundColor: '#E6F1FB', justifyContent: 'center', alignItems: 'center' },
  claseThumbText: { fontSize: 18, fontWeight: '700', color: '#1D74F2' },
  claseInfo: { flex: 1 },
  claseNombre: { fontSize: 15, fontWeight: '600', color: '#111827' },
  claseDetalle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  claseActions: { flexDirection: 'row', gap: 12 },
  claseActionBtn: { padding: 8 },
});
