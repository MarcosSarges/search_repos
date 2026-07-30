import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { TabsNavigator } from '@/navigation/TabsNavigator';
import type { RootStackParamList } from '@/navigation/types';
import { ModalScreen } from '@/screens/ModalScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const colorScheme = useColorScheme();

  return (
    <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
        <Stack.Screen
          name="Modal"
          component={ModalScreen}
          options={{ presentation: 'modal', title: 'Modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
