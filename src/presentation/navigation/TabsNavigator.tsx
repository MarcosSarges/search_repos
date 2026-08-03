import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import { Icon, useTheme } from '@/components/ds';
import { SearchStackNavigator } from '@/presentation/navigation/SearchStackNavigator';
import type { TabsParamList } from '@/presentation/navigation/types';
import { ConfigScreen } from '@/presentation/screens/ConfigScreen';
import { ExploreScreen } from '@/presentation/screens/ExploreScreen';
import { FavoritosScreen } from '@/presentation/screens/FavoritosScreen';

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
      }}>
      <Tabs.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => (
            <Icon variant="lg" name="search" tone={focused ? 'primary' : 'muted'} />
          ),
        }}
      />
      <Tabs.Screen
        name="Favoritos"
        component={FavoritosScreen}
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ focused }) => (
            <Icon variant="lg" name="heart" tone={focused ? 'primary' : 'muted'} />
          ),
        }}
      />
      <Tabs.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => (
            <Icon variant="lg" name="paper-plane" tone={focused ? 'primary' : 'muted'} />
          ),
        }}
      />
      <Tabs.Screen
        name="Config"
        component={ConfigScreen}
        options={{
          title: 'Config',
          tabBarIcon: ({ focused }) => (
            <Icon variant="lg" name="settings" tone={focused ? 'primary' : 'muted'} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}
