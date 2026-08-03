import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import { Icon, useTheme } from '@ds';
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
            <Icon size="lg" name="search" color={focused ? 'primary' : 'muted'} />
          ),
        }}
      />
      <Tabs.Screen
        name="Favoritos"
        component={FavoritosScreen}
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ focused }) => (
            <Icon size="lg" name="heart" color={focused ? 'primary' : 'muted'} />
          ),
        }}
      />
      <Tabs.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => (
            <Icon size="lg" name="paper-plane" color={focused ? 'primary' : 'muted'} />
          ),
        }}
      />
      <Tabs.Screen
        name="Config"
        component={ConfigScreen}
        options={{
          title: 'Config',
          tabBarIcon: ({ focused }) => (
            <Icon size="lg" name="settings" color={focused ? 'primary' : 'muted'} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}
