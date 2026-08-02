import { Slot, Tabs } from 'expo-router';
import { useThemeColors } from '@/src/stores/theme';
import { View, Text, Platform, type ColorValue } from 'react-native';
import { WebAppShell } from '@/src/web/WebAppShell';

function TabIcon({ name, color }: { name: string; color: ColorValue }) {
  return (
    <View className="items-center justify-center">
      <Text style={{ color, fontSize: 20 }}>{name}</Text>
    </View>
  );
}

export default function TabLayout() {
  if (Platform.OS === 'web') {
    return (
      <WebAppShell>
        <Slot />
      </WebAppShell>
    );
  }

  return <NativeTabLayout />;
}

function NativeTabLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.headerBg,
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: colors.text,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon name="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: 'Diary',
          tabBarIcon: ({ color }) => <TabIcon name="🍽️" color={color} />,
        }}
      />
      <Tabs.Screen
        name="fasting"
        options={{
          title: 'Fasting',
          tabBarIcon: ({ color }) => <TabIcon name="⏱️" color={color} />,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color }) => <TabIcon name="🏋️" color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <TabIcon name="📊" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cycle"
        options={{
          title: 'Cycle',
          tabBarIcon: ({ color }) => <TabIcon name="🩸" color={color} />,
        }}
      />
      <Tabs.Screen
        name="meditation"
        options={{
          title: 'Mindful',
          tabBarIcon: ({ color }) => <TabIcon name="🧘" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="👤" color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <TabIcon name="👥" color={color} />,
        }}
      />
    </Tabs>
  );
}
