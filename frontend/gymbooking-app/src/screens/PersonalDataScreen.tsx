import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Platform, Alert, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

export default function PersonalDataScreen({ navigation }: any) {
  const { userName, userEmail, login } = useAuth();
  const [nombre, setNombre] = useState(userName);
  const [email] = useState(userEmail);
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const perfil = await api.getProfile();
      setNombre(perfil.nombre_completo || userName);
      setTelefono(perfil.telefono || '');
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleGuardar = async () => {
    if (nombre.trim().length < 3) {
      const msg = 'El nombre debe tener al menos 3 caracteres';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
      return;
    }
    setLoading(true);
    try {
      await api.updateProfile(nombre.trim(), telefono);
      // Actualizar el nombre en el contexto de auth local
      const token = await AsyncStorage.getItem('token');
      if (token) await login(token, nombre.trim(), userEmail);
      const msg = 'Tus datos se han guardado correctamente.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Datos actualizados', msg);
      navigation.goBack();
    } catch (error: any) {
      const msg = error.message || 'No se pudieron guardar los datos';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Datos personales</Text>
        <View style={{ width: 44 }} />
      </View>

      <Text style={styles.label}>Nombre completo</Text>
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

      <Text style={styles.label}>Email</Text>
      <TextInput style={[styles.input, styles.inputDisabled]} value={email} editable={false} />
      <Text style={styles.hint}>El email no se puede cambiar</Text>

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        value={telefono}
        onChangeText={setTelefono}
        placeholder="612345678"
        placeholderTextColor="#9CA3AF"
        keyboardType="numeric"
        maxLength={9}
      />

      <TouchableOpacity style={[styles.button, loading && { opacity: 0.5 }]} onPress={handleGuardar} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Guardar cambios</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  content: { paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: 56, paddingHorizontal: 16, marginTop: Platform.OS === 'ios' ? 50 : 30,
  },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 24, color: '#111827' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#111827' },
  label: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginTop: 24, marginBottom: 6, paddingHorizontal: 16 },
  input: {
    height: 48, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1,
    borderColor: '#E5E7EB', paddingHorizontal: 16, fontSize: 15, color: '#111827', marginHorizontal: 16,
  },
  inputDisabled: { backgroundColor: '#F3F4F6', color: '#9CA3AF' },
  hint: { fontSize: 12, color: '#9CA3AF', paddingHorizontal: 16, marginTop: 4 },
  button: {
    height: 52, backgroundColor: '#1D74F2', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 16, marginTop: 32,
  },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});