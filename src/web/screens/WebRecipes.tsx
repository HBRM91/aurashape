import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RECIPES, recipeToFood, type Recipe } from '@/src/lib/recipes';
import { useRecipeStore } from '@/src/stores/recipes';
import { useDiaryStore } from '@/src/stores/diary';
import { useIsDark } from '@/src/stores/theme';
import { getWebTokens } from '../tokens';
import { WebCard } from '../WebCard';

const FILTERS = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const;

export function WebRecipes() {
  const tokens = getWebTokens(useIsDark());
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const { isSaved, toggleSaved } = useRecipeStore();
  const addEntry = useDiaryStore((s) => s.addEntry);
  const recipes = useMemo(() => RECIPES.filter((recipe) => {
    const matchesQuery = `${recipe.name} ${recipe.description}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesFilter = filter === 'All' || recipe.category === filter.toLowerCase().replace('snacks', 'snack');
    return matchesQuery && matchesFilter;
  }), [filter, query]);

  return (
    <ScrollView style={[styles.page, { backgroundColor: tokens.colors.page }]} contentContainerStyle={styles.content}>
      <View style={styles.header}><View><Text style={[styles.title, { color: tokens.colors.text }]}>Recipes</Text><Text style={[styles.subtitle, { color: tokens.colors.textMuted }]}>Simple meals shaped around your goals.</Text></View><Text style={[styles.count, { color: tokens.colors.textMuted }]}>{recipes.length} recipes</Text></View>
      <TextInput accessibilityLabel="Search recipes" value={query} onChangeText={setQuery} placeholder="Search recipes" placeholderTextColor={tokens.colors.textMuted} style={[styles.search, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border, color: tokens.colors.text }]} />
      <View style={styles.filters}>{FILTERS.map((item) => <TouchableOpacity key={item} onPress={() => setFilter(item)} style={[styles.filter, { backgroundColor: filter === item ? tokens.colors.primary : tokens.colors.surface, borderColor: filter === item ? tokens.colors.primary : tokens.colors.border }]}><Text style={[styles.filterText, { color: filter === item ? tokens.colors.surface : tokens.colors.textMuted }]}>{item}</Text></TouchableOpacity>)}</View>
      {recipes.length === 0 ? <WebCard style={[styles.card, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }]}><Text style={[styles.emptyTitle, { color: tokens.colors.text }]}>No recipes found</Text><Text style={[styles.body, { color: tokens.colors.textMuted }]}>Try another search or category.</Text></WebCard> : <View style={styles.grid}>{recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} tokens={tokens} saved={isSaved(recipe.id)} onSave={() => toggleSaved(recipe.id)} onLog={() => addEntry(recipeToFood(recipe), 'lunch')} />)}</View>}
    </ScrollView>
  );
}

function RecipeCard({ recipe, tokens, saved, onSave, onLog }: { recipe: Recipe; tokens: ReturnType<typeof getWebTokens>; saved: boolean; onSave: () => void; onLog: () => void }) {
  return <WebCard style={[styles.card, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }]}><View style={styles.cardHeader}><Text style={[styles.recipeName, { color: tokens.colors.text }]}>{recipe.name}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Save ${recipe.name}`} onPress={onSave}><Text style={{ color: saved ? '#EF4444' : tokens.colors.textMuted }}>{saved ? '♥' : '♡'}</Text></TouchableOpacity></View><Text style={[styles.body, { color: tokens.colors.textMuted }]} numberOfLines={2}>{recipe.description}</Text><View style={styles.macros}><Stat label="Calories" value={`${recipe.caloriesPerServing}`} tokens={tokens} /><Stat label="Protein" value={`${recipe.proteinG}g`} tokens={tokens} /><Stat label="Time" value={`${recipe.prepTime + recipe.cookTime}m`} tokens={tokens} /></View><View style={styles.tags}>{recipe.dietaryTags.slice(0, 3).map((tag) => <Text key={tag} style={[styles.tag, { backgroundColor: tokens.colors.secondary, color: tokens.colors.primaryStrong }]}>{tag.replace('_', ' ')}</Text>)}</View><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Log ${recipe.name} to diary`} onPress={onLog} style={[styles.logButton, { backgroundColor: tokens.colors.secondary }]}><Text style={[styles.logText, { color: tokens.colors.primaryStrong }]}>Log to diary</Text></TouchableOpacity></WebCard>;
}

function Stat({ label, value, tokens }: { label: string; value: string; tokens: ReturnType<typeof getWebTokens> }) { return <View style={styles.stat}><Text style={[styles.statValue, { color: tokens.colors.text }]}>{value}</Text><Text style={[styles.statLabel, { color: tokens.colors.textMuted }]}>{label}</Text></View>; }

const styles = StyleSheet.create({ page: { flex: 1 }, content: { maxWidth: 1100, width: '100%', alignSelf: 'center', padding: 24, gap: 16 }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, title: { fontSize: 32, fontWeight: '700' }, subtitle: { fontSize: 14, marginTop: 4 }, count: { fontSize: 13 }, search: { borderRadius: 10, borderWidth: 1, fontSize: 15, minHeight: 48, paddingHorizontal: 14 }, filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, filter: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9 }, filterText: { fontSize: 13, fontWeight: '600' }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 }, card: { flex: 1, minWidth: 300, padding: 20 }, cardHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: 12, justifyContent: 'space-between' }, recipeName: { flex: 1, fontSize: 17, fontWeight: '700' }, body: { fontSize: 13, lineHeight: 20, marginTop: 6 }, macros: { flexDirection: 'row', gap: 8, marginTop: 18 }, stat: { flex: 1 }, statValue: { fontSize: 15, fontWeight: '700' }, statLabel: { fontSize: 11, marginTop: 2 }, tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 }, tag: { borderRadius: 999, fontSize: 11, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4 }, logButton: { alignItems: 'center', borderRadius: 8, marginTop: 18, paddingVertical: 11 }, logText: { fontSize: 13, fontWeight: '700' }, emptyTitle: { fontSize: 18, fontWeight: '700' },
});
