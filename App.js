import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from './src/context/UserContext';
import GlassFitnessApp from './src/screens/GlassFitnessApp';
import { initDatabase } from './src/database/db';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const [dbReady, setDbReady] = React.useState(false);

  useEffect(() => {
    const setup = async () => {
      await initDatabase();
      setDbReady(true);
    };
    setup();
  }, []);

  if (!dbReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <UserProvider>
          <GlassFitnessApp />
          <StatusBar style="light" />
        </UserProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
