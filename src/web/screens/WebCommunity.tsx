import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useCommunityStore, type ForumThread } from '@/src/stores/community';
import { WebCard } from '../WebCard';
import { WebButton } from '../WebButton';
import { WEB_TOKENS } from '../tokens';

const CHALLENGES = [
  { id: 'c1', name: '7-Day Tracking Streak', desc: 'Log your meals every day for a week', participants: 128, emoji: '🔥' },
  { id: 'c2', name: 'Workout 4x This Week', desc: 'Complete 4 workouts this week', participants: 94, emoji: '💪' },
  { id: 'c3', name: 'Protein Crusher', desc: 'Hit 120g+ protein every day for a week', participants: 67, emoji: '🥩' },
  { id: 'c4', name: 'Water Warrior', desc: 'Drink 2L+ water every day', participants: 156, emoji: '💧' },
  { id: 'c5', name: 'Mindful Minutes', desc: 'Meditate 5+ minutes daily', participants: 42, emoji: '🧘' },
];

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function WebCommunity() {
  useEffect(() => {
    try { require('@/src/lib/analytics').trackScreen('community'); } catch {}
  }, []);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    threads,
    threadReplies,
    addThread,
    likeThread,
    removeThread,
    addReply,
    voteReply,
  } = useCommunityStore();

  const [filterCategory, setFilterCategory] = useState<ForumThread['category'] | 'all'>('all');
  const [showNewThread, setShowNewThread] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCat, setNewCat] = useState<ForumThread['category']>('General');
  const [expandedThread, setExpandedThread] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const filteredThreads = filterCategory === 'all'
    ? threads
    : threads.filter((t) => t.category === filterCategory);

  const handlePost = () => {
    if (!newTitle.trim()) return;
    addThread({ title: newTitle.trim(), author: 'You', content: newBody.trim(), category: newCat, replies: 0 });
    setNewTitle('');
    setNewBody('');
    setNewCat('General');
    setShowNewThread(false);
  };

  const handleReply = (threadId: string) => {
    if (!replyText.trim()) return;
    addReply(threadId, replyText.trim());
    setReplyText('');
  };

  const leftColumn = (
    <View style={styles.column}>
      <TouchableOpacity onPress={() => setShowNewThread(!showNewThread)} style={styles.newThreadBtn}>
        <Text style={styles.newThreadBtnText}>+ New Discussion</Text>
      </TouchableOpacity>

      {showNewThread && (
        <WebCard>
          <Text style={styles.sectionLabel}>Create Thread</Text>
          <TextInput
            style={styles.fieldInput}
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="Thread title..."
            placeholderTextColor={WEB_TOKENS.colors.textMuted}
          />
          <TextInput
            style={[styles.fieldInput, { marginTop: WEB_TOKENS.spacing.sm, minHeight: 80 }]}
            value={newBody}
            onChangeText={setNewBody}
            placeholder="Share your thoughts..."
            placeholderTextColor={WEB_TOKENS.colors.textMuted}
            multiline
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: WEB_TOKENS.spacing.sm }}>
            {(['General', 'Fasting', 'Progress', 'Nutrition', 'Workouts', 'Recipe'] as ForumThread['category'][]).map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setNewCat(cat)}
                style={[styles.catPill, newCat === cat ? styles.catPillActive : undefined]}
              >
                <Text style={[styles.catPillText, newCat === cat ? styles.catPillTextActive : undefined]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={{ marginTop: WEB_TOKENS.spacing.sm }}>
            <WebButton label="Post" variant="primary" onPress={handlePost} />
          </View>
        </WebCard>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <TouchableOpacity
          onPress={() => setFilterCategory('all')}
          style={[styles.catPill, filterCategory === 'all' ? styles.catPillActive : undefined]}
        >
          <Text style={[styles.catPillText, filterCategory === 'all' ? styles.catPillTextActive : undefined]}>All</Text>
        </TouchableOpacity>
        {(['Fasting', 'Progress', 'Nutrition', 'Workouts'] as ForumThread['category'][]).map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setFilterCategory(cat)}
            style={[styles.catPill, filterCategory === cat ? styles.catPillActive : undefined]}
          >
            <Text style={[styles.catPillText, filterCategory === cat ? styles.catPillTextActive : undefined]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredThreads.map((thread) => {
        const replies = threadReplies[thread.id] || [];
        const isExpanded = expandedThread === thread.id;
        return (
          <WebCard key={thread.id}>
            <View style={styles.threadHeader}>
              <View style={styles.threadCat}>
                <Text style={styles.threadCatText}>{thread.category}</Text>
              </View>
              <Text style={styles.threadTime}>{getRelativeTime(thread.createdAt)}</Text>
            </View>
            <Text style={styles.threadTitle}>{thread.title}</Text>
            {thread.content ? (
              <Text style={styles.threadExcerpt} numberOfLines={isExpanded ? undefined : 2}>{thread.content}</Text>
            ) : null}
            <View style={styles.threadFooter}>
              <Text style={styles.threadAuthor}>{thread.author}</Text>
              <Text style={styles.threadReplies}>{replies.length} replies</Text>
              <TouchableOpacity onPress={() => likeThread(thread.id)}>
                <Text style={[styles.threadAction, thread.liked ? { color: WEB_TOKENS.colors.primary } : undefined]}>
                  {thread.liked ? 'Liked' : 'Like'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setExpandedThread(isExpanded ? null : thread.id)}>
                <Text style={styles.threadAction}>{isExpanded ? 'Collapse' : 'Expand'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                Alert.alert('Delete', 'Delete this thread?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => removeThread(thread.id) },
                ]);
              }}>
                <Text style={[styles.threadAction, { color: WEB_TOKENS.colors.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>

            {isExpanded && (
              <View style={styles.repliesSection}>
                {replies.map((reply) => (
                  <View key={reply.id} style={styles.replyItem}>
                    <View style={styles.replyTop}>
                      <Text style={styles.replyAuthor}>{reply.author}</Text>
                      <Text style={styles.replyTime}>{getRelativeTime(reply.createdAt)}</Text>
                    </View>
                    <Text style={styles.replyBody}>{reply.body}</Text>
                    <View style={styles.replyActions}>
                      <TouchableOpacity onPress={() => voteReply(thread.id, reply.id, 1)}>
                        <Text style={[styles.replyVote, reply.userVote === 1 ? { color: WEB_TOKENS.colors.primary } : undefined]}>
                          ▲ {reply.upvotes}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => voteReply(thread.id, reply.id, -1)}>
                        <Text style={[styles.replyVote, reply.userVote === -1 ? { color: WEB_TOKENS.colors.error } : undefined]}>
                          ▼
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                <View style={styles.replyInputRow}>
                  <TextInput
                    style={styles.replyInput}
                    value={replyText}
                    onChangeText={setReplyText}
                    placeholder="Add a reply..."
                    placeholderTextColor={WEB_TOKENS.colors.textMuted}
                  />
                  <TouchableOpacity onPress={() => handleReply(thread.id)} style={styles.replySendBtn}>
                    <Text style={styles.replySendText}>Post</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </WebCard>
        );
      })}
    </View>
  );

  const rightColumn = (
    <View style={styles.column}>
      <WebCard>
        <Text style={styles.sectionLabel}>Challenges</Text>
        <ChallengesView />
      </WebCard>
    </View>
  );

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Community</Text>
        <Text style={styles.pageSub}>Learn, share, and grow together</Text>
      </View>
      <ScrollView style={styles.scroll}>
        <View style={isDesktop ? styles.desktopGrid : styles.mobileStack}>
          {isDesktop ? (
            <>{leftColumn}{rightColumn}</>
          ) : (
            <>{rightColumn}{leftColumn}</>
          )}
        </View>
        <View style={{ height: WEB_TOKENS.spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

function ChallengesView() {
  const { joinedChallenges, joinChallenge, leaveChallenge, updateChallengeProgress } = useCommunityStore();

  return (
    <View style={{ gap: WEB_TOKENS.spacing.md }}>
      {CHALLENGES.map((challenge) => {
        const joined = joinedChallenges.find((c) => c.challengeId === challenge.id);
        return (
          <View key={challenge.id} style={styles.challengeCard}>
            <View style={styles.challengeTop}>
              <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.challengeName}>{challenge.name}</Text>
                <Text style={styles.challengeDesc}>{challenge.desc}</Text>
                <Text style={styles.challengeParticipants}>{challenge.participants} participants</Text>
              </View>
            </View>
            {joined ? (
              <View>
                <View style={styles.challengeBar}>
                  <View style={[styles.challengeBarFill, { width: `${joined.progress}%` }]} />
                </View>
                <View style={styles.challengeActions}>
                  <Text style={styles.challengeProgress}>{joined.progress}% complete</Text>
                  <TouchableOpacity onPress={() => updateChallengeProgress(challenge.id, joined.progress + 25)} style={styles.challengeBtn}>
                    <Text style={styles.challengeBtnText}>+25%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => leaveChallenge(challenge.id)} style={styles.leaveBtn}>
                    <Text style={styles.leaveBtnText}>Leave</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity onPress={() => joinChallenge(challenge.id)} style={styles.joinBtn}>
                <Text style={styles.joinBtnText}>Join Challenge</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: WEB_TOKENS.colors.page,
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
  newThreadBtn: {
    borderRadius: WEB_TOKENS.radii.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: WEB_TOKENS.colors.border,
    padding: WEB_TOKENS.spacing.md,
    alignItems: 'center',
  },
  newThreadBtnText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primaryStrong,
  },
  fieldInput: {
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    borderRadius: WEB_TOKENS.radii.sm,
    borderWidth: 1,
    borderColor: WEB_TOKENS.colors.border,
    paddingHorizontal: WEB_TOKENS.spacing.md,
    paddingVertical: 10,
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    width: '100%',
  },
  catPill: {
    borderRadius: WEB_TOKENS.radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    marginRight: WEB_TOKENS.spacing.sm,
  },
  catPillActive: {
    backgroundColor: WEB_TOKENS.colors.primary,
  },
  catPillText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 11,
  },
  catPillTextActive: {
    color: WEB_TOKENS.colors.surface,
  },
  filterScroll: {
    marginBottom: 0,
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WEB_TOKENS.spacing.sm,
    marginBottom: WEB_TOKENS.spacing.xs,
  },
  threadCat: {
    backgroundColor: WEB_TOKENS.colors.secondary,
    borderRadius: WEB_TOKENS.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  threadCatText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.primaryStrong,
    fontSize: 10,
    fontWeight: '600',
  },
  threadTime: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 11,
  },
  threadTitle: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    fontSize: 15,
    marginBottom: 4,
  },
  threadExcerpt: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  threadFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WEB_TOKENS.spacing.md,
    paddingTop: WEB_TOKENS.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: WEB_TOKENS.colors.surfaceMuted,
  },
  threadAuthor: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontWeight: '600',
    fontSize: 11,
  },
  threadReplies: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 11,
  },
  threadAction: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  repliesSection: {
    marginTop: WEB_TOKENS.spacing.md,
    paddingTop: WEB_TOKENS.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: WEB_TOKENS.colors.surfaceMuted,
  },
  replyItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: WEB_TOKENS.colors.surfaceMuted,
  },
  replyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  replyAuthor: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.primaryStrong,
    fontWeight: '600',
    fontSize: 12,
  },
  replyTime: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 10,
  },
  replyBody: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    fontSize: 13,
  },
  replyActions: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.md,
    marginTop: 4,
  },
  replyVote: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 11,
  },
  replyInputRow: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
    marginTop: WEB_TOKENS.spacing.sm,
  },
  replyInput: {
    flex: 1,
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    borderRadius: WEB_TOKENS.radii.sm,
    paddingHorizontal: WEB_TOKENS.spacing.md,
    paddingVertical: 8,
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    fontSize: 12,
  },
  replySendBtn: {
    backgroundColor: WEB_TOKENS.colors.primary,
    borderRadius: WEB_TOKENS.radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  replySendText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.surface,
    fontSize: 12,
  },
  challengeCard: {
    borderTopWidth: 1,
    borderTopColor: WEB_TOKENS.colors.surfaceMuted,
    paddingTop: WEB_TOKENS.spacing.md,
    paddingBottom: 0,
  },
  challengeTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: WEB_TOKENS.spacing.sm,
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  challengeEmoji: {
    fontSize: 24,
  },
  challengeName: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    fontWeight: '600',
  },
  challengeDesc: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  challengeParticipants: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  challengeBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    overflow: 'hidden',
    marginBottom: WEB_TOKENS.spacing.xs,
  },
  challengeBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: WEB_TOKENS.colors.primary,
  },
  challengeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WEB_TOKENS.spacing.sm,
  },
  challengeProgress: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.primary,
    fontWeight: '600',
    fontSize: 11,
  },
  challengeBtn: {
    backgroundColor: WEB_TOKENS.colors.secondary,
    borderRadius: WEB_TOKENS.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  challengeBtnText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primaryStrong,
    fontSize: 10,
  },
  leaveBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: WEB_TOKENS.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  leaveBtnText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.error,
    fontSize: 10,
  },
  joinBtn: {
    backgroundColor: WEB_TOKENS.colors.primary,
    borderRadius: WEB_TOKENS.radii.sm,
    paddingVertical: 8,
    alignItems: 'center',
  },
  joinBtnText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.surface,
    fontSize: 13,
  },
});
