import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthContext, useAuthProvider } from './src/hooks/useAuth';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const auth = useAuthProvider();

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={auth}>
        <AppNavigator />
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}