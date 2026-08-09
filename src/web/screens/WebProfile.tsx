import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  StyleSheet,
  useWindowDimensions,
  Linking,
} from 'react-native';
import { useAuthStore } from '@/src/stores/auth';
import { useThemeStore } from '@/src/stores/theme';
import { useNotificationStore } from '@/src/stores/notifications';
import { useDiaryStore } from '@/src/stores/diary';
import { useBodyStore } from '@/src/stores/body';
import { useWorkoutStore } from '@/src/stores/workout';
import { useFastingStore } from '@/src/stores/fasting';
import { useWaterStore } from '@/src/stores/water';
import { useMeditationStore } from '@/src/stores/meditation';
import { useCycleStore } from '@/src/stores/cycle';
import { supabase } from '@/src/lib/supabase';
import type { Profile } from '@/src/types';
import { WebCard } from '../WebCard';
import { WebButton } from '../WebButton';
import { MetricCard } from '../MetricCard';
import { getWebTokens, WEB_TOKENS } from '../tokens';
import { useIsDark } from '@/src/stores/theme';
import { isLocalOnly } from '@/src/lib/privacyMode';
import { clearLocalUserData } from '@/src/lib/localData';

export function WebProfile() {
  useEffect(() => {
    try { require('@/src/lib/analytics').trackScreen('profile'); } catch {}
  }, []);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const tokens = getWebTokens(useIsDark());

  const { user, signOut } = useAuthStore();
  const diaryCount = useDiaryStore((s) => s.entries.length);
  const workoutCount = useWorkoutStore((s) => s.history.length);
  const mindfulCount = useMeditationStore((s) => s.sessions.length);
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
    Alert.alert('Delete Account', 'This permanently deletes all your data. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        if (isLocalOnly()) {
          await clearLocalUserData();
          Alert.alert('Deleted', 'Your local data has been deleted from this device.');
          return;
        }
        const { error } = await supabase.rpc('delete_user');
        if (error) Alert.alert('Error', error.message);
      }},
    ]);
  };

  const handleExportData = () => {
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
    Alert.alert('Export', `Data exported: ${JSON.stringify(data).length} characters. You can copy it from the console.`);
    console.log('Aurashape Data Export', JSON.stringify(data, null, 2));
  };

  const leftColumn = (
    <View style={styles.column}>
      <WebCard>
        <View style={styles.profileTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.email?.split('@')[0] || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
        </View>
      </WebCard>

      {loading ? (
        <WebCard>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </WebCard>
      ) : profile ? (
        <WebCard>
          <Text style={styles.sectionLabel}>Profile Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Goal</Text>
            <Text style={styles.detailValue}>{profile.goal?.replace(/_/g, ' ') || 'Not set'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Activity</Text>
            <Text style={styles.detailValue}>{profile.activity_level?.replace(/_/g, ' ') || 'Not set'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Diet</Text>
            <Text style={styles.detailValue}>{profile.dietary_preference?.replace(/_/g, ' ') || 'Not set'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fasting</Text>
            <Text style={styles.detailValue}>{profile.fasting_plan || '16:8'}</Text>
          </View>
          {profile.calorie_target && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Calorie target</Text>
              <Text style={styles.detailValue}>{profile.calorie_target} kcal</Text>
            </View>
          )}
          {profile.protein_target_g && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Protein</Text>
              <Text style={styles.detailValue}>{profile.protein_target_g}g</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Units</Text>
            <Text style={styles.detailValue}>{profile.unit_system === 'metric' ? 'Metric' : 'Imperial'}</Text>
          </View>
        </WebCard>
      ) : null}

      <View style={styles.statRow}>
        <MetricCard label="Meals logged" value={String(diaryCount)} icon="🍽️" />
        <MetricCard label="Workouts" value={String(workoutCount)} icon="💪" />
        <MetricCard label="Mindful sessions" value={String(mindfulCount)} icon="🧘" />
      </View>
    </View>
  );

  const rightColumn = (
    <View style={styles.column}>
      <WebCard>
        <Text style={styles.sectionLabel}>Settings</Text>
        <SettingRow label="Edit Profile" />
        <NotificationSettings />
        <SettingRow label="Units (Metric / Imperial)" />
        <ThemeSettings />
        <TouchableOpacity onPress={handleExportData} style={styles.settingBtn}>
          <Text style={styles.settingBtnText}>Export My Data</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://aurashape.pages.dev/privacy')}
          style={styles.settingBtn}
        >
          <Text style={styles.settingBtnText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://aurashape.pages.dev/terms')}
          style={styles.settingBtn}
        >
          <Text style={styles.settingBtnText}>Terms of Service</Text>
        </TouchableOpacity>
      </WebCard>

      <WebCard>
        <View style={styles.accountActions}>
          <WebButton label="Sign Out" variant="secondary" onPress={handleSignOut} />
          <WebButton label="Delete Account" variant="ghost" onPress={handleDeleteAccount} />
        </View>
      </WebCard>
    </View>
  );

  return (
    <View style={[styles.page, { backgroundColor: tokens.colors.page }]}>
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: tokens.colors.text }]}>Profile</Text>
        <Text style={[styles.pageSub, { color: tokens.colors.textMuted }]}>{user?.email}</Text>
      </View>
      <ScrollView style={styles.scroll}>
        <View style={isDesktop ? styles.desktopGrid : styles.mobileStack}>
          {isDesktop ? (
            <>{leftColumn}{rightColumn}</>
          ) : (
            <>{leftColumn}{rightColumn}</>
          )}
        </View>
        <View style={{ height: WEB_TOKENS.spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

function SettingRow({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.settingBtn}>
      <Text style={styles.settingBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function NotificationSettings() {
  const prefs = useNotificationStore();
  return (
    <View style={styles.settingSection}>
      <Text style={styles.sectionHeading}>Notifications</Text>
      <ToggleBox label="Fasting reminders" value={prefs.fastingReminders} onChange={(v) => prefs.setPref('fastingReminders', v)} />
      <ToggleBox label="Cycle reminders" value={prefs.cycleReminders} onChange={(v) => prefs.setPref('cycleReminders', v)} />
      <ToggleBox label="Meditation prompts" value={prefs.meditationReminder} onChange={(v) => prefs.setPref('meditationReminder', v)} />
      <ToggleBox label="Meal log reminders" value={prefs.mealReminders} onChange={(v) => prefs.setPref('mealReminders', v)} />
      <ToggleBox label="Weekly science tips" value={prefs.weeklyTips} onChange={(v) => prefs.setPref('weeklyTips', v)} />
    </View>
  );
}

function ToggleBox({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#E5E7EB', true: WEB_TOKENS.colors.primary + '60' }}
        thumbColor={value ? WEB_TOKENS.colors.primary : '#9CA3AF'}
      />
    </View>
  );
}

function ThemeSettings() {
  const { mode, setMode } = useThemeStore();
  const options: Array<{ mode: 'system' | 'light' | 'dark'; icon: string; label: string }> = [
    { mode: 'system', icon: '🖥️', label: 'System' },
    { mode: 'light', icon: '☀️', label: 'Light' },
    { mode: 'dark', icon: '🌙', label: 'Dark' },
  ];

  return (
    <View style={styles.settingSection}>
      <Text style={styles.sectionHeading}>Theme</Text>
      <View style={styles.themeRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.mode}
            onPress={() => setMode(opt.mode)}
            style={[styles.themeBtn, mode === opt.mode ? styles.themeBtnActive : undefined]}
          >
            <Text style={styles.themeBtnIcon}>{opt.icon}</Text>
            <Text style={[styles.themeBtnLabel, mode === opt.mode ? styles.themeBtnLabelActive : undefined]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  header: {
    paddingHorizontal: WEB_TOKENS.spacing.lg,
    paddingTop: WEB_TOKENS.spacing.xl,
    paddingBottom: WEB_TOKENS.spacing.md,
  },
  pageTitle: {
    ...WEB_TOKENS.typography.heading,
    color: WEB_TOKENS.colors.text,
  },
  pageSub: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  desktopGrid: {
    flexDirection: 'row',
    paddingHorizontal: WEB_TOKENS.spacing.lg,
    gap: WEB_TOKENS.spacing.lg,
  },
  mobileStack: {
    paddingHorizontal: WEB_TOKENS.spacing.md,
    gap: WEB_TOKENS.spacing.md,
  },
  column: {
    flex: 1,
    gap: WEB_TOKENS.spacing.md,
  },
  sectionLabel: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    marginBottom: WEB_TOKENS.spacing.md,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WEB_TOKENS.spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: WEB_TOKENS.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
  },
  userName: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
    textTransform: 'capitalize',
  },
  userEmail: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginTop: 2,
  },
  loadingText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontStyle: 'italic',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: WEB_TOKENS.colors.surfaceMuted,
  },
  detailLabel: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
  },
  detailValue: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statRow: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
  },
  settingBtn: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: WEB_TOKENS.colors.surfaceMuted,
  },
  settingBtnText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
  },
  settingSection: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: WEB_TOKENS.colors.surfaceMuted,
  },
  sectionHeading: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  toggleLabel: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 13,
  },
  themeRow: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
  },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: WEB_TOKENS.radii.sm,
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
  },
  themeBtnActive: {
    backgroundColor: WEB_TOKENS.colors.primary,
  },
  themeBtnIcon: {
    fontSize: 14,
  },
  themeBtnLabel: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
  },
  themeBtnLabelActive: {
    color: WEB_TOKENS.colors.surface,
  },
  accountActions: {
    gap: WEB_TOKENS.spacing.sm,
  },
});
