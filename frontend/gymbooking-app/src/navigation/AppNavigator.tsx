import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import ClassDetailScreen from '../screens/ClassDetailScreen';
import { ActivityIndicator, View } from 'react-native';

const RootStack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F8FA' }}>
        <ActivityIndicator size="large" color="#1D74F2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="MainTabs" component={MainTabs} />
          <RootStack.Screen
            name="ClassDetail"
            component={ClassDetailScreen}
            options={{
              headerShown: false,
              presentation: 'card',
            }}
          />
        </RootStack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}