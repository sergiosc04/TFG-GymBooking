import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isLoggedIn: boolean | null;
  userName: string;
  userEmail: string;
  login: (token: string, name: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: null,
  userName: '',
  userEmail: '',
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

  useEffect(() => {
    checkToken();
  }, []);

  async function checkToken() {
    const token = await AsyncStorage.getItem('token');
    const name = await AsyncStorage.getItem('userName');
    const email = await AsyncStorage.getItem('userEmail');
    if (token) {
      setUserName(name || '');
      setUserEmail(email || '');
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }

  async function login(token: string, name: string, email: string) {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('userName', name);
    await AsyncStorage.setItem('userEmail', email);
    setUserName(name);
    setUserEmail(email);
    setIsLoggedIn(true);
  }

  async function logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userName');
    await AsyncStorage.removeItem('userEmail');
    setUserName('');
    setUserEmail('');
    setIsLoggedIn(false);
  }

  return { isLoggedIn, userName, userEmail, login, logout };
}

export { AuthContext };