import React from 'react';
import MapScreen from './components/MapScreen';
import GaleryScreen from './components/GaleryScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {


  return (
    <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={MapScreen} />
          <Stack.Screen name="Galery" component={GaleryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
}