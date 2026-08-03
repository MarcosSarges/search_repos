import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';

import { useAppTheme } from '@/components/ds';
import { TabsNavigator } from '@/navigation/TabsNavigator';

export function RootNavigator() {
  const { mode } = useAppTheme();

  return (
    <NavigationContainer theme={mode === 'dark' ? DarkTheme : DefaultTheme}>
      <TabsNavigator />
    </NavigationContainer>
  );
}
