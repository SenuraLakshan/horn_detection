import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './src/screens/HomeScreen';
import HornDetection from './src/screens/HornDetection';
import EmergencyVehicleDetection from './src/screens/EmergencyVehicleDetection';
import DriverBehaviorMonitor from './src/screens/DriverBehaviorMonitor';
import EmergencySupportSystem from './src/screens/EmergencySupportSystem';

// Define the navigation stack's param list
type RootStackParamList = {
  Home: undefined;
  HornDetection: undefined;
  EmergencyVehicleDetection: undefined;
  DriverBehaviorMonitor: undefined;
  EmergencySupportSystem: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'Deaf Driver Safety System' }}
            />
            <Stack.Screen name="HornDetection" component={HornDetection} />
            <Stack.Screen name="EmergencyVehicleDetection" component={EmergencyVehicleDetection} />
            <Stack.Screen name="DriverBehaviorMonitor" component={DriverBehaviorMonitor} />
            <Stack.Screen name="EmergencySupportSystem" component={EmergencySupportSystem} />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
  );
}