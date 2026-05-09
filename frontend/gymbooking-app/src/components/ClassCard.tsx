import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Clase } from '../types';
import CapacityBar from './CapacityBar';

interface ClassCardProps {
  clase: Clase;
  onPress: () => void;
  reservasActuales?: number;
  yaReservada?: boolean;
}

export default function ClassCard({ clase, onPress, reservasActuales = 0, yaReservada = false }: ClassCardProps) {
  const libres = clase.capacidad_max - reservasActuales;
  const completo = libres <= 0;
  const instructorNombre = clase.instructor?.nombre_completo || 'Sin asignar';

  return (
    <TouchableOpacity style={[styles.card, yaReservada && styles.cardReservada]} onPress={onPress} activeOpacity={0.7}>
      {yaReservada && <View style={styles.bandaAzul} />}

      <View style={styles.content}>
        <View style={styles.topRow}>
          {clase.url_imagen ? (
            <Image source={{ uri: clase.url_imagen }} style={styles.imageThumbnail} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>{clase.nombre.charAt(0)}</Text>
            </View>
          )}

          <View style={styles.info}>
            <View style={styles.headerRow}>
              <Text style={styles.nombre} numberOfLines={1}>{clase.nombre}</Text>
              {yaReservada && (
                <View style={styles.badgeReservada}>
                  <Text style={styles.badgeReservadaText}>Reservada</Text>
                </View>
              )}
            </View>
            <Text style={styles.horario}>{clase.horario}</Text>
            <Text style={styles.caption}>{instructorNombre} · {clase.duracion_min} min</Text>
            {clase.sala && <Text style={styles.caption}>Sala: {clase.sala}</Text>}
          </View>
        </View>

        <CapacityBar actual={reservasActuales} max={clase.capacidad_max} />

        <View style={styles.footer}>
          {completo ? (
            <View style={styles.badgeCompleto}>
              <Text style={styles.badgeCompletoText}>Completo</Text>
            </View>
          ) : yaReservada ? (
            <Text style={styles.cancelarLink}>Cancelar</Text>
          ) : (
            <Text style={styles.reservarLink}>Reservar →</Text>
          )}
        </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    flexDirection: 'row',
  },
  cardReservada: {
    borderLeftWidth: 0,
  },
  bandaAzul: {
    width: 4,
    backgroundColor: '#1D74F2',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    marginRight: 0,
    marginLeft: -16,
    marginTop: -16,
    marginBottom: -16,
  },
  content: {
    flex: 1,
    marginLeft: 0,
  },
  topRow: {
    flexDirection: 'row',
  },
  imageThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#E6F1FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  imagePlaceholderText: {
    fontSize: 24,
    fontWeight: '700',
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
  },
  horario: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  caption: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  reservarLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D74F2',
  },
  cancelarLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  badgeCompleto: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeCompletoText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  badgeReservada: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeReservadaText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
});