import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Platform } from 'react-native';
import { WebCommunity } from '@/src/web/screens/WebCommunity';
import { COLORS } from '@/src/constants/theme';
import {
  useCommunityStore, type ForumThread, type ThreadReply,
} from '@/src/stores/community';
import { useRecipeStore } from '@/src/stores/recipes';
import { useThemeColors, type ThemeColors } from '@/src/stores/theme';
import { RECIPES } from '@/src/lib/recipes';
import { useEffect, useState } from 'react';
import { trackScreen } from '@/src/lib/analytics';
import * as ImagePicker from 'expo-image-picker';
import {
  Heart, Plus, Users, ThumbsUp, X, ArrowUp, ArrowDown,
  ChatTeardrop, Camera, CookingPot, ArrowLeft,
} from 'phosphor-react-native';

const CHALLENGES = [
  { id: 'c1', name: '7-Day Tracking Streak', desc: 'Log your meals every day for a week', participants: 128, emoji: '🔥' },
  { id: 'c2', name: 'Workout 4x This Week', desc: 'Complete 4 workouts this week', participants: 94, emoji: '💪' },
  { id: 'c3', name: 'Protein Crusher', desc: 'Hit 120g+ protein every day for a week', participants: 67, emoji: '🥩' },
  { id: 'c4', name: 'Water Warrior', desc: 'Drink 2L+ water every day', participants: 156, emoji: '💧' },
  { id: 'c5', name: 'Mindful Minutes', desc: 'Meditate 5+ minutes daily', participants: 42, emoji: '🧘' },
];

export default function CommunityScreen() {
  if (Platform.OS === 'web') return <WebCommunity />;
  useEffect(() => { trackScreen('community'); }, []);
  const colors = useThemeColors();
  const [tab, setTab] = useState<'forum' | 'recipes' | 'challenges'>('forum');
  const [filterCategory, setFilterCategory] = useState<ForumThread['category'] | 'all'>('all');
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [showSubmitRecipe, setShowSubmitRecipe] = useState(false);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadBody, setNewThreadBody] = useState('');
  const [newThreadCategory, setNewThreadCategory] = useState<ForumThread['category']>('General');

  const { threads, addThread } = useCommunityStore();

  const handlePostThread = () => {
    if (!newThreadTitle.trim()) return;
    addThread({
      title: newThreadTitle.trim(),
      author: 'You',
      content: newThreadBody.trim(),
      category: newThreadCategory,
      replies: 0,
    });
    setNewThreadTitle('');
    setNewThreadBody('');
    setNewThreadCategory('General');
    setShowNewThread(false);
  };

  const filteredThreads = filterCategory === 'all'
    ? threads
    : threads.filter((t) => t.category === filterCategory);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bgSecondary }}>
      <View className="px-4 pt-6 pb-4 border-b" style={{ backgroundColor: colors.headerBg, borderColor: colors.border }}>
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>Community</Text>
        <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>Learn, share, and grow together</Text>
      </View>

      <View className="flex-row mx-4 mt-4 rounded-2xl p-1 border" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
        {(['forum', 'recipes', 'challenges'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl items-center ${tab === t ? 'bg-green-500' : ''}`}
          >
            <Text className={`text-sm font-semibold capitalize ${tab === t ? 'text-white' : ''}`}
              style={{ color: tab === t ? '#FFF' : colors.textSecondary }}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'forum' && (
        <ForumTab colors={colors} filteredThreads={filteredThreads} filterCategory={filterCategory}
          setFilterCategory={setFilterCategory} showNewThread={showNewThread}
          setShowNewThread={setShowNewThread} newThreadTitle={newThreadTitle}
          setNewThreadTitle={setNewThreadTitle} newThreadBody={newThreadBody}
          setNewThreadBody={setNewThreadBody} newThreadCategory={newThreadCategory}
          setNewThreadCategory={setNewThreadCategory} handlePostThread={handlePostThread}
          onThreadTap={setSelectedThread} onUserTap={setSelectedProfile} />
      )}

      {tab === 'recipes' && (
        <RecipesTab colors={colors} showSubmitRecipe={showSubmitRecipe}
          setShowSubmitRecipe={setShowSubmitRecipe} />
      )}

      {tab === 'challenges' && (
        <ChallengesTab colors={colors} />
      )}

      {selectedThread && (
        <ThreadDetailModal thread={selectedThread} colors={colors}
          onClose={() => setSelectedThread(null)} onUserTap={setSelectedProfile} />
      )}

      {selectedProfile && (
        <UserProfileModal username={selectedProfile} colors={colors}
          onClose={() => setSelectedProfile(null)} />
      )}
    </View>
  );
}

function ForumTab({ colors, filteredThreads, filterCategory, setFilterCategory,
  showNewThread, setShowNewThread, newThreadTitle, setNewThreadTitle, newThreadBody,
  setNewThreadBody, newThreadCategory, setNewThreadCategory, handlePostThread,
  onThreadTap, onUserTap,
}: {
  colors: ThemeColors;
  filteredThreads: ForumThread[];
  filterCategory: ForumThread['category'] | 'all';
  setFilterCategory: (c: ForumThread['category'] | 'all') => void;
  showNewThread: boolean;
  setShowNewThread: (v: boolean) => void;
  newThreadTitle: string;
  setNewThreadTitle: (v: string) => void;
  newThreadBody: string;
  setNewThreadBody: (v: string) => void;
  newThreadCategory: ForumThread['category'];
  setNewThreadCategory: (c: ForumThread['category']) => void;
  handlePostThread: () => void;
  onThreadTap: (t: ForumThread) => void;
  onUserTap: (u: string) => void;
}) {
  const { likeThread, removeThread } = useCommunityStore();

  return (
    <ScrollView className="flex-1 px-4 pt-4">
      <TouchableOpacity
        onPress={() => setShowNewThread(!showNewThread)}
        className="rounded-2xl p-4 mb-4 flex-row items-center justify-center border border-dashed"
        style={{ borderColor: colors.border }}
      >
        <Plus size={20} color={COLORS.primary} />
        <Text className="text-sm font-bold ml-2" style={{ color: COLORS.primary }}>New Discussion</Text>
      </TouchableOpacity>

      {showNewThread && (
        <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
          <TextInput
            className="text-sm font-semibold mb-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: colors.bgInput, color: colors.text, borderColor: colors.border, borderWidth: 1 }}
            value={newThreadTitle} onChangeText={setNewThreadTitle}
            placeholder="Thread title..." placeholderTextColor={colors.textMuted}
          />
          <TextInput
            className="text-sm mb-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: colors.bgInput, color: colors.text, borderColor: colors.border, borderWidth: 1 }}
            value={newThreadBody} onChangeText={setNewThreadBody}
            placeholder="Share your thoughts..." placeholderTextColor={colors.textMuted} multiline
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
            {(['General', 'Fasting', 'Progress', 'Nutrition', 'Workouts', 'Recipe'] as ForumThread['category'][]).map((cat) => (
              <TouchableOpacity key={cat} onPress={() => setNewThreadCategory(cat)}
                className="px-3 py-1.5 rounded-full mr-2"
                style={{ backgroundColor: newThreadCategory === cat ? COLORS.primary : colors.bgInput }}>
                <Text className="text-xs font-semibold" style={{ color: newThreadCategory === cat ? '#FFF' : colors.textSecondary }}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={handlePostThread} className="bg-green-500 py-2 rounded-xl items-center">
            <Text className="text-white text-sm font-bold">Post</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <TouchableOpacity onPress={() => setFilterCategory('all')}
          className="px-3 py-1.5 rounded-full mr-2"
          style={{ backgroundColor: filterCategory === 'all' ? COLORS.primary : colors.bgCard }}>
          <Text className="text-xs font-semibold" style={{ color: filterCategory === 'all' ? '#FFF' : colors.textSecondary }}>All</Text>
        </TouchableOpacity>
        {(['Fasting', 'Progress', 'Nutrition', 'Workouts'] as ForumThread['category'][]).map((cat) => (
          <TouchableOpacity key={cat} onPress={() => setFilterCategory(cat)}
            className="px-3 py-1.5 rounded-full mr-2"
            style={{ backgroundColor: filterCategory === cat ? COLORS.primary : colors.bgCard }}>
            <Text className="text-xs font-semibold" style={{ color: filterCategory === cat ? '#FFF' : colors.textSecondary }}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredThreads.map((thread) => (
        <TouchableOpacity
          key={thread.id}
          onPress={() => onThreadTap(thread)}
          className="rounded-2xl p-4 mb-3 border"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 mr-3">
              <View className="flex-row items-center gap-2 mb-1">
                <View className="px-2 py-0.5 rounded-full bg-green-50">
                  <Text className="text-[10px] text-green-600 font-semibold">{thread.category}</Text>
                </View>
                <Text className="text-xs" style={{ color: colors.textMuted }}>{getRelativeTime(thread.createdAt)}</Text>
              </View>
              <Text className="text-sm font-bold" style={{ color: colors.text }}>{thread.title}</Text>
              {thread.content ? (
                <Text className="text-xs mt-1" style={{ color: colors.textSecondary }} numberOfLines={2}>{thread.content}</Text>
              ) : null}
            </View>
          </View>
          <View className="flex-row items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: colors.border }}>
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); onUserTap(thread.author); }}>
              <Text className="text-xs" style={{ color: colors.textSecondary, fontWeight: '600' }}>{thread.author}</Text>
            </TouchableOpacity>
            <View className="flex-row items-center gap-1">
              <ChatTeardrop size={14} color={colors.textMuted} weight="fill" />
              <Text className="text-xs" style={{ color: colors.textMuted }}>{thread.replies}</Text>
            </View>
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); likeThread(thread.id); }} className="flex-row items-center gap-1">
              <ThumbsUp size={14} color={thread.liked ? COLORS.primary : colors.textMuted} weight={thread.liked ? 'fill' : 'regular'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={(e) => {
              e.stopPropagation();
              Alert.alert('Delete', 'Delete this thread?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => removeThread(thread.id) },
              ]);
            }}>
              <X size={12} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
      <View className="h-8" />
    </ScrollView>
  );
}

function ThreadDetailModal({ thread, colors, onClose, onUserTap }: {
  thread: ForumThread;
  colors: ThemeColors;
  onClose: () => void;
  onUserTap: (u: string) => void;
}) {
  const { threadReplies, addReply, voteReply } = useCommunityStore();
  const [replyText, setReplyText] = useState('');
  const [replyTo, setReplyTo] = useState<string | undefined>(undefined);
  const replies = threadReplies[thread.id] || [];

  const topReplies = replies.filter((r) => !r.parentId);
  const childReplies = (parentId: string) => replies.filter((r) => r.parentId === parentId);

  const handleReply = () => {
    if (!replyText.trim()) return;
    addReply(thread.id, replyText.trim(), replyTo);
    setReplyText('');
    setReplyTo(undefined);
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1" style={{ backgroundColor: colors.bgSecondary }}>
        <View className="flex-row items-center justify-between px-4 pt-6 pb-4 border-b" style={{ backgroundColor: colors.headerBg, borderColor: colors.border }}>
          <TouchableOpacity onPress={onClose}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-base font-bold flex-1 text-center" style={{ color: colors.text }}>Discussion</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView className="flex-1 px-4 pt-4">
          <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <View className="flex-row items-center gap-2 mb-2">
              <View className="px-2 py-0.5 rounded-full bg-green-50">
                <Text className="text-[10px] text-green-600 font-semibold">{thread.category}</Text>
              </View>
              <Text className="text-xs" style={{ color: colors.textMuted }}>{getRelativeTime(thread.createdAt)}</Text>
            </View>
            <Text className="text-lg font-bold" style={{ color: colors.text }}>{thread.title}</Text>
            <Text className="text-sm mt-2 leading-relaxed" style={{ color: colors.textSecondary }}>{thread.content}</Text>
            <TouchableOpacity onPress={() => onUserTap(thread.author)} className="mt-3">
              <Text className="text-sm font-semibold" style={{ color: COLORS.primary }}>{thread.author}</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-sm font-bold mb-3 ml-1" style={{ color: colors.textSecondary }}>
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </Text>

          {topReplies.map((reply) => (
            <ReplyCard key={reply.id} reply={reply} childReplies={childReplies(reply.id)}
              colors={colors} voteReply={voteReply} threadId={thread.id}
              onReplyTap={(id) => { setReplyTo(id); setReplyText(''); }}
              onUserTap={onUserTap} depth={0} />
          ))}

          {replies.length === 0 && (
            <View className="items-center py-8">
              <ChatTeardrop size={32} color={colors.textMuted} />
              <Text className="text-sm mt-3" style={{ color: colors.textMuted }}>No replies yet. Be the first!</Text>
            </View>
          )}
        </ScrollView>

        <View className="px-4 py-3 border-t flex-row items-center gap-2" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
          {replyTo && (
            <View className="flex-row items-center bg-green-50 px-2 py-0.5 rounded-full">
              <Text className="text-xs text-green-600">Replying</Text>
              <TouchableOpacity onPress={() => setReplyTo(undefined)} className="ml-1">
                <X size={12} color="#22C55E" weight="bold" />
              </TouchableOpacity>
            </View>
          )}
          <TextInput
            className="flex-1 px-3 py-2 rounded-xl text-sm"
            style={{ backgroundColor: colors.bgInput, color: colors.text }}
            value={replyText}
            onChangeText={setReplyText}
            placeholder={replyTo ? 'Write a reply...' : 'Add a reply...'}
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity onPress={handleReply} className="bg-green-500 px-4 py-2 rounded-xl">
            <Text className="text-white text-sm font-bold">Post</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function ReplyCard({ reply, childReplies, colors, voteReply, threadId, onReplyTap, onUserTap, depth }: {
  reply: ThreadReply;
  childReplies: ThreadReply[];
  colors: ThemeColors;
  voteReply: (threadId: string, replyId: string, vote: 1 | -1) => void;
  threadId: string;
  onReplyTap: (id: string) => void;
  onUserTap: (u: string) => void;
  depth: number;
}) {
  const indent = Math.min(depth, 3) * 16;

  return (
    <View style={{ marginLeft: indent }}>
      <View className="rounded-xl p-3 mb-2" style={{ backgroundColor: colors.bgInput }}>
        <View className="flex-row items-center justify-between mb-1">
          <TouchableOpacity onPress={() => onUserTap(reply.author)}>
            <Text className="text-xs font-semibold" style={{ color: COLORS.primary }}>{reply.author}</Text>
          </TouchableOpacity>
          <Text className="text-xs" style={{ color: colors.textMuted }}>{getRelativeTime(reply.createdAt)}</Text>
        </View>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>{reply.body}</Text>
        <View className="flex-row items-center gap-3 mt-2">
          <TouchableOpacity onPress={() => voteReply(threadId, reply.id, 1)} className="flex-row items-center gap-0.5">
            <ArrowUp size={12} color={reply.userVote === 1 ? COLORS.primary : colors.textMuted} weight="fill" />
          </TouchableOpacity>
          <Text className="text-xs font-semibold" style={{ color: reply.userVote !== 0 ? COLORS.primary : colors.textMuted }}>
            {reply.upvotes}
          </Text>
          <TouchableOpacity onPress={() => voteReply(threadId, reply.id, -1)} className="flex-row items-center gap-0.5">
            <ArrowDown size={12} color={reply.userVote === -1 ? '#EF4444' : colors.textMuted} weight="fill" />
          </TouchableOpacity>
          {depth < 3 && (
            <TouchableOpacity onPress={() => onReplyTap(reply.id)}>
              <Text className="text-xs font-semibold" style={{ color: COLORS.primary }}>Reply</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {childReplies.map((child) => (
        <ReplyCard key={child.id} reply={child} childReplies={[]} colors={colors}
          voteReply={voteReply} threadId={threadId} onReplyTap={onReplyTap}
          onUserTap={onUserTap} depth={depth + 1} />
      ))}
    </View>
  );
}

function UserProfileModal({ username, colors, onClose }: {
  username: string;
  colors: ThemeColors;
  onClose: () => void;
}) {
  const { userProfiles } = useCommunityStore();
  const profile = userProfiles[username];

  if (!profile) return null;

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" transparent>
      <View className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View className="flex-1 justify-end">
          <View className="rounded-t-3xl p-6" style={{ backgroundColor: colors.bgCard }}>
            <TouchableOpacity onPress={onClose} className="absolute right-4 top-4 z-10">
              <X size={22} color={colors.text} weight="bold" />
            </TouchableOpacity>

            <View className="items-center mb-4">
              <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-3">
                <Text className="text-3xl">👤</Text>
              </View>
              <Text className="text-xl font-bold" style={{ color: colors.text }}>{profile.username}</Text>
              <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>{profile.bio}</Text>
            </View>

            <View className="flex-row justify-around mb-4">
              <View className="items-center">
                <Text className="text-lg font-bold" style={{ color: COLORS.primary }}>{profile.streak}</Text>
                <Text className="text-xs" style={{ color: colors.textMuted }}>Day Streak</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold" style={{ color: COLORS.primary }}>{profile.workoutsPerMonth}</Text>
                <Text className="text-xs" style={{ color: colors.textMuted }}>Workouts/mo</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold" style={{ color: COLORS.primary }}>{profile.goalProgress}%</Text>
                <Text className="text-xs" style={{ color: colors.textMuted }}>Goal Progress</Text>
              </View>
            </View>

            <View className="rounded-xl p-4 mb-4" style={{ backgroundColor: colors.bgInput }}>
              <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>About</Text>
              <View className="flex-row justify-between py-1">
                <Text className="text-sm" style={{ color: colors.textMuted }}>Goal</Text>
                <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>{profile.goal.replace('_', ' ')}</Text>
              </View>
              <View className="flex-row justify-between py-1">
                <Text className="text-sm" style={{ color: colors.textMuted }}>Member since</Text>
                <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>{profile.memberSince}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function RecipesTab({ colors, showSubmitRecipe, setShowSubmitRecipe }: {
  colors: ThemeColors;
  showSubmitRecipe: boolean;
  setShowSubmitRecipe: (v: boolean) => void;
}) {
  const { savedRecipes } = useRecipeStore();
  const { submittedRecipes, likeSubmittedRecipe, removeSubmittedRecipe } = useCommunityStore();

  return (
    <ScrollView className="flex-1 px-4 pt-4">
      <TouchableOpacity
        onPress={() => setShowSubmitRecipe(true)}
        className="rounded-2xl p-4 mb-4 flex-row items-center justify-center border border-dashed"
        style={{ borderColor: colors.border }}
      >
        <Plus size={20} color={COLORS.primary} />
        <Text className="text-sm font-bold ml-2" style={{ color: COLORS.primary }}>Share a Recipe</Text>
      </TouchableOpacity>

      {showSubmitRecipe && (
        <SubmitRecipeForm colors={colors} onClose={() => setShowSubmitRecipe(false)} />
      )}

      {submittedRecipes.length > 0 && (
        <View className="mb-4">
          <Text className="text-sm font-bold mb-3 ml-1" style={{ color: colors.textSecondary }}>Community Recipes</Text>
          {submittedRecipes.map((recipe) => (
            <View key={recipe.id} className="rounded-2xl p-4 mb-3 border" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
              <View className="flex-row justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-sm font-bold" style={{ color: colors.text }}>{recipe.name}</Text>
                  <Text className="text-xs mt-1" style={{ color: colors.textSecondary }} numberOfLines={2}>{recipe.description}</Text>
                  <View className="flex-row items-center gap-3 mt-2">
                    <Text className="text-xs text-green-600 font-semibold">{recipe.caloriesPerServing} cal</Text>
                    <Text className="text-xs" style={{ color: colors.textMuted }}>{recipe.proteinG}g protein</Text>
                  </View>
                  <View className="flex-row items-center gap-3 mt-1">
                    <Text className="text-xs font-semibold" style={{ color: COLORS.primary }}>{recipe.author}</Text>
                    <Text className="text-xs" style={{ color: colors.textMuted }}>{getRelativeTime(recipe.createdAt)}</Text>
                  </View>
                </View>
                <View className="items-center gap-2">
                  <TouchableOpacity onPress={() => likeSubmittedRecipe(recipe.id)}>
                    <Heart size={18} color={recipe.userLiked ? '#EF4444' : colors.textMuted} weight={recipe.userLiked ? 'fill' : 'regular'} />
                  </TouchableOpacity>
                  <Text className="text-xs" style={{ color: colors.textMuted }}>{recipe.likes}</Text>
                  {recipe.author === 'You' && (
                    <TouchableOpacity onPress={() => {
                      Alert.alert('Delete', 'Remove this recipe?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => removeSubmittedRecipe(recipe.id) },
                      ]);
                    }}>
                      <X size={14} color={colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <Text className="text-sm font-bold mb-3 ml-1" style={{ color: colors.textSecondary }}>Curated Recipes</Text>
      {RECIPES.slice(0, 10).map((recipe) => {
        const saved = savedRecipes.includes(recipe.id);
        return (
          <View key={recipe.id} className="rounded-2xl p-4 mb-3 border" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
            <View className="flex-row items-start justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-sm font-bold" style={{ color: colors.text }}>{recipe.name}</Text>
                <Text className="text-xs mt-1" style={{ color: colors.textSecondary }} numberOfLines={2}>{recipe.description}</Text>
                <View className="flex-row gap-3 mt-2">
                  <Text className="text-xs text-green-600 font-semibold">{recipe.caloriesPerServing} cal</Text>
                  <Text className="text-xs" style={{ color: colors.textMuted }}>{recipe.proteinG}g protein</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => useRecipeStore.getState().toggleSaved(recipe.id)}>
                <Heart size={20} color={saved ? '#EF4444' : colors.textMuted} weight={saved ? 'fill' : 'regular'} />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
      <View className="h-8" />
    </ScrollView>
  );
}

function SubmitRecipeForm({ colors, onClose }: { colors: ThemeColors; onClose: () => void }) {
  const { submitRecipe } = useCommunityStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [tagText, setTagText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [photoUri, setPhotoUri] = useState<string | undefined>();

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  };

  const addTag = () => {
    if (tagText.trim() && !tags.includes(tagText.trim())) {
      setTags([...tags, tagText.trim()]);
      setTagText('');
    }
  };

  const handleSubmit = () => {
    if (!name.trim() || !calories || !ingredients.trim()) {
      Alert.alert('Required', 'Name, calories, and ingredients are required.');
      return;
    }
    submitRecipe({
      name: name.trim(),
      description: description.trim(),
      photoUri,
      ingredients: ingredients.split('\n').filter((i) => i.trim()),
      instructions: instructions.split('\n').filter((i) => i.trim()),
      prepTime: parseInt(prepTime) || 0,
      cookTime: parseInt(cookTime) || 0,
      servings: parseInt(servings) || 1,
      caloriesPerServing: parseInt(calories) || 0,
      proteinG: parseInt(protein) || 0,
      carbsG: parseInt(carbs) || 0,
      fatG: parseInt(fat) || 0,
      tags,
    });
    onClose();
  };

  return (
    <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-base font-bold" style={{ color: colors.text }}>Share Recipe</Text>
        <TouchableOpacity onPress={onClose}><X size={20} color={colors.textSecondary} /></TouchableOpacity>
      </View>

      <TextInput className="text-sm mb-2 px-3 py-2 rounded-lg" style={{ backgroundColor: colors.bgInput, color: colors.text }}
        value={name} onChangeText={setName} placeholder="Recipe name *" placeholderTextColor={colors.textMuted} />
      <TextInput className="text-sm mb-2 px-3 py-2 rounded-lg" style={{ backgroundColor: colors.bgInput, color: colors.text }}
        value={description} onChangeText={setDescription} placeholder="Brief description" placeholderTextColor={colors.textMuted} />

      <TouchableOpacity onPress={pickPhoto} className="flex-row items-center gap-2 py-2 mb-2 px-3 rounded-lg"
        style={{ backgroundColor: colors.bgInput }}>
        <Camera size={18} color={colors.textSecondary} />
        <Text className="text-sm" style={{ color: photoUri ? colors.textSecondary : colors.textMuted }}>
          {photoUri ? 'Photo added ✓' : 'Add photo (optional)'}
        </Text>
      </TouchableOpacity>

      <View className="flex-row gap-2 mb-2">
        <View className="flex-1">
          <Text className="text-xs mb-1" style={{ color: colors.textMuted }}>Prep (min)</Text>
          <TextInput className="text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: colors.bgInput, color: colors.text }}
            value={prepTime} onChangeText={setPrepTime} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textMuted} />
        </View>
        <View className="flex-1">
          <Text className="text-xs mb-1" style={{ color: colors.textMuted }}>Cook (min)</Text>
          <TextInput className="text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: colors.bgInput, color: colors.text }}
            value={cookTime} onChangeText={setCookTime} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textMuted} />
        </View>
        <View className="flex-1">
          <Text className="text-xs mb-1" style={{ color: colors.textMuted }}>Servings</Text>
          <TextInput className="text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: colors.bgInput, color: colors.text }}
            value={servings} onChangeText={setServings} keyboardType="numeric" placeholder="1" placeholderTextColor={colors.textMuted} />
        </View>
      </View>

      <View className="flex-row gap-2 mb-2">
        <View className="flex-1">
          <Text className="text-xs mb-1" style={{ color: colors.textMuted }}>Cal/serving *</Text>
          <TextInput className="text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: colors.bgInput, color: colors.text }}
            value={calories} onChangeText={setCalories} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textMuted} />
        </View>
        <View className="flex-1">
          <Text className="text-xs mb-1" style={{ color: colors.textMuted }}>Protein (g)</Text>
          <TextInput className="text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: colors.bgInput, color: colors.text }}
            value={protein} onChangeText={setProtein} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textMuted} />
        </View>
        <View className="flex-1">
          <Text className="text-xs mb-1" style={{ color: colors.textMuted }}>Carbs (g)</Text>
          <TextInput className="text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: colors.bgInput, color: colors.text }}
            value={carbs} onChangeText={setCarbs} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textMuted} />
        </View>
        <View className="flex-1">
          <Text className="text-xs mb-1" style={{ color: colors.textMuted }}>Fat (g)</Text>
          <TextInput className="text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: colors.bgInput, color: colors.text }}
            value={fat} onChangeText={setFat} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textMuted} />
        </View>
      </View>

      <Text className="text-xs mb-1" style={{ color: colors.textMuted }}>Ingredients * (one per line)</Text>
      <TextInput className="text-sm mb-2 px-3 py-2 rounded-lg" style={{ backgroundColor: colors.bgInput, color: colors.text }}
        value={ingredients} onChangeText={setIngredients} placeholder="2 eggs&#10;1 cup flour&#10;..." placeholderTextColor={colors.textMuted} multiline numberOfLines={4} />

      <Text className="text-xs mb-1" style={{ color: colors.textMuted }}>Instructions (one per line)</Text>
      <TextInput className="text-sm mb-2 px-3 py-2 rounded-lg" style={{ backgroundColor: colors.bgInput, color: colors.text }}
        value={instructions} onChangeText={setInstructions} placeholder="Step 1..." placeholderTextColor={colors.textMuted} multiline numberOfLines={4} />

      <View className="flex-row items-center gap-2 mb-2">
        <TextInput className="flex-1 text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: colors.bgInput, color: colors.text }}
          value={tagText} onChangeText={setTagText} placeholder="Add tag (e.g. keto)" placeholderTextColor={colors.textMuted}
          onSubmitEditing={addTag} />
        <TouchableOpacity onPress={addTag} className="px-3 py-2 rounded-lg" style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-white text-xs font-semibold">Add</Text>
        </TouchableOpacity>
      </View>
      {tags.length > 0 && (
        <View className="flex-row flex-wrap gap-1 mb-2">
          {tags.map((t, i) => (
            <View key={i} className="flex-row items-center px-2 py-0.5 rounded-full bg-green-50">
              <Text className="text-xs text-green-600">{t}</Text>
              <TouchableOpacity onPress={() => setTags(tags.filter((_, j) => j !== i))} className="ml-1">
                <X size={10} color="#22C55E" weight="bold" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity onPress={handleSubmit} className="bg-green-500 py-3 rounded-xl items-center flex-row justify-center">
        <CookingPot size={18} color="#FFF" />
        <Text className="text-white text-sm font-bold ml-2">Share Recipe</Text>
      </TouchableOpacity>
    </View>
  );
}

function ChallengesTab({ colors }: { colors: ThemeColors }) {
  const [showLeaderboard, setShowLeaderboard] = useState<string | null>(null);
  const { joinedChallenges, joinChallenge, leaveChallenge, updateChallengeProgress } = useCommunityStore();

  return (
    <ScrollView className="flex-1 px-4 pt-4">
      {showLeaderboard && (
        <ChallengeLeaderboard challengeId={showLeaderboard} colors={colors} onClose={() => setShowLeaderboard(null)} />
      )}

      {!showLeaderboard && CHALLENGES.map((challenge) => {
        const joined = joinedChallenges.find((c) => c.challengeId === challenge.id);
        return (
          <View key={challenge.id} className="rounded-2xl p-4 mb-3 border" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">{challenge.emoji}</Text>
                <View>
                  <Text className="text-sm font-bold" style={{ color: colors.text }}>{challenge.name}</Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{challenge.desc}</Text>
                  <View className="flex-row items-center mt-1 gap-2">
                    <View className="flex-row items-center">
                      <Users size={12} color={colors.textMuted} />
                      <Text className="text-xs ml-1" style={{ color: colors.textMuted }}>{challenge.participants}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowLeaderboard(challenge.id)}>
                      <Text className="text-xs font-semibold" style={{ color: COLORS.primary }}>Leaderboard</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            {joined ? (
              <View>
                <View className="h-2 rounded-full overflow-hidden mb-2" style={{ backgroundColor: colors.bgInput }}>
                  <View className="h-full bg-green-500 rounded-full" style={{ width: `${joined.progress}%` }} />
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-green-600 font-semibold">{joined.progress}% complete</Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => updateChallengeProgress(challenge.id, joined.progress + 25)}
                      className="bg-green-100 px-3 py-1 rounded-full">
                      <Text className="text-xs text-green-600 font-semibold">+25%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => leaveChallenge(challenge.id)} className="bg-red-50 px-3 py-1 rounded-full">
                      <Text className="text-xs text-red-500 font-semibold">Leave</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <TouchableOpacity onPress={() => joinChallenge(challenge.id)} className="bg-green-500 py-2 rounded-xl items-center">
                <Text className="text-white text-sm font-bold">Join Challenge</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
      <View className="h-8" />
    </ScrollView>
  );
}

function ChallengeLeaderboard({ challengeId, colors, onClose }: {
  challengeId: string;
  colors: ThemeColors;
  onClose: () => void;
}) {
  const challenge = CHALLENGES.find((c) => c.id === challengeId);
  const entries = [
    { name: 'MaxFit', progress: 88 },
    { name: 'ChefHealth', progress: 75 },
    { name: 'AnnaK', progress: 62 },
    { name: 'PlantPower', progress: 50 },
    { name: 'You', progress: 25 },
    { name: 'NewbieLifter', progress: 12 },
  ].sort((a, b) => b.progress - a.progress);

  return (
    <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-base font-bold" style={{ color: colors.text }}>Leaderboard</Text>
          <Text className="text-xs" style={{ color: colors.textSecondary }}>{challenge?.name}</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <X size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {entries.map((entry, index) => (
        <View key={entry.name} className={`flex-row items-center py-2 ${entry.name === 'You' ? '' : ''}`}
          style={{
            backgroundColor: entry.name === 'You' ? (colors.bgInput) : 'transparent',
            borderRadius: 12,
            paddingHorizontal: 8,
          }}>
          <View className="w-8 items-center">
            <Text className="text-sm font-bold" style={{
              color: index === 0 ? '#F59E0B' : index === 1 ? '#9CA3AF' : index === 2 ? '#D97706' : colors.textMuted,
            }}>
              {index + 1}
            </Text>
          </View>
          <Text className="flex-1 text-sm font-semibold" style={{ color: entry.name === 'You' ? COLORS.primary : colors.textSecondary }}>
            {entry.name}
          </Text>
          <View className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgInput }}>
            <View className="h-full bg-green-500 rounded-full" style={{ width: `${entry.progress}%` }} />
          </View>
          <Text className="text-xs font-semibold ml-2 w-10 text-right" style={{ color: colors.textSecondary }}>
            {entry.progress}%
          </Text>
        </View>
      ))}

      <View className="flex-row items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: colors.border }}>
        <Text className="text-xs" style={{ color: colors.textMuted }}>Community Average</Text>
        <Text className="text-xs font-bold" style={{ color: COLORS.primary }}>52%</Text>
      </View>
    </View>
  );
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
