import { Tabs } from 'expo-router';
import React from 'react';
import { useApp } from '../../context/AppProvider';

export default function TabsLayout() {
  const { state } = useApp();
  const isDark = state.theme === 'dark';
  const bg = isDark ? '#0b0f14' : '#ffffff';
  const bar = isDark ? '#121922' : '#f2f4f7';
  const active = isDark ? '#4f8cff' : '#1f3cff';
  const inactive = isDark ? '#9fb7d1' : '#667085';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: bar, borderTopColor: isDark ? '#223244' : '#e5e7eb' },
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarLabelStyle: { fontWeight: '600' },
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: bg }
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'My Decks' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
    </Tabs>
  );
}