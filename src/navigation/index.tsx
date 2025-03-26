// filepath: /GSBVTTMobile/GSBVTTMobile/src/navigation/index.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VisitListScreen from '../screens/visits/VisitListScreen';
import CreateVisitScreen from '../screens/visits/CreateVisitScreen';
import VisitDetailScreen from '../screens/visits/VisitDetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function VisitStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="VisitList" component={VisitListScreen} />
      <Stack.Screen name="CreateVisit" component={CreateVisitScreen} />
      <Stack.Screen name="VisitDetail" component={VisitDetailScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Auth" component={AuthStack} />
        <Tab.Screen name="Visits" component={VisitStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}