import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';

const contenidos: Record<string, { titulo: string; texto: string }> = {
  terminos: {
    titulo: 'Términos y condiciones',
    texto: 'Al usar GymBooking aceptas las siguientes condiciones:\n\n1. Las reservas deben cancelarse con al menos 2 horas de antelación.\n\n2. No presentarse a una clase reservada puede resultar en restricciones temporales.\n\n3. El gimnasio se reserva el derecho de modificar horarios y clases sin previo aviso.\n\n4. Los datos personales se tratan conforme a la normativa vigente de protección de datos.\n\n5. El uso indebido de la aplicación puede resultar en la suspensión de la cuenta.\n\nÚltima actualización: Mayo 2026',
  },
  privacidad: {
    titulo: 'Política de privacidad',
    texto: 'GymBooking recopila y trata los siguientes datos personales:\n\n• Nombre completo y email para la gestión de tu cuenta.\n• Teléfono (opcional) para contacto en caso necesario.\n• Historial de reservas para ofrecerte estadísticas personales.\n\nTus datos se almacenan de forma segura en servidores de Supabase (AWS EU) y están protegidos mediante cifrado.\n\nNo compartimos tus datos con terceros. Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento.\n\nContacto: privacidad@gymbooking.app\n\nÚltima actualización: Mayo 2026',
  },
  ayuda: {
    titulo: 'Ayuda y soporte',
    texto: '¿Necesitas ayuda? Aquí tienes las preguntas más frecuentes:\n\n¿Cómo reservo una clase?\nVe a la pestaña "Clases", elige la que quieras y pulsa "Reservar plaza".\n\n¿Cómo cancelo una reserva?\nVe a "Mis reservas", busca la reserva y pulsa "Cancelar".\n\n¿Puedo reservar para otro día?\nSí, al pulsar "Reservar plaza" puedes elegir la fecha.\n\n¿Qué pasa si la clase está completa?\nNo podrás reservar hasta que alguien cancele.\n\n¿Cómo cierro sesión?\nVe a "Perfil" y pulsa "Cerrar sesión".\n\nSi tienes más dudas, contacta con recepción del gimnasio.',
  },
};

export default function InfoScreen({ route, navigation }: any) {
  const tipo = route.params?.tipo || 'ayuda';
  const contenido = contenidos[tipo] || contenidos.ayuda;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{contenido.titulo}</Text>
        <View style={{ width: 44 }} />
      </View>

      <Text style={styles.texto}>{contenido.texto}</Text>
    </ScrollView>
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
  texto: { fontSize: 15, color: '#374151', lineHeight: 24, padding: 16 },
});