import { View, Text, ScrollView, TouchableOpacity, TextInput, Share, Platform } from 'react-native';
import { WebLearn } from '@/src/web/screens/WebLearn';
import { WebAppShell } from '@/src/web/WebAppShell';
import { COLORS } from '@/src/constants/theme';
import { useThemeColors } from '@/src/stores/theme';
import { router } from 'expo-router';
import { BookOpen, ArrowLeft, Heart, ChatTeardrop, Flask, ShareNetwork } from 'phosphor-react-native';
import { useCommentStore } from '@/src/stores/comments';
import type { Comment } from '@/src/stores/comments';
import { trackScreen } from '@/src/lib/analytics';
import { useState, useEffect, useMemo } from 'react';
import { ReadingMode } from '@/src/web/ReadingMode';

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

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Why Calories In/Calories Out Is Only Half the Story',
    excerpt: 'The energy balance equation is true but incomplete. Hormones, food quality, and timing matter just as much.',
    readTime: '8 min',
    category: 'Nutrition',
    sections: [
      { heading: 'The Flaw in Simple Math', body: 'The first law of thermodynamics is inviolable: energy cannot be created or destroyed. If you consume fewer calories than you burn, you will lose weight. This is true. But it is also incomplete — dangerously so if you are trying to understand why weight loss stalls, why two people eating the same calories have different outcomes, or why you can gain fat while starving yourself.' },
      { heading: 'The Hormonal Layer', body: 'Your body is not a bomb calorimeter. It is a hormonal system. Insulin is the master regulator: when insulin is high, fat burning stops and fat storage begins. This is why two people can eat 2000 calories and have completely different body composition outcomes — one of them is producing less insulin, or clearing it faster, or has better insulin sensitivity.' },
      { body: 'Cortisol, the stress hormone, drives visceral fat storage even in a calorie deficit. Leptin resistance (common in obesity) means your brain cannot hear the "I am full" signal. Ghrelin, the hunger hormone, spikes when you lose weight, making maintenance physiologically harder after a diet.' },
      { heading: 'Food Quality Over Quantity', body: '500 calories of salmon and vegetables triggers a completely different hormonal cascade than 500 calories of soda. The salmon releases glucagon-like peptide-1 (GLP-1) and peptide YY — satiety hormones that tell your brain you are full. The soda spikes insulin, crashes blood sugar, and triggers hunger again within 90 minutes.' },
      { body: 'The thermic effect of food (TEF) also varies dramatically. Protein requires 20-30% of its calories just to be digested. Carbohydrates require 5-10%. Fats require 0-3%. Eating 2000 calories of high-protein food means your body only nets about 1500 — the rest is burned during digestion.' },
      { heading: 'Timing Is the Missing Piece', body: 'When you eat matters almost as much as what you eat. Time-restricted feeding studies show that the same calories consumed within a 6-8 hour window produce better metabolic outcomes — lower insulin, improved insulin sensitivity, reduced inflammation — than the same calories spread across 14+ hours. Your circadian clock genes regulate metabolism, and eating out of phase with them (e.g., midnight snacks) disrupts this regulation.' },
      { heading: 'The Practical Takeaway', body: 'Count calories if you find it useful, but do not rely on it alone. Prioritize protein at every meal. Avoid ultra-processed foods that bypass satiety signals. Eat within a consistent daily window. Manage stress and prioritize sleep — cortisol from poor sleep alone can slow fat loss by 55%. The equation is real; the inputs to it are more complex than any app can capture.' },
    ],
    scienceBoxes: [
      { title: 'Protein Leverage Hypothesis', authors: 'Simpson SJ, Raubenheimer D', journal: 'Obesity Reviews', year: 2005, summary: 'Animals (including humans) eat until protein needs are met, not calorie needs. If protein is diluted by carbs and fat, total calorie intake rises to compensate. This explains why high-protein diets spontaneously reduce calorie intake.' },
      { title: 'Circadian Clock and Metabolism', authors: 'Panda S', journal: 'Science', year: 2016, summary: 'The circadian clock in the liver, muscle, and fat tissue directly regulates glucose and lipid metabolism. Eating at the wrong circadian time (late-night) disrupts this regulation, leading to higher blood glucose despite identical meals.' },
    ],
    takeaways: [
      'Calories matter, but hormones determine how those calories are partitioned — to muscle or fat.',
      'Protein has the highest thermic effect (20-30%) — eat it at every meal.',
      'Time-restricted eating improves metabolic health even without calorie reduction.',
      'Sleep deprivation can reduce fat loss by 55% on the same calorie deficit.',
    ],
    references: [
      'Hall KD et al. "The energy balance model of obesity." American Journal of Clinical Nutrition, 2022.',
      'Ludwig DS et al. "The carbohydrate-insulin model." American Journal of Clinical Nutrition, 2021.',
      'Simpson SJ, Raubenheimer D. "Protein leverage hypothesis." Obesity Reviews, 2005.',
      'Panda S. "Circadian physiology of metabolism." Science, 2016.',
    ],
  },
  {
    id: '2',
    title: 'Intermittent Fasting: What 20 Years of Research Actually Shows',
    excerpt: 'From cellular repair to longevity — a deep dive into the science behind fasting and its real-world effects.',
    readTime: '12 min',
    category: 'Fasting',
    sections: [
      { heading: 'Beyond the Hype', body: 'Intermittent fasting (IF) is not a diet. It is an eating pattern — a schedule. This distinction matters because the internet has conflated IF with everything from keto to juice cleanses. At its core, IF is simply alternating periods of eating and not eating. The human body evolved with this pattern as the default; three meals a day is a modern invention.' },
      { heading: 'The Three Mechanisms', body: 'IF works through three distinct biological pathways, each supported by decades of research:' },
      { body: '1. Metabolic switching. After 10-12 hours without food, liver glycogen stores deplete and the body shifts from glucose to fatty acids and ketones for fuel. This shift — called the glucose-ketone switch — is metabolically healthy. Ketones are not just fuel; they are signaling molecules that reduce inflammation and oxidative stress.' },
      { body: '2. Autophagy activation. Around 16 hours of fasting, autophagy ramps up significantly. This is cellular housekeeping — damaged proteins, dysfunctional mitochondria, and intracellular pathogens are broken down and recycled. Autophagy declines with age and is implicated in virtually every age-related disease. Fasting is the most potent known activator.' },
      { body: '3. Hormonal optimization. Fasting lowers insulin (allowing fat mobilization), increases growth hormone (preserving muscle), and increases norepinephrine (maintaining energy and focus). The combined hormonal profile of a fasted state is optimized for fat burning and cellular repair.' },
      { heading: 'What the Data Shows', body: 'The most rigorous human trials paint a nuanced picture. A 2022 meta-analysis of 35 randomized controlled trials found that IF produces 3-8% weight loss over 12-24 weeks — comparable to continuous calorie restriction. But IF consistently outperforms on metabolic health markers: greater insulin sensitivity improvements, larger reductions in inflammatory markers (CRP, TNF-alpha), and better preservation of lean mass during weight loss.' },
      { body: 'For lean individuals, the benefits are more subtle — IF does not produce dramatic weight loss in people who are already at a healthy weight, but it does improve biomarkers of longevity (reduced IGF-1, increased autophagy markers, improved circadian gene expression).' },
      { heading: 'The Practical Truth', body: 'The best fasting protocol is the one you can sustain. 16:8 works for most people because it is simple: skip breakfast, eat lunch and dinner. 14:10 is gentler for beginners. 18:6 and 20:4 are advanced and may reduce social flexibility. Alternate-day fasting (5:2) has strong evidence but lower long-term adherence.' },
      { body: 'Common mistakes: breaking the fast with processed food (undoing metabolic benefits), not drinking enough water with electrolytes (causing headaches), and overcompensating during eating windows (negating the deficit). Start with 14:10, progress to 16:8, and listen to your body.' },
    ],
    scienceBoxes: [
      { title: 'Alternate-Day Fasting and Longevity', authors: 'Stekovic S et al.', journal: 'Cell Metabolism', year: 2019, summary: 'In a 4-week trial of alternate-day fasting in healthy non-obese adults, participants showed reduced cardiovascular risk markers, lower circulating IGF-1, and improved fat-to-lean ratio, with no adverse effects on immune function or bone density.' },
      { title: 'Time-Restricted Eating Meta-Analysis', authors: 'Moon S et al.', journal: 'Nutrients', year: 2022, summary: 'Analysis of 35 RCTs found that time-restricted eating produced 3-8% weight loss over 12-24 weeks. Insulin sensitivity improvements were consistently better than continuous calorie restriction at equivalent weight loss.' },
    ],
    takeaways: [
      'IF works through three pathways: metabolic switching, autophagy, and hormonal optimization.',
      '16:8 is the sweet spot — simple to sustain, hits the autophagy window.',
      'IF preserves more lean mass during weight loss than continuous calorie restriction.',
      'Electrolytes (sodium, potassium, magnesium) prevent fasting headaches and fatigue.',
    ],
    references: [
      'de Cabo R, Mattson MP. "Effects of Intermittent Fasting on Health." New England Journal of Medicine, 2019.',
      'Stekovic S et al. "Alternate day fasting improves physiological and molecular markers of aging." Cell Metabolism, 2019.',
      'Moon S et al. "Time-Restricted Eating: A Systematic Review and Meta-Analysis." Nutrients, 2022.',
      'Mizushima N. "Autophagy in human diseases." New England Journal of Medicine, 2020.',
    ],
  },
  {
    id: '3',
    title: 'Protein: How Much Do You Actually Need?',
    excerpt: 'The science of protein timing, leucine thresholds, and why 2g/kg might be the sweet spot for muscle.',
    readTime: '6 min',
    category: 'Nutrition',
    sections: [
      { heading: 'The RDA Is Wrong (For You)', body: 'The official Recommended Dietary Allowance (RDA) for protein is 0.8 grams per kilogram of body weight. This is not a target — it is a minimum to prevent deficiency in sedentary adults. If you exercise, if you are losing weight, if you are over 40, or if you simply want to optimize body composition, 0.8 g/kg is inadequate.' },
      { heading: 'The Leucine Threshold', body: 'Muscle protein synthesis (MPS) is not a gradual process — it is a switch. The amino acid leucine acts as the trigger. You need approximately 2.5-3g of leucine per meal to maximally stimulate MPS. This translates to roughly 30-40g of high-quality protein (chicken, beef, whey, soy) per meal. Below this threshold, MPS is submaximal regardless of total daily protein.' },
      { body: 'This is why spreading protein across 3-4 meals is more effective than one large protein meal. A single 80g protein meal exceeds the MPS ceiling and the excess amino acids are oxidized for energy. Three 30g meals trigger MPS three times. Same total protein, much better muscle-building outcome.' },
      { heading: 'How Much Per Kg?', body: 'The evidence supports these targets: 1.2-1.6 g/kg for general health and maintenance. 1.6-2.2 g/kg for muscle gain or athletic performance. 2.0-2.4 g/kg during calorie-restricted weight loss to prevent muscle loss. If you weigh 80kg and are trying to lose weight while preserving muscle, aim for 160-190g of protein daily.' },
      { heading: 'Plant vs. Animal Protein', body: 'Animal proteins are complete — they contain all essential amino acids in favorable ratios. Plant proteins are typically incomplete (low in one or more EAAs) and have lower leucine content. You can compensate by eating larger quantities, combining sources (rice + beans), or supplementing with isolated plant proteins. Pea and soy protein isolates approach whey in leucine content and MPS stimulation.' },
      { heading: 'Protein Timing', body: 'The "anabolic window" — the idea that you must consume protein within 30 minutes of training — is overstated. Post-workout MPS remains elevated for 24-48 hours. What matters more is consistent protein intake across the day, with one dose within a few hours of training. Pre-sleep protein (30-40g casein or cottage cheese) improves overnight MPS and recovery.' },
    ],
    scienceBoxes: [
      { title: 'Dose-Response of Post-Exercise MPS', authors: 'Witard OC et al.', journal: 'American Journal of Clinical Nutrition', year: 2014, summary: 'Measured MPS after resistance exercise with protein doses from 0 to 40g. Found that 20g of high-quality protein maximized MPS in young men (~0.25 g/kg), with 40g providing no additional benefit. Leucine content, not total protein, was the limiting factor.' },
      { title: 'Pre-Sleep Protein and Muscle Growth', authors: 'Snijders T et al.', journal: 'Journal of Nutrition', year: 2015, summary: 'Consuming 40g of casein protein before sleep increased overnight MPS by 22% compared to placebo. Over a 12-week resistance training program, the pre-sleep protein group gained significantly more muscle mass and strength than the control group.' },
    ],
    takeaways: [
      'Aim for 1.6-2.2 g/kg if building muscle; 2.0-2.4 g/kg when dieting.',
      '30-40g of protein per meal triggers maximal muscle protein synthesis.',
      'Spread protein across 3-4 meals — more triggers = more MPS.',
      'Pre-sleep casein protein improves overnight recovery.',
    ],
    references: [
      'Phillips SM, Van Loon LJ. "Dietary protein for athletes." Journal of Sports Sciences, 2011.',
      'Witard OC et al. "Myofibrillar muscle protein synthesis rates subsequent to a meal." American Journal of Clinical Nutrition, 2014.',
      'Snijders T et al. "Protein ingestion before sleep increases muscle mass." Journal of Nutrition, 2015.',
      'Morton RW et al. "A systematic review and meta-analysis of protein supplementation." British Journal of Sports Medicine, 2018.',
    ],
  },
  {
    id: '4',
    title: 'The Science of Hunger: Why You Get Hungry and How to Control It',
    excerpt: 'Ghrelin, leptin, and the hormones that drive appetite — plus evidence-based strategies to manage them.',
    readTime: '10 min',
    category: 'Science',
    sections: [
      { heading: 'Hunger Is Not Willpower', body: 'The feeling of hunger is not a moral failing. It is neurochemistry — the result of hormones binding to receptors in your hypothalamus. Understanding these hormones gives you the power to manipulate them, rather than being at their mercy.' },
      { heading: 'The Hunger Triad', body: 'Three hormones dominate appetite regulation: Ghrelin is the hunger hormone. It is produced in the stomach and rises before meals, falls after eating. Ghrelin also increases during sleep deprivation and calorie restriction — this is why dieting makes you hungrier over time. Leptin is the satiety hormone. It is produced by fat cells and tells your brain how much energy you have stored. In obesity, leptin resistance develops — the brain stops hearing the signal, so hunger persists despite abundant fat stores. Insulin is a secondary satiety signal. When insulin is chronically high (as in insulin resistance), this signal is blunted, compounding the hunger problem.' },
      { heading: 'Why Diets Fail (The Biology)', body: 'Weight loss triggers a coordinated biological counterattack: ghrelin rises by 20-30% and stays elevated for at least a year after weight loss. Leptin drops sharply (fat cells shrink, so less leptin is produced). Resting metabolic rate drops by 15-25% — more than can be explained by weight loss alone (adaptive thermogenesis). This is why 80% of people who lose significant weight regain it within 5 years. Their biology fights to return to the previous set point.' },
      { heading: '7 Evidence-Based Strategies', body: '1. Eat more protein. Protein is the most satiating macronutrient. A high-protein breakfast (35g+) reduces ghrelin and increases PYY more than a high-carb breakfast with the same calories. 2. Increase fiber. Soluble fiber (oats, legumes, psyllium) forms a gel in the stomach, slowing gastric emptying and prolonging fullness. Aim for 25-35g daily. 3. Prioritize sleep. One night of 4-5 hours of sleep increases ghrelin by 28% and decreases leptin by 18%. This is equivalent to the hormonal profile of someone who has been fasting for 24 hours. 4. Manage liquid calories. Liquid calories do not trigger satiety hormones the way solid food does. Soda, juice, smoothies — even "healthy" ones — bypass the satiety cascade. 5. Use volume eating. Large volumes of low-calorie-dense foods (vegetables, broth-based soups) stretch the stomach, triggering stretch receptors that signal fullness via the vagus nerve. 6. Time your eating window. Restricting eating to 8-10 hours reduces late-night snacking — the highest-risk period for overconsumption of calorie-dense, low-satiety foods. 7. Practice mindful eating. Eating without screens, chewing thoroughly, and pausing mid-meal gives your satiety hormones time to reach the brain before you overeat.' },
      { heading: 'The Bottom Line', body: 'Hunger is a hormonal signal, not a character flaw. You cannot "willpower" your way past chronically elevated ghrelin any more than you can willpower your way past a fever. But you can lower the signal by eating more protein, more fiber, sleeping more, and choosing solid food over liquids. Work with your biology, not against it.' },
    ],
    scienceBoxes: [
      { title: 'Sleep Deprivation and Appetite Hormones', authors: 'Spiegel K et al.', journal: 'Annals of Internal Medicine', year: 2004, summary: 'Two nights of 4-hour sleep increased ghrelin by 28% and decreased leptin by 18%. Hunger ratings increased by 24%, and appetite for calorie-dense, high-carbohydrate foods increased by 33-45%. Sleep loss creates the hormonal profile of the fasted state.' },
      { title: 'Long-Term Appetite Changes After Weight Loss', authors: 'Sumithran P et al.', journal: 'New England Journal of Medicine', year: 2011, summary: 'One year after 10% weight loss, ghrelin remained elevated by 20%, PYY and CCK (satiety hormones) remained suppressed, and subjective hunger was higher than baseline. These changes persisted despite weight stability, suggesting a biological drive toward regain.' },
    ],
    takeaways: [
      'Ghrelin rises during weight loss and stays elevated for at least a year — hunger is biological.',
      'High-protein breakfast (35g+) is the single most effective meal for suppressing ghrelin.',
      'One night of poor sleep increases ghrelin by 28% — equivalent to a 24-hour fast.',
      'Liquid calories bypass satiety signaling — eat, do not drink, your calories.',
    ],
    references: [
      'Sumithran P et al. "Long-term persistence of hormonal adaptations to weight loss." NEJM, 2011.',
      'Spiegel K et al. "Sleep curtailment and appetite regulation." Annals of Internal Medicine, 2004.',
      'Leidy HJ et al. "The role of protein in weight loss." American Journal of Clinical Nutrition, 2015.',
      'Rolls BJ. "Dietary energy density." Physiology & Behavior, 2009.',
    ],
  },
  {
    id: '5',
    title: 'The Beginner\'s Guide to Strength Training',
    excerpt: 'Forget bro-science. Here\'s what decades of exercise physiology research says about building muscle and training efficiently.',
    readTime: '9 min',
    category: 'Workouts',
    sections: [
      { heading: 'Why Strength Train?', body: 'Muscle is metabolic currency. Every kilogram of muscle burns about 13 calories per day at rest. More importantly, muscle mass is the single strongest predictor of longevity in older adults — more than BMI, blood pressure, or cholesterol. Strength training also improves insulin sensitivity independent of weight loss, increases bone density, and reduces all-cause mortality by 23% when performed 1-2x per week.' },
      { heading: 'The Three Principles', body: 'All effective training boils down to three principles. Progressive overload: you must do more over time — more weight, more reps, more sets, or less rest. Without progression, you are just exercising, not training. Specificity: you get better at exactly what you practice. Mechanical tension: muscles grow in response to high tension, not pump or burn.' },
      { heading: 'Frequency: How Often?', body: 'Training a muscle 2-3x per week produces approximately 2x more growth than training it 1x per week at equal total volume. Full-body or upper/lower splits beat the traditional bro split. Aim for 2-3 full-body sessions per week as a beginner.' },
      { heading: 'Volume: How Many Sets?', body: 'The dose-response curve for volume: 10-20 sets per muscle group per week maximizes hypertrophy. Below 10 sets leaves gains on the table. Above 20 sets, diminishing returns set in. Beginners should start at 8-10 sets and build to 15-20 over months.' },
      { heading: 'The Big 5 Movements', body: 'If you only did 5 exercises: Squat, Deadlift or Hip Thrust, Bench Press or Push-up, Overhead Press, Row or Pull-up. These 5 cover every major muscle group in the body.' },
      { heading: 'Rest Periods', body: 'For strength: rest 3-5 minutes between heavy sets. For hypertrophy: rest 60-90 seconds. ATP takes 3 minutes to replenish — short rest forces lighter weights and less growth stimulus.' },
      { heading: 'The Bottom Line', body: 'Pick 4-5 compound exercises. Do 2-3 full-body sessions per week. Start with 8-10 sets per muscle group. Add weight or reps each week. Eat enough protein. Sleep 7-9 hours. Be consistent for 12 weeks.' },
    ],
    scienceBoxes: [
      { title: 'Training Frequency Meta-Analysis', authors: 'Schoenfeld BJ et al.', journal: 'Sports Medicine', year: 2016, summary: 'Meta-analysis of 10 studies: training muscles 2x per week produced significantly greater hypertrophy than 1x per week at equal volume. Effect most pronounced in upper body.' },
      { title: 'Volume Dose-Response for Hypertrophy', authors: 'Schoenfeld BJ et al.', journal: 'Journal of Sports Sciences', year: 2017, summary: 'Under 5 weekly sets minimal growth, 5-9 modest, 10+ robust. Beyond 20 sets per muscle per week, additional volume did not increase growth.' },
    ],
    takeaways: [
      'Train each muscle 2-3x per week for maximum growth.',
      '10-20 hard sets per muscle group per week is the sweet spot.',
      'Focus on 5 compound movements covering all muscle groups.',
      'Separate cardio and strength by 6+ hours.',
    ],
    references: [
      'Schoenfeld BJ et al. "Resistance training frequency and muscle hypertrophy." Sports Medicine, 2016.',
      'Schoenfeld BJ et al. "Resistance training volume and muscle mass." JSS, 2017.',
    ],
  },
];

interface FoodGuide {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  accent: string;
  tips: Array<{ heading: string; body: string }>;
}

const FOOD_GUIDES: FoodGuide[] = [
  {
    id: 'g1',
    title: 'The Satiating Plate',
    subtitle: 'Build meals that keep you full for hours',
    emoji: '🍽️',
    accent: '#22C55E',
    tips: [
      { heading: 'Protein first, always', body: 'Start with 30-40g of protein. Chicken, fish, eggs, tofu, or legumes. Protein is the single most satiating macronutrient per calorie.' },
      { heading: 'Fill half with fiber', body: 'Vegetables should cover 50% of your plate. Fiber slows digestion and stretches the stomach, triggering fullness signals via the vagus nerve.' },
      { heading: 'Add healthy fat', body: 'A thumb-sized portion of fat (avocado, olive oil, nuts) signals your brain to stop eating via CCK hormone release.' },
      { heading: 'Carbs go last', body: 'Complex carbs (quinoa, sweet potato, brown rice) should fill whatever space remains — usually 20-25% of the plate.' },
      { heading: 'Hydrate alongside', body: '500ml of water with your meal. The combination of water + fiber creates a gel in your stomach that prolongs fullness.' },
    ],
  },
  {
    id: 'g2',
    title: 'Glycemic Index Demystified',
    subtitle: 'Not all carbs are created equal',
    emoji: '📊',
    accent: '#F59E0B',
    tips: [
      { heading: 'What is GI?', body: 'Glycemic Index measures how fast a food raises blood sugar. High GI (70+) = rapid spike. Low GI (55-) = slow, steady rise. The lower, the better for satiety and insulin control.' },
      { heading: 'Pair to lower GI', body: 'Adding protein, fat, or fiber to a high-GI food drops its effective glycemic response by 30-50%. White rice with chicken is metabolically different from white rice alone.' },
      { heading: 'Swap smartly', body: 'White rice (GI 73) → brown rice (GI 50). White bread (GI 75) → sourdough (GI 53). Instant oats (GI 79) → steel-cut oats (GI 55). Small swaps, big impact.' },
      { heading: 'Eat in order', body: 'Eating vegetables and protein before carbs at a meal reduces the glucose spike by 37% — even with the exact same food on the plate.' },
      { heading: 'The vinegar effect', body: '1-2 tbsp of vinegar before a high-carb meal slows gastric emptying and reduces post-meal glucose by 20-34%. Apple cider vinegar works best.' },
    ],
  },
  {
    id: 'g3',
    title: 'Macros Made Simple',
    subtitle: 'What to eat, when, and how much',
    emoji: '⚖️',
    accent: '#3B82F6',
    tips: [
      { heading: 'Protein: 1.6-2.2 g/kg', body: 'If you weigh 80kg, aim for 130-175g daily. Spread across 3-4 meals (30-40g each). Sources: chicken, eggs, Greek yogurt, tofu, whey, lentils.' },
      { heading: 'Carbs: fill the rest', body: 'After setting protein and fat, carbs fill remaining calories. Active? Go higher. Sedentary? Go lower. Target: 2-5 g/kg depending on activity.' },
      { heading: 'Fat: 0.8-1.2 g/kg', body: 'Never drop below 0.6 g/kg — fat is essential for hormone production. Sources: olive oil, avocado, nuts, seeds, fatty fish, egg yolks.' },
      { heading: 'Fiber: 25-35g daily', body: 'Most people get half of this. Soluble fiber (oats, beans, psyllium) is especially important for gut health and cholesterol. Add it gradually or you will regret it.' },
      { heading: 'Timing matters less than totals', body: 'Hitting your daily macro targets is 90% of the battle. Meal timing is the last 10%. Do not stress about the perfect schedule — hit the numbers first.' },
    ],
  },
  {
    id: 'g4',
    title: 'Protein for Plant-Based Eaters',
    subtitle: 'How to hit protein targets without meat',
    emoji: '🌱',
    accent: '#8B5CF6',
    tips: [
      { heading: 'Know the leucine gap', body: 'Plant proteins have 20-40% less leucine than animal proteins. You need larger portions or strategic combining to trigger muscle protein synthesis.' },
      { heading: 'Top sources ranked', body: 'Tempeh (19g/100g) > Edamame (12g) > Lentils (9g) > Chickpeas (7g) > Tofu (8g). Seitan (25g/100g) is the highest protein plant food by weight.' },
      { heading: 'Combine for completeness', body: 'Rice + beans, hummus + pita, peanut butter + whole grain bread. You do not need to combine at every meal — eating varied plants across the day covers all amino acids.' },
      { heading: 'Supplement wisely', body: 'Pea protein isolate has leucine levels close to whey. Soy protein isolate is a complete protein. A scoop (25g protein, 2.5g leucine) hits the MPS threshold in one serving.' },
      { heading: 'Track specifically', body: 'Plant-based eaters should track protein more carefully than omnivores. The margin for error is smaller. Aim for the upper end: 2.0-2.4 g/kg if building muscle.' },
    ],
  },
];

export default function ArticlesScreen() {
  if (Platform.OS === 'web') return <WebAppShell title="Learn"><WebLearn /></WebAppShell>;
  const { addComment, likeComment } = useCommentStore();
  const articleComments = useCommentStore((s) => s.articleComments);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showScience, setShowScience] = useState<Record<string, boolean>>({});
  const [likedArticles, setLikedArticles] = useState<Record<string, boolean>>({});
  const [readingMode, setReadingMode] = useState<{articleId: string; claim: string} | null>(null);
  const colors = useThemeColors();

  useEffect(() => { trackScreen('articles'); }, []);

  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'All') return ARTICLES;
    return ARTICLES.filter((a) => a.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bgSecondary }}>
      <View
        className="px-4 pt-6 pb-4 border-b flex-row items-center gap-3"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>Learn</Text>
          <Text className="text-sm" style={{ color: colors.textMuted }}>Science-backed articles</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <View className="flex-row gap-2 mb-4">
          {['All', 'Nutrition', 'Fasting', 'Science', 'Workouts'].map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              className="px-3 py-1.5 rounded-full border"
              style={{
                backgroundColor: selectedCategory === cat ? colors.primary : colors.bgCard,
                borderColor: selectedCategory === cat ? colors.primary : colors.border,
              }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: selectedCategory === cat ? '#FFFFFF' : colors.textSecondary }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredArticles.map((article) => {
          const comments = articleComments[article.id] || [];
          const isExpanded = expandedArticle === article.id;

          return (
          <View
            key={article.id}
            className="rounded-2xl p-5 mb-3 border"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <BookOpen size={16} color={COLORS.primary} weight="fill" />
              <Text className="text-xs font-semibold" style={{ color: COLORS.primary }}>
                {article.category}
              </Text>
              <Text className="text-xs" style={{ color: colors.textMuted }}>·</Text>
              <Text className="text-xs" style={{ color: colors.textMuted }}>{article.readTime}</Text>
            </View>
            <Text className="text-base font-bold" style={{ color: colors.text }}>{article.title}</Text>
            <Text className="text-sm mt-1 leading-relaxed" style={{ color: colors.textSecondary }}>{article.excerpt}</Text>

            {isExpanded && (
              <View className="mt-4 pt-4 border-t" style={{ borderColor: colors.borderLight }}>
                {article.sections.map((section, i) => (
                  <View key={i} className="mb-4">
                    {section.heading && (
                      <Text className="text-base font-bold mb-2" style={{ color: colors.text }}>{section.heading}</Text>
                    )}
                    <Text className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>{section.body}</Text>
                  </View>
                ))}

                {article.scienceBoxes.length > 0 && (
                  <View className="mt-2 mb-4">
                    <TouchableOpacity
                      onPress={() => setShowScience((s) => ({ ...s, [article.id]: !s[article.id] }))}
                      className="flex-row items-center gap-2 py-2 px-3 rounded-lg"
                      style={{ backgroundColor: colors.bgInput }}
                    >
                      <Flask size={16} color={colors.textSecondary} weight="fill" />
                      <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
                        {showScience[article.id] ? 'Hide' : 'Show'} The Science ({article.scienceBoxes.length})
                      </Text>
                    </TouchableOpacity>

                    {showScience[article.id] && article.scienceBoxes.map((box, i) => (
                      <View key={i} className="mt-2 rounded-lg p-3 bg-green-50">
                        <Text className="text-xs font-bold" style={{ color: '#15803D' }}>{box.title}</Text>
                        <Text className="text-xs mt-1" style={{ color: '#166534' }}>{box.authors} — {box.journal}
  {box.year}</Text>
                        <Text className="text-xs mt-2 leading-relaxed" style={{ color: '#14532D' }}>{box.summary}</Text>
                        {Platform.OS === 'web' && (
                          <TouchableOpacity
                            onPress={() => setReadingMode({ articleId: article.id, claim: box.title })}
                            className="mt-2 flex-row items-center gap-1"
                          >
                            <Text className="text-xs font-semibold" style={{ color: COLORS.primary }}>🔍 AI Explain</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {article.takeaways.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-sm font-bold mb-2" style={{ color: COLORS.primary }}>Key Takeaways</Text>
                    {article.takeaways.map((t, i) => (
                      <View key={i} className="flex-row mb-1.5">
                        <Text className="text-sm mr-2" style={{ color: COLORS.primary }}>•</Text>
                        <Text className="text-sm flex-1" style={{ color: colors.textSecondary }}>{t}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {article.references.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-xs font-semibold mb-1" style={{ color: colors.textMuted }}>References</Text>
                    {article.references.map((r, i) => (
                      <Text key={i} className="text-xs mb-0.5" style={{ color: colors.textMuted }}>{i + 1}. {r}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity
              onPress={() => setExpandedArticle(isExpanded ? null : article.id)}
              className="flex-row items-center gap-1 mt-3"
            >
              <Text className="text-xs font-semibold" style={{ color: COLORS.primary }}>
                {isExpanded ? 'Show less' : 'Read full article'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: colors.borderLight }}>
              <TouchableOpacity
                onPress={() => setLikedArticles((s) => ({ ...s, [article.id]: !s[article.id] }))}
                className="flex-row items-center gap-1.5"
              >
                <Heart size={14} color={likedArticles[article.id] ? '#EF4444' : colors.textMuted} weight={likedArticles[article.id] ? 'fill' : 'regular'} />
                <Text className="text-xs" style={{ color: likedArticles[article.id] ? '#EF4444' : colors.textMuted }}>Like</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setExpandedArticle(isExpanded ? null : article.id)}
                className="flex-row items-center gap-1.5"
              >
                <ChatTeardrop size={14} color={colors.textMuted} weight="fill" />
                <Text className="text-xs" style={{ color: colors.textMuted }}>{comments.length} comments</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Share.share({ message: `${article.title}\n\nRead on Aurashape →` })}
                className="flex-row items-center gap-1.5"
              >
                <ShareNetwork size={14} color={colors.textMuted} weight="fill" />
                <Text className="text-xs" style={{ color: colors.textMuted }}>Share</Text>
              </TouchableOpacity>
            </View>

            {comments.length > 0 && (
              <View className="mt-2">
                {renderCommentTree(comments, article.id, colors, likeComment, setReplyToId)}
              </View>
            )}

            <View className="flex-row gap-2 mt-2">
              {replyToId && (
                <View className="flex-row items-center bg-green-50 px-2 py-0.5 rounded-full">
                  <Text className="text-xs text-green-600">Replying</Text>
                  <TouchableOpacity onPress={() => setReplyToId(undefined)} className="ml-1">
                    <Text className="text-xs text-green-600 font-bold">✕</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TextInput
                className="flex-1 rounded-lg px-3 py-2 text-xs"
                style={{ backgroundColor: colors.bgInput }}
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Add a comment..."
                placeholderTextColor={colors.textMuted}
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
                className="px-4 py-2 rounded-lg bg-green-100"
              >
                <Text className="text-xs font-semibold text-green-700">Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        )})}

        {filteredArticles.length === 0 && (
          <View className="items-center py-16">
            <BookOpen size={40} color={colors.textMuted} weight="duotone" />
            <Text className="text-base font-semibold mt-4" style={{ color: colors.textMuted }}>
              No articles found
            </Text>
            <Text className="text-sm mt-1" style={{ color: colors.textMuted }}>
              Try selecting a different category
            </Text>
          </View>
        )}

        <View className="mt-2 mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-lg">🧪</Text>
            <Text className="text-base font-bold" style={{ color: colors.text }}>Food Hacking Guides</Text>
          </View>
          {FOOD_GUIDES.map((guide) => (
            <View key={guide.id} className="rounded-2xl p-4 mb-3" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-2xl">{guide.emoji}</Text>
                <View className="flex-1">
                  <Text className="text-sm font-bold" style={{ color: colors.text }}>{guide.title}</Text>
                  <Text className="text-xs" style={{ color: colors.textMuted }}>{guide.subtitle}</Text>
                </View>
                <TouchableOpacity onPress={() => {
                  const text = `🧪 ${guide.title}: ${guide.subtitle}\n\n${guide.tips.map((t, i) => `${i + 1}. ${t.heading}: ${t.body}`).join('\n\n')}\n\nMore science at Aurashape →`;
                  Share.share({ message: text });
                }} className="p-2">
                  <ShareNetwork size={18} color={guide.accent} weight="fill" />
                </TouchableOpacity>
              </View>
              {guide.tips.map((tip, i) => (
                <View key={i} className="flex-row mb-2.5">
                  <View className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5" style={{ backgroundColor: guide.accent + '20' }}>
                    <Text className="text-xs font-bold" style={{ color: guide.accent }}>{i + 1}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold" style={{ color: colors.text }}>{tip.heading}</Text>
                    <Text className="text-xs mt-0.5 leading-relaxed" style={{ color: colors.textSecondary }}>{tip.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View className="h-24" />
      </ScrollView>

      {readingMode && (
        <ReadingMode
          articleId={readingMode.articleId}
          claim={readingMode.claim}
          onClose={() => setReadingMode(null)}
        />
      )}
    </View>
  );
}

function renderCommentTree(
  comments: Comment[],
  articleId: string,
  colors: ReturnType<typeof useThemeColors>,
  likeComment: (key: string, type: 'article', commentId: string) => void,
  setReplyToId: (id: string) => void,
): React.ReactNode {
  const topComments = comments.filter((c) => !c.parentId);
  return topComments.map((comment) => (
    <CommentNode key={comment.id} comment={comment} allComments={comments}
      articleId={articleId} colors={colors} likeComment={likeComment}
      setReplyToId={setReplyToId} depth={0} />
  ));
}

function CommentNode({
  comment, allComments, articleId, colors, likeComment, setReplyToId, depth,
}: {
  comment: Comment;
  allComments: Comment[];
  articleId: string;
  colors: ReturnType<typeof useThemeColors>;
  likeComment: (key: string, type: 'article', commentId: string) => void;
  setReplyToId: (id: string) => void;
  depth: number;
}) {
  const children = allComments.filter((c) => c.parentId === comment.id);
  const indent = Math.min(depth, 3) * 12;

  return (
    <View style={{ marginLeft: indent }}>
      <View className="rounded-lg px-3 py-1.5 mb-1" style={{ backgroundColor: colors.bgInput }}>
        <Text className="text-xs font-semibold" style={{ color: colors.text }}>{comment.author}</Text>
        <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{comment.body}</Text>
        <View className="flex-row items-center gap-3 mt-1.5">
          <TouchableOpacity onPress={() => likeComment(articleId, 'article', comment.id)} className="flex-row items-center gap-0.5">
            <Heart size={10} color={comment.userLiked ? '#EF4444' : colors.textMuted} weight={comment.userLiked ? 'fill' : 'regular'} />
          </TouchableOpacity>
          <Text className="text-xs" style={{ color: colors.textMuted }}>{comment.likes}</Text>
          {depth < 3 && (
            <TouchableOpacity onPress={() => setReplyToId(comment.id)}>
              <Text className="text-xs font-semibold" style={{ color: COLORS.primary }}>Reply</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {children.map((child) => (
        <CommentNode key={child.id} comment={child} allComments={allComments}
          articleId={articleId} colors={colors} likeComment={likeComment}
          setReplyToId={setReplyToId} depth={depth + 1} />
      ))}
    </View>
  );
}
