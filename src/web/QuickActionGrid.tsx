import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { WEB_TOKENS } from './tokens';

interface ActionItem {
  icon: string;
  label: string;
  onPress: () => void;
  bg: string;
}

function QuickActionTile({ icon, label, onPress, bg }: ActionItem) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: bg },
        pressed ? styles.tilePressed : undefined,
      ]}
    >
      <Text style={styles.tileIcon}>{icon}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </Pressable>
  );
}

const ACTIONS: ActionItem[] = [
  {
    icon: '📝',
    label: 'Log Meal',
    bg: '#ECFDF5',
    onPress: () => router.navigate('/(tabs)/diary'),
  },
  {
    icon: '📷',
    label: 'Scan',
    bg: '#EFF6FF',
    onPress: () => router.push('/barcode'),
  },
  {
    icon: '🥘',
    label: 'Recipes',
    bg: '#FFF7ED',
    onPress: () => router.push('/recipes' as any),
  },
  {
    icon: '⏱️',
    label: 'Fast',
    bg: '#F5F3FF',
    onPress: () => router.navigate('/(tabs)/fasting'),
  },
  {
    icon: '🏋️',
    label: 'Workout',
    bg: '#FFF7ED',
    onPress: () => router.navigate('/(tabs)/workout'),
  },
  {
    icon: '📖',
    label: 'Learn',
    bg: '#FFFBEB',
    onPress: () => router.push('/articles'),
  },
];

export function QuickActionGrid() {
  const { width } = useWindowDimensions();
  const columns = width >= 768 ? 3 : 2;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        {ACTIONS.map((action) => (
          <View key={action.label} style={{ flexBasis: `${100 / columns}%` }}>
            <QuickActionTile {...action} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: WEB_TOKENS.spacing.sm,
  },
  sectionTitle: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    marginBottom: WEB_TOKENS.spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WEB_TOKENS.spacing.md,
  },
  tile: {
    alignItems: 'center',
    borderRadius: WEB_TOKENS.radii.md,
    gap: WEB_TOKENS.spacing.sm,
    padding: WEB_TOKENS.spacing.lg,
    paddingVertical: WEB_TOKENS.spacing.lg,
  },
  tilePressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  tileIcon: {
    fontSize: 28,
  },
  tileLabel: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    fontSize: 12,
    textAlign: 'center',
  },
});
