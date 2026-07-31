import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppThemeProvider } from '@/components/ds';
import { RootNavigator } from '@/navigation/RootNavigator';
import Constants from 'expo-constants';

void SplashScreen.preventAutoHideAsync().catch(() => {
  /* native splash unavailable (e.g. tests / web) */
});

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
