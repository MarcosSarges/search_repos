import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppThemeProvider } from '@/components/ds';
import { RootNavigator } from '@/navigation/RootNavigator';
import { AppContainerProvider } from '@/presentation/providers/AppContainerProvider';
import { AppQueryProvider } from '@/presentation/providers/AppQueryProvider';
import Constants from 'expo-constants';

void SplashScreen.preventAutoHideAsync().catch(() => {
  /* native splash unavailable (e.g. tests / web) */
});

function App() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <AppQueryProvider>
          <AppContainerProvider>
            <RootNavigator />
            <StatusBar style="auto" />
          </AppContainerProvider>
        </AppQueryProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
// Default to rendering your app
let AppEntryPoint = App;

// Render Storybook if storybookEnabled is true
if (Constants.expoConfig?.extra?.storybookEnabled === 'true') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  AppEntryPoint = require('../.rnstorybook').default;
}

export default AppEntryPoint;
