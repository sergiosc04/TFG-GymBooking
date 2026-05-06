import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Platform, TouchableOpacity } from 'react-native';

export default function NotificationsScreen({ navigation }: any) {
  const [recordatorios, setRecordatorios] = useState(true);
  const [novedades, setNovedades] = useState(false);
  const [cancelaciones, setCancelaciones] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.optionsContainer}>
        <View style={styles.option}>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Recordatorios de clase</Text>
            <Text style={styles.optionDesc}>15 minutos antes de tu clase reservada</Text>
          </View>
          <Switch value={recordatorios} onValueChange={setRecordatorios} trackColor={{ true: '#1D74F2' }} />
        </View>

        <View style={styles.separator} />

        <View style={styles.option}>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Novedades y clases nuevas</Text>
            <Text style={styles.optionDesc}>Cuando se añadan nuevas clases al catálogo</Text>
          </View>
          <Switch value={novedades} onValueChange={setNovedades} trackColor={{ true: '#1D74F2' }} />
        </View>

        <View style={styles.separator} />

        <View style={styles.option}>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Cancelaciones</Text>
            <Text style={styles.optionDesc}>Cuando se cancele una clase que tenías reservada</Text>
          </View>
          <Switch value={cancelaciones} onValueChange={setCancelaciones} trackColor={{ true: '#1D74F2' }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: 56, paddingHorizontal: 16, marginTop: Platform.OS === 'ios' ? 50 : 30,
  },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 24, color: '#111827' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#111827' },
  optionsContainer: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB', marginTop: 24,
  },
  option: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  optionInfo: { flex: 1, marginRight: 12 },
  optionTitle: { fontSize: 16, color: '#111827', fontWeight: '500' },
  optionDesc: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  separator: { height: 0.5, backgroundColor: '#E5E7EB', marginLeft: 16 },
});