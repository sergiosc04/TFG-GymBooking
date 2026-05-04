import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function RegisterScreen({ navigation }: any) {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Validaciones
  const nombreValido = nombreCompleto.trim().length >= 3;
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const telefonoValido = telefono === '' || /^\d{9}$/.test(telefono);
  const passwordValida = password.length >= 6 && /[a-zA-Z]/.test(password) && /\d/.test(password);

  const isDisabled = !nombreValido || !emailValido || !telefonoValido || !passwordValida || !aceptaTerminos;

  // Fortaleza de la contraseña
  const getPasswordStrength = () => {
    if (password.length === 0) return { level: 0, text: '', color: '#E5E7EB' };
    if (password.length < 6) return { level: 1, text: 'Débil', color: '#EF4444' };
    if (/[a-zA-Z]/.test(password) && /\d/.test(password) && password.length >= 8)
      return { level: 3, text: 'Fuerte', color: '#10B981' };
    return { level: 2, text: 'Media', color: '#F59E0B' };
  };

  const strength = getPasswordStrength();

  const handleRegister = async () => {
    if (isDisabled) return;
    setLoading(true);
    try {
      const response = await api.register(email.trim(), password, nombreCompleto.trim(), telefono);
      if (response.session) {
        await login(response.session.access_token, nombreCompleto.trim(), email.trim());
      } else {
        Alert.alert('Cuenta creada', 'Tu cuenta se ha creado. Inicia sesión.');
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear cuenta</Text>
          <View style={{ width: 44 }} />
        </View>

        <Text style={styles.subtitle}>Únete y empieza a reservar tus clases</Text>

        {/* Formulario */}
        <View style={styles.form}>
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Sergio Serrano"
            placeholderTextColor="#9CA3AF"
            value={nombreCompleto}
            onChangeText={setNombreCompleto}
            editable={!loading}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@email.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Teléfono (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="612345678"
            placeholderTextColor="#9CA3AF"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="numeric"
            maxLength={9}
            editable={!loading}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          {/* Indicador fortaleza */}
          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                <View style={[
                  styles.strengthFill,
                  { width: `${(strength.level / 3) * 100}%`, backgroundColor: strength.color }
                ]} />
              </View>
              <Text style={[styles.strengthText, { color: strength.color }]}>{strength.text}</Text>
            </View>
          )}

          {/* Checkbox términos */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAceptaTerminos(!aceptaTerminos)}
          >
            <View style={[styles.checkbox, aceptaTerminos && styles.checkboxChecked]}>
              {aceptaTerminos && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              Acepto los <Text style={styles.link}>términos</Text> y la{' '}
              <Text style={styles.link}>política de privacidad</Text>
            </Text>
          </TouchableOpacity>

          {/* Botón */}
          <TouchableOpacity
            style={[styles.button, (isDisabled || loading) && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isDisabled || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>

          {/* Link a login */}
          <TouchableOpacity
            style={styles.loginContainer}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.loginText}>
              ¿Ya tienes cuenta? <Text style={styles.loginLink}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    marginTop: Platform.OS === 'ios' ? 50 : 30,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 24,
    color: '#111827',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  input: {
    height: 48,
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  eyeIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#1D74F2',
    borderColor: '#1D74F2',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  checkboxText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  link: {
    color: '#1D74F2',
  },
  button: {
    height: 52,
    backgroundColor: '#1D74F2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  loginText: {
    fontSize: 15,
    color: '#6B7280',
  },
  loginLink: {
    color: '#1D74F2',
    fontWeight: '600',
  },
});