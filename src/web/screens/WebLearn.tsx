import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useCommentStore } from '@/src/stores/comments';
import type { Comment } from '@/src/stores/comments';
import { WebCard } from '../WebCard';
import { WEB_TOKENS } from '../tokens';

interface ArticleSection {
  heading?: string;
  body: string;
}

interface ScienceBox {
  title: string;
  authors: string;
  journal: string;
  year: number;
  summary: string;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  readTime: string;
  category: string;
  sections: ArticleSection[];
  scienceBoxes: ScienceBox[];
  takeaways: string[];
  references: string[];
}

interface FoodGuide {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  accent: string;
  tips: Array<{ heading: string; body: string }>;
}

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Why Calories In/Calories Out Is Only Half the Story',
    excerpt: 'The energy balance equation is true but incomplete. Hormones, food quality, and timing matter just as much.',
    readTime: '8 min',
    category: 'Nutrition',
    sections: [
      { heading: 'The Flaw in Simple Math', body: 'The first law of thermodynamics is inviolable: energy cannot be created or destroyed. If you consume fewer calories than you burn, you will lose weight. This is true. But it is also incomplete.' },
      { heading: 'The Hormonal Layer', body: 'Your body is not a bomb calorimeter. It is a hormonal system. Insulin is the master regulator: when insulin is high, fat burning stops and fat storage begins.' },
      { heading: 'The Practical Takeaway', body: 'Count calories if you find it useful, but do not rely on it alone. Prioritize protein at every meal. Avoid ultra-processed foods that bypass satiety signals.' },
    ],
    scienceBoxes: [
      { title: 'Protein Leverage Hypothesis', authors: 'Simpson SJ, Raubenheimer D', journal: 'Obesity Reviews', year: 2005, summary: 'Animals (including humans) eat until protein needs are met, not calorie needs.' },
    ],
    takeaways: [
      'Calories matter, but hormones determine how those calories are partitioned.',
      'Protein has the highest thermic effect (20-30%).',
    ],
    references: ['Hall KD et al. Am J Clin Nutr, 2022.'],
  },
  {
    id: '2',
    title: 'Intermittent Fasting: What 20 Years of Research Actually Shows',
    excerpt: 'From cellular repair to longevity — a deep dive into the science behind fasting and its real-world effects.',
    readTime: '12 min',
    category: 'Fasting',
    sections: [
      { heading: 'Beyond the Hype', body: 'Intermittent fasting (IF) is not a diet. It is an eating pattern.' },
      { heading: 'The Three Mechanisms', body: 'IF works through three distinct biological pathways: metabolic switching, autophagy activation, and hormonal optimization.' },
      { heading: 'The Practical Truth', body: 'The best fasting protocol is the one you can sustain. 16:8 works for most people.' },
    ],
    scienceBoxes: [
      { title: 'Alternate-Day Fasting and Longevity', authors: 'Stekovic S et al.', journal: 'Cell Metabolism', year: 2019, summary: 'Alternate-day fasting showed reduced cardiovascular risk markers.' },
    ],
    takeaways: [
      'IF works through three pathways: metabolic switching, autophagy, and hormonal optimization.',
      '16:8 is the sweet spot.',
    ],
    references: ['de Cabo R, Mattson MP. NEJM, 2019.'],
  },
  {
    id: '3',
    title: 'Protein: How Much Do You Actually Need?',
    excerpt: 'The science of protein timing, leucine thresholds, and why 2g/kg might be the sweet spot.',
    readTime: '6 min',
    category: 'Nutrition',
    sections: [
      { heading: 'The RDA Is Wrong (For You)', body: 'The official RDA for protein is 0.8 g/kg. This is a minimum to prevent deficiency in sedentary adults.' },
      { heading: 'The Leucine Threshold', body: 'Muscle protein synthesis is triggered by leucine. You need ~2.5-3g of leucine per meal.' },
      { heading: 'How Much Per Kg?', body: '1.6-2.2 g/kg for muscle gain. 2.0-2.4 g/kg during calorie-restricted weight loss.' },
    ],
    scienceBoxes: [],
    takeaways: [
      'Aim for 1.6-2.2 g/kg if building muscle.',
      '30-40g of protein per meal triggers maximal MPS.',
    ],
    references: ['Phillips SM, Van Loon LJ. J Sports Sci, 2011.'],
  },
  {
    id: '4',
    title: 'The Science of Hunger: Why You Get Hungry and How to Control It',
    excerpt: 'Ghrelin, leptin, and the hormones that drive appetite — plus evidence-based strategies.',
    readTime: '10 min',
    category: 'Science',
    sections: [
      { heading: 'Hunger Is Not Willpower', body: 'Hunger is neurochemistry — the result of hormones binding to receptors.' },
      { heading: '7 Evidence-Based Strategies', body: 'Eat more protein, increase fiber, prioritize sleep, manage liquid calories, use volume eating, time your eating window, practice mindful eating.' },
    ],
    scienceBoxes: [],
    takeaways: [
      'Ghrelin rises during weight loss and stays elevated for at least a year.',
      'High-protein breakfast suppresses ghrelin most effectively.',
    ],
    references: ['Sumithran P et al. NEJM, 2011.'],
  },
  {
    id: '5',
    title: "The Beginner's Guide to Strength Training",
    excerpt: "Forget bro-science. Here's what decades of exercise physiology research says.",
    readTime: '9 min',
    category: 'Workouts',
    sections: [
      { heading: 'Why Strength Train?', body: 'Muscle is metabolic currency. Strength training reduces all-cause mortality by 23%.' },
      { heading: 'The Big 5 Movements', body: 'Squat, Deadlift, Bench Press, Overhead Press, Row. These cover every major muscle group.' },
    ],
    scienceBoxes: [],
    takeaways: [
      'Train each muscle 2-3x per week.',
      '10-20 hard sets per muscle group per week.',
    ],
    references: ['Schoenfeld BJ et al. Sports Med, 2016.'],
  },
];

const FOOD_GUIDES: FoodGuide[] = [
  {
    id: 'g1', title: 'The Satiating Plate', subtitle: 'Build meals that keep you full for hours',
    emoji: '🍽️', accent: '#22C55E',
    tips: [
      { heading: 'Protein first, always', body: 'Start with 30-40g of protein. Protein is the single most satiating macronutrient per calorie.' },
      { heading: 'Fill half with fiber', body: 'Vegetables should cover 50% of your plate. Fiber slows digestion and stretches the stomach.' },
      { heading: 'Add healthy fat', body: 'A thumb-sized portion of fat signals your brain to stop eating via CCK hormone release.' },
    ],
  },
  {
    id: 'g2', title: 'Glycemic Index Demystified', subtitle: 'Not all carbs are created equal',
    emoji: '📊', accent: '#F59E0B',
    tips: [
      { heading: 'What is GI?', body: 'Glycemic Index measures how fast a food raises blood sugar. Low GI = slow, steady rise.' },
      { heading: 'Pair to lower GI', body: 'Adding protein, fat, or fiber to a high-GI food drops its effective glycemic response by 30-50%.' },
      { heading: 'The vinegar effect', body: '1-2 tbsp of vinegar before a high-carb meal reduces post-meal glucose by 20-34%.' },
    ],
  },
  {
    id: 'g3', title: 'Macros Made Simple', subtitle: 'What to eat, when, and how much',
    emoji: '⚖️', accent: '#3B82F6',
    tips: [
      { heading: 'Protein: 1.6-2.2 g/kg', body: 'If you weigh 80kg, aim for 130-175g daily. Spread across 3-4 meals.' },
      { heading: 'Carbs: fill the rest', body: 'After setting protein and fat, carbs fill remaining calories. Target: 2-5 g/kg.' },
      { heading: 'Fat: 0.8-1.2 g/kg', body: 'Never drop below 0.6 g/kg — fat is essential for hormone production.' },
    ],
  },
  {
    id: 'g4', title: 'Protein for Plant-Based Eaters', subtitle: 'How to hit protein targets without meat',
    emoji: '🌱', accent: '#8B5CF6',
    tips: [
      { heading: 'Know the leucine gap', body: 'Plant proteins have 20-40% less leucine than animal proteins.' },
      { heading: 'Top sources ranked', body: 'Tempeh (19g/100g) > Edamame (12g) > Lentils (9g) > Chickpeas (7g) > Tofu (8g).' },
      { heading: 'Supplement wisely', body: 'Pea protein isolate has leucine levels close to whey.' },
    ],
  },
];

export function WebLearn() {
  useEffect(() => {
    try { require('@/src/lib/analytics').trackScreen('articles'); } catch {}
  }, []);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { addComment, likeComment, articleComments } = useCommentStore();
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showScience, setShowScience] = useState<Record<string, boolean>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const filteredArticles = selectedCategory === 'All'
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === selectedCategory);

  const leftColumn = (
    <View style={styles.column}>
      <View style={styles.filterRow}>
        {['All', 'Nutrition', 'Fasting', 'Science', 'Workouts'].map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[styles.catPill, selectedCategory === cat ? styles.catPillActive : undefined]}
          >
            <Text style={[styles.catPillText, selectedCategory === cat ? styles.catPillTextActive : undefined]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredArticles.map((article) => {
        const comments = articleComments[article.id] || [];
        const isExpanded = expandedArticle === article.id;
        return (
          <WebCard key={article.id}>
            <View style={styles.articleHeader}>
              <View style={styles.articleCat}>
                <Text style={styles.articleCatText}>{article.category}</Text>
              </View>
              <Text style={styles.articleTime}>{article.readTime}</Text>
            </View>
            <Text style={styles.articleTitle}>{article.title}</Text>
            <Text style={styles.articleExcerpt}>{article.excerpt}</Text>

            {isExpanded && (
              <View style={styles.articleBody}>
                {article.sections.map((section, i) => (
                  <View key={i} style={styles.section}>
                    {section.heading && <Text style={styles.sectionHeading}>{section.heading}</Text>}
                    <Text style={styles.sectionBody}>{section.body}</Text>
                  </View>
                ))}

                {article.scienceBoxes.length > 0 && (
                  <View style={styles.scienceSection}>
                    <TouchableOpacity
                      onPress={() => setShowScience((s) => ({ ...s, [article.id]: !s[article.id] }))}
                      style={styles.scienceToggle}
                    >
                      <Text style={styles.scienceToggleText}>
                        {showScience[article.id] ? 'Hide' : 'Show'} The Science ({article.scienceBoxes.length})
                      </Text>
                    </TouchableOpacity>
                    {showScience[article.id] && article.scienceBoxes.map((box, i) => (
                      <View key={i} style={styles.scienceBox}>
                        <Text style={styles.scienceBoxTitle}>{box.title}</Text>
                        <Text style={styles.scienceBoxCite}>{box.authors} — {box.journal} {box.year}</Text>
                        <Text style={styles.scienceBoxSummary}>{box.summary}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {article.takeaways.length > 0 && (
                  <View style={styles.takeaways}>
                    <Text style={styles.takeawayHeading}>Key Takeaways</Text>
                    {article.takeaways.map((t, i) => (
                      <Text key={i} style={styles.takeawayItem}>• {t}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity onPress={() => setExpandedArticle(isExpanded ? null : article.id)} style={styles.readMoreBtn}>
              <Text style={styles.readMoreText}>{isExpanded ? 'Show less' : 'Read full article'}</Text>
            </TouchableOpacity>

            <View style={styles.articleFooter}>
              <TouchableOpacity onPress={() => setLiked((s) => ({ ...s, [article.id]: !s[article.id] }))}>
                <Text style={[styles.footerAction, liked[article.id] ? { color: '#EF4444' } : undefined]}>
                  {liked[article.id] ? '❤️ Liked' : '♡ Like'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.footerMeta}>{comments.length} comments</Text>
            </View>

            {comments.length > 0 && (
              <View style={styles.commentsList}>
                {comments.filter((c) => !c.parentId).map((comment) => (
                  <CommentNode
                    key={comment.id}
                    comment={comment}
                    allComments={comments}
                    articleId={article.id}
                    likeComment={likeComment}
                    setReplyToId={setReplyToId}
                    depth={0}
                  />
                ))}
              </View>
            )}

            <View style={styles.commentInputRow}>
              {replyToId && (
                <View style={styles.replyBadge}>
                  <Text style={styles.replyBadgeText}>Replying</Text>
                  <TouchableOpacity onPress={() => setReplyToId(undefined)}>
                    <Text style={styles.replyBadgeClose}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TextInput
                style={styles.commentInput}
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Add a comment..."
                placeholderTextColor={WEB_TOKENS.colors.textMuted}
              />
              <TouchableOpacity
                onPress={() => {
                  if (commentText.trim()) {
                    addComment(article.id, 'article', {
                      author: 'You',
                      body: commentText.trim(),
                      likes: 0,
                      userLiked: false,
                      parentId: replyToId,
                    });
                    setCommentText('');
                    setReplyToId(undefined);
                  }
                }}
                style={styles.commentSendBtn}
              >
                <Text style={styles.commentSendText}>Post</Text>
              </TouchableOpacity>
            </View>
          </WebCard>
        );
      })}
    </View>
  );

  const rightColumn = (
    <View style={styles.column}>
      <Text style={styles.sectionLabel}>Food Hacking Guides</Text>
      {FOOD_GUIDES.map((guide) => (
        <WebCard key={guide.id}>
          <View style={styles.guideTop}>
            <Text style={styles.guideEmoji}>{guide.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.guideTitle}>{guide.title}</Text>
              <Text style={styles.guideSub}>{guide.subtitle}</Text>
            </View>
          </View>
          {guide.tips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={[styles.tipNum, { backgroundColor: guide.accent + '20' }]}>
                <Text style={[styles.tipNumText, { color: guide.accent }]}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tipHeading}>{tip.heading}</Text>
                <Text style={styles.tipBody}>{tip.body}</Text>
              </View>
            </View>
          ))}
        </WebCard>
      ))}
    </View>
  );

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Learn</Text>
        <Text style={styles.pageSub}>Science-backed articles</Text>
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

function CommentNode({
  comment, allComments, articleId, likeComment, setReplyToId, depth,
}: {
  comment: Comment;
  allComments: Comment[];
  articleId: string;
  likeComment: (key: string, type: 'article', commentId: string) => void;
  setReplyToId: (id: string) => void;
  depth: number;
}) {
  const children = allComments.filter((c) => c.parentId === comment.id);
  const indent = Math.min(depth, 3) * 12;

  return (
    <View style={{ marginLeft: indent }}>
      <View style={styles.commentItem}>
        <Text style={styles.commentAuthor}>{comment.author}</Text>
        <Text style={styles.commentBody}>{comment.body}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity onPress={() => likeComment(articleId, 'article', comment.id)}>
            <Text style={[styles.commentAction, comment.userLiked ? { color: '#EF4444' } : undefined]}>
              ♡ {comment.likes}
            </Text>
          </TouchableOpacity>
          {depth < 3 && (
            <TouchableOpacity onPress={() => setReplyToId(comment.id)}>
              <Text style={[styles.commentAction, { color: WEB_TOKENS.colors.primary }]}>Reply</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {children.map((child) => (
        <CommentNode key={child.id} comment={child} allComments={allComments}
          articleId={articleId} likeComment={likeComment} setReplyToId={setReplyToId} depth={depth + 1} />
      ))}
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
    marginBottom: WEB_TOKENS.spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WEB_TOKENS.spacing.sm,
    marginBottom: 0,
  },
  catPill: {
    borderRadius: WEB_TOKENS.radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: WEB_TOKENS.colors.surface,
    borderWidth: 1,
    borderColor: WEB_TOKENS.colors.border,
  },
  catPillActive: {
    backgroundColor: WEB_TOKENS.colors.primary,
    borderColor: WEB_TOKENS.colors.primary,
  },
  catPillText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
  },
  catPillTextActive: {
    color: WEB_TOKENS.colors.surface,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WEB_TOKENS.spacing.sm,
    marginBottom: WEB_TOKENS.spacing.xs,
  },
  articleCat: {
    backgroundColor: WEB_TOKENS.colors.secondary,
    borderRadius: WEB_TOKENS.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  articleCatText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.primaryStrong,
    fontSize: 10,
    fontWeight: '600',
  },
  articleTime: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 11,
  },
  articleTitle: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    fontSize: 15,
    marginBottom: 4,
  },
  articleExcerpt: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
  },
  articleBody: {
    marginTop: WEB_TOKENS.spacing.md,
    paddingTop: WEB_TOKENS.spacing.md,
    borderTopWidth: 1,
    borderTopColor: WEB_TOKENS.colors.surfaceMuted,
  },
  section: {
    marginBottom: WEB_TOKENS.spacing.md,
  },
  sectionHeading: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    marginBottom: 4,
    fontSize: 14,
  },
  sectionBody: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    lineHeight: 22,
  },
  scienceSection: {
    marginTop: WEB_TOKENS.spacing.sm,
  },
  scienceToggle: {
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    borderRadius: WEB_TOKENS.radii.sm,
    padding: WEB_TOKENS.spacing.sm,
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  scienceToggleText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    fontWeight: '600',
    fontSize: 12,
  },
  scienceBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: WEB_TOKENS.radii.sm,
    padding: WEB_TOKENS.spacing.md,
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  scienceBoxTitle: {
    ...WEB_TOKENS.typography.label,
    color: '#15803D',
    fontSize: 12,
  },
  scienceBoxCite: {
    ...WEB_TOKENS.typography.caption,
    color: '#166534',
    fontSize: 11,
    marginTop: 2,
  },
  scienceBoxSummary: {
    ...WEB_TOKENS.typography.caption,
    color: '#14532D',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 18,
  },
  takeaways: {
    marginTop: WEB_TOKENS.spacing.sm,
  },
  takeawayHeading: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primary,
    marginBottom: 4,
    fontSize: 13,
  },
  takeawayItem: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  readMoreBtn: {
    marginTop: WEB_TOKENS.spacing.sm,
  },
  readMoreText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primary,
    fontSize: 12,
  },
  articleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WEB_TOKENS.spacing.md,
    marginTop: WEB_TOKENS.spacing.sm,
    paddingTop: WEB_TOKENS.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: WEB_TOKENS.colors.surfaceMuted,
  },
  footerAction: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 11,
  },
  footerMeta: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 11,
  },
  commentsList: {
    marginTop: WEB_TOKENS.spacing.sm,
  },
  commentItem: {
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    borderRadius: WEB_TOKENS.radii.sm,
    padding: WEB_TOKENS.spacing.sm,
    marginBottom: 6,
  },
  commentAuthor: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    fontWeight: '600',
    fontSize: 11,
  },
  commentBody: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  commentActions: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.md,
    marginTop: 4,
  },
  commentAction: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 10,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WEB_TOKENS.spacing.sm,
    marginTop: WEB_TOKENS.spacing.sm,
  },
  replyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WEB_TOKENS.colors.secondary,
    borderRadius: WEB_TOKENS.radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 4,
  },
  replyBadgeText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.primaryStrong,
    fontSize: 10,
  },
  replyBadgeClose: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.primaryStrong,
    fontSize: 10,
    fontWeight: '700',
  },
  commentInput: {
    flex: 1,
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    borderRadius: WEB_TOKENS.radii.sm,
    paddingHorizontal: WEB_TOKENS.spacing.md,
    paddingVertical: 8,
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    fontSize: 12,
  },
  commentSendBtn: {
    backgroundColor: WEB_TOKENS.colors.secondary,
    borderRadius: WEB_TOKENS.radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  commentSendText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primaryStrong,
    fontSize: 11,
  },
  guideTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WEB_TOKENS.spacing.sm,
    marginBottom: WEB_TOKENS.spacing.md,
  },
  guideEmoji: {
    fontSize: 24,
  },
  guideTitle: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
  },
  guideSub: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: WEB_TOKENS.spacing.sm,
    gap: WEB_TOKENS.spacing.sm,
  },
  tipNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  tipNumText: {
    ...WEB_TOKENS.typography.label,
    fontSize: 11,
  },
  tipHeading: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  tipBody: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 11,
    marginTop: 1,
    lineHeight: 16,
  },
});
