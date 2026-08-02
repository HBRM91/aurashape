import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { COLORS, FASTING_COLORS } from '@/src/constants/theme';
import { useAuthStore } from '@/src/stores/auth';
import { useOnboardingStore } from '@/src/stores/onboarding';
import { useDiaryStore } from '@/src/stores/diary';
import { useThemeColors } from '@/src/stores/theme';
import { WaterTracker, HabitTrackers } from '@/src/components/Trackers';
import { MacroDonut } from '@/src/components/MacroDonut';
import { CalendarPlus, Barcode, ForkKnife, Timer, Lightbulb, CookingPot, Trophy, Flask, Barbell } from 'phosphor-react-native';
import { DAILY_TIPS } from '@/src/lib/tips';
import { useAchievementsStore } from '@/src/stores/achievements';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

import { useCommentStore } from '@/src/stores/comments';
import { useEffect, useState } from 'react';
import { trackScreen } from '@/src/lib/analytics';
import { Heart, ChatTeardrop, Star } from 'phosphor-react-native';

export default function HomeScreen() {
  useEffect(() => { trackScreen('home'); }, []);
  const user = useAuthStore((s) => s.user);
  const onboarding = useOnboardingStore();
  const { getDailyCalories, getDailyMacros } = useDiaryStore();
  const colors = useThemeColors();

  const today = todayStr();
  const consumed = getDailyCalories(today);
  const macros = getDailyMacros(today);
  const calorieTarget = onboarding.calorieTarget || 2000;
  const proteinTarget = onboarding.proteinTargetG || 100;
  const carbsTarget = onboarding.carbsTargetG || 200;
  const fatTarget = onboarding.fatTargetG || 55;

  const tipIndex = new Date().getDate() % DAILY_TIPS.length;
  const dailyTip = DAILY_TIPS[tipIndex];
  const tipComments = useCommentStore((s) => s.tipComments[tipIndex] || []);
  const { addComment, likeComment } = useCommentStore();
  const [tipComment, setTipComment] = useState('');
  const [showTipComments, setShowTipComments] = useState(false);
  const [showTipScience, setShowTipScience] = useState(false);

  const firstName = user?.email?.split('@')[0] || 'there';
  const achievements = useAchievementsStore();
  const unlockedCount = achievements.totalUnlocked();
  const recentAchievements = achievements.achievements
    .filter((a) => a.unlocked && a.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 3);

  const diaryDates = useDiaryStore((s) => [...new Set(s.entries.map((e) => e.date))]);
  const healthStreak = (() => {
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      if (diaryDates.includes(dateStr)) {
        streak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }
    return streak;
  })();

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bgSecondary }}>
      <View className="px-4 pt-4 pb-3">
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          Hey, {firstName}
        </Text>
        <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      {healthStreak > 0 && (
        <View className="mx-4 mb-4 rounded-2xl p-4 flex-row items-center" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
          <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3">
            <Star size={20} color="#F59E0B" weight="fill" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold" style={{ color: colors.text }}>
              {healthStreak}-Day Health Streak
            </Text>
            <Text className="text-xs" style={{ color: colors.textMuted }}>
              {healthStreak >= 7 ? 'You\'re on fire! Keep it going. 🚀' :
               healthStreak >= 3 ? 'Building momentum. Stay consistent! 💪' :
               'Every day counts. You\'ve got this! 🌱'}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold" style={{ color: '#F59E0B' }}>{healthStreak}</Text>
            <Text className="text-xs" style={{ color: colors.textMuted }}>days</Text>
          </View>
        </View>
      )}

      {consumed > 0 ? (
        <View className="mx-4 rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
          <MacroDonut
            protein={macros.protein}
            carbs={macros.carbs}
            fat={macros.fat}
            proteinTarget={proteinTarget}
            carbsTarget={carbsTarget}
            fatTarget={fatTarget}
            totalCalories={consumed}
            calorieTarget={calorieTarget}
          />
          <TouchableOpacity
            onPress={() => router.navigate('/(tabs)/diary')}
            className="mt-3 py-2 rounded-xl items-center"
            style={{ backgroundColor: COLORS.primary + '15' }}
          >
            <Text className="text-sm font-semibold" style={{ color: COLORS.primary }}>
              Open Food Diary
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/summary' as any)}
            className="mt-2 py-2 rounded-xl items-center"
            style={{ backgroundColor: '#3B82F6' + '15' }}
          >
            <Text className="text-sm font-semibold text-blue-600">
              View Daily Summary
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => router.navigate('/(tabs)/diary')}
          className="mx-4 rounded-2xl p-6 items-center mb-4"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}
        >
          <ForkKnife size={32} color={colors.textMuted} />
          <Text className="text-base font-bold mt-3" style={{ color: colors.textSecondary }}>No meals logged today</Text>
          <Text className="text-sm mt-1" style={{ color: colors.textMuted }}>Tap to start your food diary</Text>
          <View
            className="mt-3 px-6 py-2.5 rounded-xl"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="text-white text-sm font-bold">Log Your First Meal</Text>
          </View>
        </TouchableOpacity>
      )}

      <View className="mx-4 mb-4">
        <Text className="text-sm font-bold mb-2 ml-1" style={{ color: colors.textSecondary }}>Trackers</Text>
        <WaterTracker compact />
        <View className="h-3" />
        <HabitTrackers compact />
      </View>

      {unlockedCount > 0 && recentAchievements.length > 0 && (
        <View className="mx-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-bold ml-1" style={{ color: colors.textSecondary }}>
              Achievements
            </Text>
            <View className="bg-amber-50 px-2 py-0.5 rounded-full">
              <Text className="text-xs font-semibold text-amber-600">{unlockedCount}/18</Text>
            </View>
          </View>
          <View
            className="rounded-2xl p-4 flex-row items-center gap-3"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}
          >
            {recentAchievements.map((a) => (
              <View key={a.id} className="items-center flex-1">
                <Text className="text-2xl">{a.icon}</Text>
                <Text className="text-[10px] font-semibold text-center mt-1" style={{ color: colors.text }} numberOfLines={2}>
                  {a.name}
                </Text>
              </View>
            ))}
            {recentAchievements.length < 3 && (
              <View className="flex-1 items-center justify-center opacity-40">
                <Trophy size={20} color={colors.textMuted} />
                <Text className="text-[10px] mt-1" style={{ color: colors.textMuted }}>
                  More to unlock
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View className="mx-4 mb-4">
        <Text className="text-sm font-bold mb-2 ml-1" style={{ color: colors.textSecondary }}>Quick Actions</Text>
        <View className="flex-row flex-wrap gap-3">
          <QuickTile
            icon={<CalendarPlus size={20} color={COLORS.primary} />}
            label="Log Meal"
            bg="#ECFDF5"
            onPress={() => router.navigate('/(tabs)/diary')}
          />
          <QuickTile
            icon={<Barcode size={20} color={COLORS.secondary} />}
            label="Scan"
            bg="#EFF6FF"
            onPress={() => router.push('/barcode')}
          />
          <QuickTile
            icon={<CookingPot size={20} color="#F97316" />}
            label="Recipes"
            bg="#FFF7ED"
            onPress={() => router.push('/recipes' as any)}
          />
          <QuickTile
            icon={<Timer size={20} color={FASTING_COLORS.fasting} />}
            label="Fast"
            bg="#F5F3FF"
            onPress={() => router.navigate('/(tabs)/fasting')}
          />
          <QuickTile
            icon={<Barbell size={20} color="#F97316" />}
            label="Workout"
            bg="#FFF7ED"
            onPress={() => router.navigate('/(tabs)/workout')}
          />
          <QuickTile
            icon={<Lightbulb size={20} color="#F59E0B" />}
            label="Learn"
            bg="#FFFBEB"
            onPress={() => router.push('/articles')}
          />
        </View>
      </View>

      <View className="mx-4 mb-8 rounded-2xl p-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
        <View className="flex-row items-center gap-2 mb-2">
          <Lightbulb size={20} color="#F59E0B" weight="fill" />
          <Text className="text-sm font-bold" style={{ color: colors.text }}>Today's Science</Text>
          <View className="ml-auto px-2 py-0.5 rounded-full bg-amber-50">
            <Text className="text-xs font-medium text-amber-600">
              #{dailyTip.category.replace('_', ' ')}
            </Text>
          </View>
        </View>
        <Text className="text-sm font-semibold mb-1" style={{ color: colors.text }}>{dailyTip.title}</Text>
        <Text className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>{dailyTip.body}</Text>
        <Text className="text-xs mt-2 italic" style={{ color: colors.textMuted }}>Source: {dailyTip.source}</Text>

        {dailyTip.study && (
          <View className="mt-3">
            <TouchableOpacity
              onPress={() => setShowTipScience(!showTipScience)}
              className="flex-row items-center gap-2 py-2 px-3 rounded-lg"
              style={{ backgroundColor: colors.bgSecondary }}
            >
              <Flask size={14} color="#F59E0B" weight="fill" />
              <Text className="text-xs font-semibold" style={{ color: '#B45309' }}>
                {showTipScience ? 'Hide' : 'Show'} The Science
              </Text>
            </TouchableOpacity>
            {showTipScience && (
              <View className="mt-2 rounded-lg p-3 bg-amber-50">
                <Text className="text-xs font-bold" style={{ color: '#92400E' }}>{dailyTip.study.title}</Text>
                <Text className="text-xs mt-1" style={{ color: '#A16207' }}>{dailyTip.study.authors} — {dailyTip.study.journal}, {dailyTip.study.year}</Text>
                <Text className="text-xs mt-2 leading-relaxed" style={{ color: '#78350F' }}>{dailyTip.study.summary}</Text>
              </View>
            )}
          </View>
        )}

        <View className="flex-row items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: colors.border }}>
          <TouchableOpacity
            onPress={() => setShowTipComments(!showTipComments)}
            className="flex-row items-center gap-1.5"
          >
            <ChatTeardrop size={16} color={colors.textMuted} weight="fill" />
            <Text className="text-xs" style={{ color: colors.textMuted }}>{tipComments.length} comments</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center gap-1.5">
            <Heart size={16} color={colors.textMuted} />
            <Text className="text-xs" style={{ color: colors.textMuted }}>React</Text>
          </TouchableOpacity>
        </View>

        {showTipComments && (
          <View className="mt-3">
            {tipComments.map((c) => (
              <View key={c.id} className="rounded-lg px-3 py-2 mb-1.5" style={{ backgroundColor: colors.bgSecondary }}>
                <View className="flex-row justify-between">
                  <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>{c.author}</Text>
                  <TouchableOpacity onPress={() => likeComment(String(tipIndex), 'tip', c.id)}>
                    <Heart size={12} color="#F43F5E" weight={c.likes > 0 ? 'fill' : 'regular'} />
                  </TouchableOpacity>
                </View>
                <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{c.body}</Text>
              </View>
            ))}
            <View className="flex-row gap-2 mt-2">
              <TextInput
                className="flex-1 rounded-lg px-3 py-2 text-xs"
                style={{ backgroundColor: colors.bgSecondary, color: colors.text }}
                value={tipComment}
                onChangeText={setTipComment}
                placeholder="Add a comment..."
                placeholderTextColor={colors.textMuted}
              />
              <TouchableOpacity
                onPress={() => {
                  if (tipComment.trim()) {
                    addComment(String(tipIndex), 'tip', {
                      author: firstName,
                      body: tipComment.trim(),
                      likes: 0,
                      userLiked: false,
                    });
                    setTipComment('');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-green-100"
              >
                <Text className="text-xs font-semibold text-green-700">Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View className="mx-4 mb-8">
        <TouchableOpacity
          onPress={() => router.push('/articles')}
          className="rounded-2xl p-4 flex-row items-center justify-between"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}
        >
          <View className="flex-row items-center gap-2">
            <Text className="text-lg">📚</Text>
            <Text className="text-sm font-bold" style={{ color: colors.text }}>Science Articles</Text>
          </View>
          <Text className="text-xs" style={{ color: colors.textMuted }}>4 articles →</Text>
        </TouchableOpacity>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}

function QuickTile({
  icon,
  label,
  bg,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 rounded-xl p-4 items-center"
      style={{ backgroundColor: bg }}
    >
      {icon}
      <Text className="text-xs font-semibold text-gray-600 mt-2">{label}</Text>
    </TouchableOpacity>
  );
}
