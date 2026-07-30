import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppThemeProvider } from '@/components/ds';
import { RootNavigator } from '@/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
