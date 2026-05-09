import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Reserva } from '../types';

interface BookingCardProps {
  reserva: Reserva;
  onCancel?: (id: string) => void;
  onPress?: () => void;
  esFutura: boolean;
}

export default function BookingCard({ reserva, onCancel, onPress, esFutura }: BookingCardProps) {
  const fecha = new Date(reserva.fecha_reserva + 'T00:00:00');
  const dia = fecha.getDate();
  const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const mes = meses[fecha.getMonth()];

  const nombreClase = reserva.clases?.nombre || 'Clase';
  const horario = reserva.clases?.horario || '';
  const sala = reserva.clases?.sala || '';

  const handleCancel = () => {
    if (Platform.OS === 'web') {
      const confirmar = typeof window !== 'undefined' && window.confirm(
        `¿Seguro que quieres cancelar tu reserva de ${nombreClase}?`
      );
      if (confirmar) onCancel?.(reserva.id);
      return;
    }

    Alert.alert(
      '¿Cancelar reserva?',
      `¿Seguro que quieres cancelar tu reserva de ${nombreClase}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, cancelar', style: 'destructive', onPress: () => onCancel?.(reserva.id) },
      ]
    );
  };

  const getBadge = () => {
    if (esFutura) {
      return (
        <View style={[styles.badge, { backgroundColor: '#D1FAE5' }]}>
          <Text style={[styles.badgeText, { color: '#10B981' }]}>Confirmada</Text>
        </View>
      );
    }
    if (reserva.estado === 'cancelada') {
      return (
        <View style={[styles.badge, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.badgeText, { color: '#EF4444' }]}>Cancelada</Text>
        </View>
      );
    }
    return (
      <View style={[styles.badge, { backgroundColor: '#F3F4F6' }]}>
        <Text style={[styles.badgeText, { color: '#6B7280' }]}>Asistida</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {esFutura && (
        <View style={styles.fechaBloque}>
          <Text style={styles.fechaDia}>{dia}</Text>
          <Text style={styles.fechaMes}>{mes}</Text>
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={styles.nombre} numberOfLines={1}>{nombreClase}</Text>
          {getBadge()}
        </View>
        <Text style={styles.caption}>
          {horario}{sala ? ` · ${sala}` : ''}
        </Text>

        {esFutura && onCancel && (
          <View style={styles.acciones}>
            <Text style={styles.verDetalles}>Ver detalles →</Text>
            <Text style={styles.separador}> · </Text>
            <TouchableOpacity
              onPress={(e) => {
                (e as any)?.stopPropagation?.();
                handleCancel();
              }}
            >
              <Text style={styles.cancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  fechaBloque: {
    width: 56,
    height: 56,
    backgroundColor: '#E6F1FB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fechaDia: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D74F2',
  },
  fechaMes: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1D74F2',
  },
  info: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nombre: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  caption: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  acciones: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  verDetalles: {
    fontSize: 13,
    color: '#6B7280',
  },
  separador: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  cancelar: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
});