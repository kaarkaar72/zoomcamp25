import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';

import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import GameRoomScreen from './src/screens/GameRoomScreen';
import JoinRoomScreen from './src/screens/JoinRoomScreen';
import CreateRoomScreen from './src/screens/CreateRoomScreen';
import GameplayScreen from './src/screens/GameplayScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import { AuthProvider } from './src/context/AuthContext';
import { GameProvider } from './src/context/GameContext';
import { theme } from './src/theme/theme';

// Firebase configuration
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return null; // You can add a loading screen here
  }

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <GameProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator
              initialRouteName={user ? "Home" : "Login"}
              screenOptions={{
                headerStyle: {
                  backgroundColor: theme.colors.primary,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Stack.Screen 
                name="Login" 
                component={LoginScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ title: 'Music Guessing Game' }}
              />
              <Stack.Screen 
                name="JoinRoom" 
                component={JoinRoomScreen} 
                options={{ title: 'Join Game Room' }}
              />
              <Stack.Screen 
                name="CreateRoom" 
                component={CreateRoomScreen} 
                options={{ title: 'Create Game Room' }}
              />
              <Stack.Screen 
                name="GameRoom" 
                component={GameRoomScreen} 
                options={{ title: 'Game Room' }}
              />
              <Stack.Screen 
                name="Gameplay" 
                component={GameplayScreen} 
                options={{ title: 'Guess the Song!' }}
              />
              <Stack.Screen 
                name="Leaderboard" 
                component={LeaderboardScreen} 
                options={{ title: 'Final Scores' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </GameProvider>
      </AuthProvider>
    </PaperProvider>
  );
}