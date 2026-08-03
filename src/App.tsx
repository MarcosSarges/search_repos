import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppThemeProvider } from '@/presentation/theme';
import { RootNavigator } from '@/presentation/navigation/RootNavigator';
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
          <RootNavigator />
          <StatusBar style="auto" />
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
