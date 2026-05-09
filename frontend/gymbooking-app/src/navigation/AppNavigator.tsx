import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import ClassDetailScreen from '../screens/ClassDetailScreen';
import PersonalDataScreen from '../screens/PersonalDataScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import InfoScreen from '../screens/InfoScreen';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import AdminClassesScreen from '../screens/AdminClassesScreen';
import AdminScheduleScreen from '../screens/AdminScheduleScreen';
import AdminMembersScreen from '../screens/AdminMembersScreen';
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
    <NavigationContainer key={isLoggedIn ? 'app' : 'auth'}>
      {isLoggedIn ? (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="MainTabs" component={MainTabs} />
          <RootStack.Screen name="ClassDetail" component={ClassDetailScreen} />
          <RootStack.Screen name="PersonalData" component={PersonalDataScreen} />
          <RootStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <RootStack.Screen name="Notifications" component={NotificationsScreen} />
          <RootStack.Screen name="Info" component={InfoScreen} />
          <RootStack.Screen name="AdminHome" component={AdminHomeScreen} />
          <RootStack.Screen name="AdminClasses" component={AdminClassesScreen} />
          <RootStack.Screen name="AdminSchedule" component={AdminScheduleScreen} />
          <RootStack.Screen name="AdminMembers" component={AdminMembersScreen} />
        </RootStack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}