import React from 'react';
import { AuthContext, useAuthProvider } from './src/hooks/useAuth';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const auth = useAuthProvider();

  return (
    <AuthContext.Provider value={auth}>
      <AppNavigator />
    </AuthContext.Provider>
  );
}