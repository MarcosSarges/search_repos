import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import { useTheme } from '@/components/ds';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SearchStackNavigator } from '@/navigation/SearchStackNavigator';
import type { TabsParamList } from '@/navigation/types';
import { ConfigScreen } from '@/screens/ConfigScreen';
import { ExploreScreen } from '@/screens/ExploreScreen';
import { FavoritosScreen } from '@/screens/FavoritosScreen';

const Tabs = createBottomTabNavigator<TabsParamList>();

export function TabsNavigator() {
  const theme = useTheme();

  return (
    <Tabs.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Favoritos"
        component={FavoritosScreen}
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Config"
        component={ConfigScreen}
        options={{
          title: 'Config',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs.Navigator>
  );
}
