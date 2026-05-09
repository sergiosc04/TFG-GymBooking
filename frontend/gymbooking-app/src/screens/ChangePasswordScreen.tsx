import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { api } from '../services/api';

export default function ChangePasswordScreen({ navigation }: any) {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCambiar = async () => {
    if (nueva.length < 6) {
      Platform.OS === 'web' ? window.alert('La contraseña debe tener mínimo 6 caracteres') : Alert.alert('Error', 'La contraseña debe tener mínimo 6 caracteres');
      return;
    }
    if (nueva !== confirmar) {
      Platform.OS === 'web' ? window.alert('Las contraseñas no coinciden') : Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await api.changePassword(nueva);
      const msg = 'Contraseña actualizada correctamente';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Éxito', msg);
      navigation.goBack();
    } catch (error: any) {
      const msg = error.message || 'No se pudo cambiar la contraseña';
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
        <Text style={styles.headerTitle}>Cambiar contraseña</Text>
        <View style={{ width: 44 }} />
      </View>

      <Text style={styles.label}>Contraseña actual</Text>
      <TextInput style={styles.input} value={actual} onChangeText={setActual} secureTextEntry placeholder="Tu contraseña actual" placeholderTextColor="#9CA3AF" />

      <Text style={styles.label}>Nueva contraseña</Text>
      <TextInput style={styles.input} value={nueva} onChangeText={setNueva} secureTextEntry placeholder="Mínimo 6 caracteres" placeholderTextColor="#9CA3AF" />

      <Text style={styles.label}>Confirmar nueva contraseña</Text>
      <TextInput style={styles.input} value={confirmar} onChangeText={setConfirmar} secureTextEntry placeholder="Repite la contraseña" placeholderTextColor="#9CA3AF" />

      <TouchableOpacity style={[styles.button, loading && { opacity: 0.5 }]} onPress={handleCambiar} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Cambiar contraseña</Text>
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
  button: {
    height: 52, backgroundColor: '#1D74F2', borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 16, marginTop: 32,
  },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});