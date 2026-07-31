import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppThemeProvider } from '@/components/ds';
import { RootNavigator } from '@/navigation/RootNavigator';
import Constants from 'expo-constants';

function App() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
// Default to rendering your app
let AppEntryPoint = App;

// Render Storybook if storybookEnabled is true
if (Constants.expoConfig?.extra?.storybookEnabled === 'true') {
  AppEntryPoint = require('../.rnstorybook').default;
}

export default AppEntryPoint;
