import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { searchFoods } from '@/src/lib/foodApi';
import { useDiaryStore } from '@/src/stores/diary';
import type { Food } from '@/src/types';
import { WEB_TOKENS } from './tokens';

interface FoodSearchSheetProps {
  onSelect: (food: Food) => void;
  onClose: () => void;
}

export function FoodSearchSheet({ onSelect, onClose }: FoodSearchSheetProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const recentFoods = useDiaryStore((s) => s.recentFoods);
  const favoriteFoods = useDiaryStore((s) => s.favoriteFoods);
  const isFavoriteFood = useDiaryStore((s) => s.isFavoriteFood);
  const toggleFavoriteFood = useDiaryStore((s) => s.toggleFavoriteFood);

  const doSearch = useCallback(async (term: string) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(false);
    try {
      const foods = await searchFoods(term);
      if (requestId !== requestIdRef.current) return;
      setResults(foods);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setError(true);
      setResults([]);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setError(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(() => {
      doSearch(query.trim());
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, doSearch]);

  const displayedFoods = query.trim().length >= 2 ? results : recentFoods;
  const recentOnlyFoods = recentFoods.filter((food) => !isFavoriteFood(food.id));

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Search Foods</Text>
          <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close search">
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Search for a food..."
          placeholderTextColor={WEB_TOKENS.colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoFocus
          accessibilityLabel="Search food"
        />

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="small" color={WEB_TOKENS.colors.primary} />
            </View>
          ) : error ? (
            <View style={styles.centered}>
              <Text style={styles.stateText}>Could not search. Try again.</Text>
              <TouchableOpacity
                accessibilityLabel="Retry search"
                accessibilityRole="button"
                onPress={() => doSearch(query.trim())}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>Retry search</Text>
              </TouchableOpacity>
            </View>
          ) : displayedFoods.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.stateText}>
                {query.trim().length >= 2 ? 'No results found' : 'Search for foods or scan a barcode'}
              </Text>
            </View>
          ) : (
            <>
              {query.trim().length < 2 && favoriteFoods.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Favorites</Text>
                  {favoriteFoods.map(renderFood)}
                </>
              )}
              {query.trim().length < 2 && recentOnlyFoods.length > 0 && (
                <Text style={styles.sectionTitle}>Recent</Text>
              )}
              {(query.trim().length < 2 ? recentOnlyFoods : displayedFoods).map(renderFood)}
            </>
          )}
          <View style={{ height: WEB_TOKENS.spacing.md }} />
        </ScrollView>
      </View>
    </View>
  );

  function renderFood(food: Food) {
    const favorite = isFavoriteFood(food.id);

    return (
      <View key={food.id} style={styles.resultCard}>
        <TouchableOpacity
          style={styles.foodSelect}
          onPress={() => onSelect(food)}
          accessibilityRole="button"
          accessibilityLabel={`Select ${food.name}`}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.foodName} numberOfLines={1}>{food.name}</Text>
            <Text style={styles.foodBrand} numberOfLines={1}>
              {food.brand || food.serving_name}
            </Text>
          </View>
          <Text style={styles.foodCal}>{Math.round(food.calories_per_serving)} cal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavoriteFood(food)}
          accessibilityRole="button"
          accessibilityLabel={favorite ? `Remove ${food.name} from favorites` : `Favorite ${food.name}`}
          accessibilityState={{ selected: favorite }}
        >
          <Text style={[styles.favoriteIcon, favorite && styles.favoriteIconActive]}>
            {favorite ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderTopLeftRadius: WEB_TOKENS.radii.lg,
    borderTopRightRadius: WEB_TOKENS.radii.lg,
    maxHeight: '80%',
    paddingHorizontal: WEB_TOKENS.spacing.lg,
    paddingTop: WEB_TOKENS.spacing.md,
    paddingBottom: WEB_TOKENS.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: WEB_TOKENS.spacing.md,
  },
  title: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
  },
  closeBtn: {
    ...WEB_TOKENS.typography.body,
    color: WEB_TOKENS.colors.textMuted,
    padding: WEB_TOKENS.spacing.xs,
  },
  input: {
    ...WEB_TOKENS.typography.body,
    backgroundColor: WEB_TOKENS.colors.page,
    borderColor: WEB_TOKENS.colors.border,
    borderRadius: WEB_TOKENS.radii.sm,
    borderWidth: 2,
    color: WEB_TOKENS.colors.text,
    minHeight: 48,
    paddingHorizontal: WEB_TOKENS.spacing.md,
    paddingVertical: WEB_TOKENS.spacing.sm,
    marginBottom: WEB_TOKENS.spacing.md,
  },
  scroll: {
    flexGrow: 0,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: WEB_TOKENS.spacing.xl,
  },
  stateText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
  },
  retryButton: {
    marginTop: WEB_TOKENS.spacing.sm,
    paddingHorizontal: WEB_TOKENS.spacing.md,
    paddingVertical: WEB_TOKENS.spacing.xs,
  },
  retryText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primary,
  },
  sectionTitle: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.textMuted,
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: WEB_TOKENS.colors.border,
    gap: WEB_TOKENS.spacing.sm,
  },
  foodSelect: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: WEB_TOKENS.spacing.sm,
    paddingVertical: 4,
  },
  favoriteButton: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    fontSize: 22,
    color: WEB_TOKENS.colors.textMuted,
  },
  favoriteIconActive: {
    color: WEB_TOKENS.colors.primary,
  },
  foodName: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    fontWeight: '600',
  },
  foodBrand: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  foodCal: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primary,
  },
});
