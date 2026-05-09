import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isLoggedIn: boolean | null;
  userName: string;
  userEmail: string;
  userRole: string;
  login: (token: string, name: string, email: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: null,
  userName: '',
  userEmail: '',
  userRole: 'socio',
  login: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthProvider() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('socio');

  useEffect(() => {
    checkToken();
  }, []);

  async function checkToken() {
    const token = await AsyncStorage.getItem('token');
    const name = await AsyncStorage.getItem('userName');
    const email = await AsyncStorage.getItem('userEmail');
    const role = await AsyncStorage.getItem('userRole');
    if (token) {
      setUserName(name || '');
      setUserEmail(email || '');
      setUserRole(role || 'socio');
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }

  async function login(token: string, name: string, email: string, role: string = 'socio') {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('userName', name);
    await AsyncStorage.setItem('userEmail', email);
    await AsyncStorage.setItem('userRole', role);
    setUserName(name);
    setUserEmail(email);
    setUserRole(role);
    setIsLoggedIn(true);
  }

  async function logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userName');
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('userRole');
    setUserName('');
    setUserEmail('');
    setUserRole('socio');
    setIsLoggedIn(false);
  }

  return { isLoggedIn, userName, userEmail, userRole, login, logout };
}

export { AuthContext };