import { View, Text, TouchableOpacity, ScrollView, Alert, Switch, Linking, Share } from 'react-native';
import { COLORS } from '@/src/constants/theme';
import { useAuthStore } from '@/src/stores/auth';
import { useThemeStore, useThemeColors } from '@/src/stores/theme';
import { useNotificationStore } from '@/src/stores/notifications';
import { useDiaryStore } from '@/src/stores/diary';
import { useBodyStore } from '@/src/stores/body';
import { useWorkoutStore } from '@/src/stores/workout';
import { useFastingStore } from '@/src/stores/fasting';
import { useWaterStore } from '@/src/stores/water';
import { useMeditationStore } from '@/src/stores/meditation';
import { useCycleStore } from '@/src/stores/cycle';
import { supabase } from '@/src/lib/supabase';
import { trackScreen } from '@/src/lib/analytics';
import { useEffect, useState } from 'react';
import type { Profile } from '@/src/types';
import { SunDim, MoonStars, Monitor } from 'phosphor-react-native';

export default function ProfileScreen() {
  useEffect(() => { trackScreen('profile'); }, []);
  const { user, signOut } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setProfile(data as Profile);
        setLoading(false);
      });
  }, [user]);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This permanently deletes all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.rpc('delete_user');
            if (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    const data = {
      exportedAt: new Date().toISOString(),
      diary: useDiaryStore.getState().entries,
      weight: useBodyStore.getState().weightEntries,
      measurements: useBodyStore.getState().measurements,
      workouts: useWorkoutStore.getState().history,
      fasting: useFastingStore.getState().history,
      water: useWaterStore.getState().waterMl,
      meditation: useMeditationStore.getState().sessions,
      cycle: useCycleStore.getState().entries,
    };

    const json = JSON.stringify(data, null, 2);

    try {
      await Share.share({
        message: json,
        title: 'Aurashape Data Export',
      });
    } catch {
      Alert.alert('Export Ready', 'Data export complete. You can share it from the share sheet.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-8">
        <Text className="text-2xl font-bold" style={{ color: COLORS.primaryDark }}>
          Profile
        </Text>
        <Text className="mt-1 text-gray-500">{user?.email}</Text>
      </View>

      {loading ? (
        <View className="p-6">
          <Text className="text-gray-400">Loading profile...</Text>
        </View>
      ) : profile ? (
        <View className="px-6 pt-6">
          <View className="rounded-xl bg-gray-50 p-5">
            <ProfileRow label="Goal" value={profile.goal?.replace(/_/g, ' ') || 'Not set'} />
            <ProfileRow label="Activity" value={profile.activity_level?.replace(/_/g, ' ') || 'Not set'} />
            <ProfileRow label="Diet" value={profile.dietary_preference?.replace(/_/g, ' ') || 'Not set'} />
            <ProfileRow label="Fasting" value={profile.fasting_plan || '16:8'} />
            {profile.calorie_target && (
              <ProfileRow label="Calorie target" value={`${profile.calorie_target} kcal`} />
            )}
            {profile.protein_target_g && (
              <ProfileRow label="Protein" value={`${profile.protein_target_g}g`} />
            )}
            <View className="flex-row justify-between border-gray-100 py-2">
              <Text className="text-gray-500">Units</Text>
              <Text className="font-medium">{profile.unit_system === 'metric' ? 'Metric' : 'Imperial'}</Text>
            </View>
          </View>
        </View>
      ) : null}

      <View className="px-6 pt-8 pb-12">
        <Text className="mb-4 text-lg font-semibold" style={{ color: COLORS.primaryDark }}>
          Settings
        </Text>

        <SettingsButton label="Edit Profile" />
        <NotificationToggles />
        <SettingsButton label="Units (Metric / Imperial)" />
        <DarkModeToggle />
        <SettingsButton label="Export My Data" onPress={handleExportData} />
        <SettingsButton label="Privacy Policy" onPress={() => Linking.openURL('https://aurashape.app/privacy')} />
        <SettingsButton label="Terms of Service" onPress={() => Linking.openURL('https://aurashape.app/terms')} />

        <View className="mt-8">
          <TouchableOpacity
            className="rounded-xl border border-gray-200 py-4"
            onPress={handleSignOut}
          >
            <Text className="text-center text-base font-medium text-red-500">Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-3 rounded-xl py-4"
            onPress={handleDeleteAccount}
          >
            <Text className="text-center text-base text-gray-400">Delete Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between border-b border-gray-100 py-2">
      <Text className="text-gray-500">{label}</Text>
      <Text className="font-medium capitalize">{value}</Text>
    </View>
  );
}

function SettingsButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity
      className="border-b border-gray-100 py-4"
      onPress={onPress}
    >
      <Text className="text-base text-gray-700">{label}</Text>
    </TouchableOpacity>
  );
}

function NotificationToggles() {
  const prefs = useNotificationStore();
  const colors = useThemeColors();

  return (
    <View className="border-b py-4" style={{ borderColor: colors.border }}>
      <Text className="text-base mb-3" style={{ color: colors.text }}>Notifications</Text>
      <ToggleRow label="Fasting reminders" value={prefs.fastingReminders} onChange={(v) => prefs.setPref('fastingReminders', v)} />
      <ToggleRow label="Cycle reminders" value={prefs.cycleReminders} onChange={(v) => prefs.setPref('cycleReminders', v)} />
      <ToggleRow label="Meditation prompts" value={prefs.meditationReminder} onChange={(v) => prefs.setPref('meditationReminder', v)} />
      <ToggleRow label="Meal log reminders" value={prefs.mealReminders} onChange={(v) => prefs.setPref('mealReminders', v)} />
      <ToggleRow label="Weekly science tips" value={prefs.weeklyTips} onChange={(v) => prefs.setPref('weeklyTips', v)} />
    </View>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View className="flex-row justify-between items-center py-1.5">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#E5E7EB', true: COLORS.primary + '60' }}
        thumbColor={value ? COLORS.primary : '#9CA3AF'}
      />
    </View>
  );
}

function DarkModeToggle() {
  const { mode, setMode } = useThemeStore();
  const options: Array<{ mode: 'system' | 'light' | 'dark'; icon: React.ReactNode; label: string }> = [
    { mode: 'system', icon: <Monitor size={18} color="#6B7280" weight="fill" />, label: 'System' },
    { mode: 'light', icon: <SunDim size={18} color="#F59E0B" weight="fill" />, label: 'Light' },
    { mode: 'dark', icon: <MoonStars size={18} color="#6B7280" weight="fill" />, label: 'Dark' },
  ];

  return (
    <View className="border-b border-gray-100 py-4">
      <Text className="text-base text-gray-700 mb-3">Theme</Text>
      <View className="flex-row gap-2">
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.mode}
            onPress={() => setMode(opt.mode)}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-xl"
            style={{
              backgroundColor: mode === opt.mode ? COLORS.primary : '#F3F4F6',
            }}
          >
            {opt.icon}
            <Text
              className={`text-xs font-semibold ${mode === opt.mode ? 'text-white' : 'text-gray-500'}`}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
