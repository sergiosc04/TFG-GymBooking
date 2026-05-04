import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CapacityBarProps {
  actual: number;
  max: number;
}

export default function CapacityBar({ actual, max }: CapacityBarProps) {
  const libres = max - actual;
  const porcentajeOcupado = max > 0 ? actual / max : 0;

  const color =
    porcentajeOcupado < 0.5 ? '#10B981' :
    porcentajeOcupado < 0.75 ? '#F59E0B' :
    '#EF4444';

  const texto =
    libres === 0 ? 'Completo' :
    porcentajeOcupado >= 0.75 ? `Solo ${libres} libres` :
    `${libres} libres`;

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${porcentajeOcupado * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.text, { color }]}>{actual}/{max} plazas · {texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  barBackground: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  text: {
    fontSize: 12,
    marginTop: 4,
  },
});