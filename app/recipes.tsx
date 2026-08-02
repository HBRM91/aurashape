import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { RECIPES, recipeToFood, type Recipe } from '@/src/lib/recipes';
import { useRecipeStore } from '@/src/stores/recipes';
import { useDiaryStore } from '@/src/stores/diary';
import { useThemeColors } from '@/src/stores/theme';
import { useState, useMemo } from 'react';
import type { DietaryPreference, MealSlot } from '@/src/types';
import {
  CookingPot,
  Heart,
  Clock,
  Fire,
  Barbell,
  Cube,
  Drop,
  X,
  MagnifyingGlass,
  ForkKnife,
} from 'phosphor-react-native';

const CATEGORIES: { key: Recipe['category'] | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snacks' },
];

const DIET_FILTERS: { key: DietaryPreference | 'all'; label: string }[] = [
  { key: 'all', label: 'All Diets' },
  { key: 'omnivore', label: 'Omnivore' },
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'keto', label: 'Keto' },
  { key: 'high_protein', label: 'High Protein' },
];

function RecipeCard({ recipe, onPress, colors }: { recipe: Recipe; onPress: () => void; colors: ReturnType<typeof useThemeColors> }) {
  const { isSaved, toggleSaved } = useRecipeStore();
  const { addEntry } = useDiaryStore();
  const saved = isSaved(recipe.id);

  const handleLogRecipe = () => {
    const food = recipeToFood(recipe);
    const mealSlots: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];
    Alert.alert('Log Recipe', 'Add to which meal?', [
      ...mealSlots.map((slot) => ({
        text: slot.charAt(0).toUpperCase() + slot.slice(1),
        onPress: () => addEntry(food, slot),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
      className="rounded-2xl border mb-4 overflow-hidden"
    >
      <View className="h-32 bg-gradient-to-br from-green-100 to-emerald-50 items-center justify-center relative">
        <CookingPot size={40} color="#22C55E" weight="duotone" />
        <View className="absolute top-3 right-3 flex-row gap-1">
          <View className="bg-white/90 px-2 py-1 rounded-full">
            <Text className="text-xs font-bold text-green-700">{recipe.caloriesPerServing} cal</Text>
          </View>
        </View>
      </View>
      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-2">
            <Text style={{ color: colors.text }} className="text-base font-bold">{recipe.name}</Text>
            <Text style={{ color: colors.textMuted }} className="text-xs mt-1" numberOfLines={2}>{recipe.description}</Text>
          </View>
          <TouchableOpacity
            onPress={() => toggleSaved(recipe.id)}
            className="p-1"
          >
            <Heart size={20} color={saved ? '#EF4444' : colors.textMuted} weight={saved ? 'fill' : 'regular'} />
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-3 mt-3">
          <View className="flex-row items-center">
            <Clock size={12} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted }} className="text-xs ml-1">{recipe.prepTime + recipe.cookTime}min</Text>
          </View>
          <View className="flex-row items-center">
            <Barbell size={12} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted }} className="text-xs ml-1">{recipe.proteinG}g protein</Text>
          </View>
          <View className="flex-row items-center">
            <Fire size={12} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted }} className="text-xs ml-1">{recipe.carbsG}g carbs</Text>
          </View>
          <View className="flex-row items-center">
            <Drop size={12} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted }} className="text-xs ml-1">{recipe.fatG}g fat</Text>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-1 mt-2">
          {recipe.dietaryTags.map((tag) => (
            <View key={tag} className="bg-green-50 px-2 py-0.5 rounded-full">
              <Text className="text-[10px] text-green-600 capitalize">{tag.replace('_', ' ')}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleLogRecipe}
          className="mt-3 bg-green-50 py-2 rounded-lg flex-row items-center justify-center"
        >
          <ForkKnife size={14} color="#22C55E" />
          <Text className="text-xs text-green-600 font-bold ml-1">Log to Diary</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function RecipeDetail({ recipe, onClose, colors }: { recipe: Recipe; onClose: () => void; colors: ReturnType<typeof useThemeColors> }) {
  const { isSaved, toggleSaved } = useRecipeStore();
  const { addEntry } = useDiaryStore();
  const saved = isSaved(recipe.id);

  const handleLogRecipe = () => {
    const food = recipeToFood(recipe);
    const mealSlots: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];
    Alert.alert('Log Recipe', 'Add to which meal?', [
      ...mealSlots.map((slot) => ({
        text: slot.charAt(0).toUpperCase() + slot.slice(1),
        onPress: () => addEntry(food, slot),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  return (
    <View style={{ backgroundColor: colors.bgCard }} className="flex-1">
      <View className="h-48 bg-gradient-to-br from-green-100 to-emerald-50 items-center justify-center relative">
        <TouchableOpacity onPress={onClose} className="absolute top-4 left-4 bg-white/80 p-2 rounded-full">
          <X size={20} color={colors.textSecondary} weight="bold" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleSaved(recipe.id)}
          className="absolute top-4 right-4 bg-white/80 p-2 rounded-full"
        >
          <Heart size={20} color={saved ? '#EF4444' : colors.textMuted} weight={saved ? 'fill' : 'regular'} />
        </TouchableOpacity>
        <CookingPot size={48} color="#22C55E" weight="duotone" />
      </View>

      <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
        <Text style={{ color: colors.text }} className="text-2xl font-bold">{recipe.name}</Text>
        <Text style={{ color: colors.textSecondary }} className="text-sm mt-2">{recipe.description}</Text>

        <View className="flex-row flex-wrap gap-3 mt-4">
          <View style={{ backgroundColor: colors.bgSecondary }} className="rounded-xl px-4 py-2 items-center">
            <Text style={{ color: colors.text }} className="text-lg font-bold">{recipe.caloriesPerServing}</Text>
            <Text style={{ color: colors.textMuted }} className="text-[10px]">Calories</Text>
          </View>
          <View className="bg-blue-50 rounded-xl px-4 py-2 items-center">
            <Text className="text-lg font-bold text-blue-700">{recipe.proteinG}g</Text>
            <Text className="text-[10px] text-blue-500">Protein</Text>
          </View>
          <View className="bg-amber-50 rounded-xl px-4 py-2 items-center">
            <Text className="text-lg font-bold text-amber-700">{recipe.carbsG}g</Text>
            <Text className="text-[10px] text-amber-500">Carbs</Text>
          </View>
          <View className="bg-pink-50 rounded-xl px-4 py-2 items-center">
            <Text className="text-lg font-bold text-pink-700">{recipe.fatG}g</Text>
            <Text className="text-[10px] text-pink-500">Fat</Text>
          </View>
          <View className="bg-purple-50 rounded-xl px-4 py-2 items-center">
            <Text className="text-lg font-bold text-purple-700">{recipe.fiberG}g</Text>
            <Text className="text-[10px] text-purple-500">Fiber</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleLogRecipe}
          className="mt-4 bg-green-500 py-3 rounded-xl flex-row items-center justify-center"
        >
          <ForkKnife size={18} color="#FFF" />
          <Text className="text-white text-sm font-bold ml-2">Log to Diary</Text>
        </TouchableOpacity>

        <View className="flex-row gap-3 mt-4">
          <View className="flex-row items-center">
            <Clock size={14} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted }} className="text-xs ml-1">Prep: {recipe.prepTime} min</Text>
          </View>
          <View className="flex-row items-center">
            <CookingPot size={14} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted }} className="text-xs ml-1">Cook: {recipe.cookTime} min</Text>
          </View>
          <View className="flex-row items-center">
            <Cube size={14} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted }} className="text-xs ml-1">{recipe.servings} servings</Text>
          </View>
        </View>

        <View className="mt-6">
          <Text style={{ color: colors.text }} className="text-base font-bold mb-3">Ingredients</Text>
          {recipe.ingredients.map((ing, i) => (
            <View key={i} style={{ borderColor: colors.borderLight }} className="flex-row items-center py-1.5 border-b">
              <View className="w-2 h-2 rounded-full bg-green-400 mr-3" />
              <Text style={{ color: colors.textSecondary }} className="text-sm">{ing}</Text>
            </View>
          ))}
        </View>

        <View className="mt-6 mb-10">
          <Text style={{ color: colors.text }} className="text-base font-bold mb-3">Instructions</Text>
          {recipe.instructions.map((step, i) => (
            <View key={i} className="flex-row mb-3">
              <View className="w-7 h-7 rounded-full bg-green-100 items-center justify-center mr-3 mt-0.5">
                <Text className="text-sm font-bold text-green-600">{i + 1}</Text>
              </View>
              <Text style={{ color: colors.textSecondary }} className="text-sm flex-1">{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default function RecipesScreen() {
  const colors = useThemeColors();
  const [selectedCategory, setSelectedCategory] = useState<Recipe['category'] | 'all'>('all');
  const [selectedDiet, setSelectedDiet] = useState<DietaryPreference | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const { savedRecipes } = useRecipeStore();

  const filteredRecipes = useMemo(() => {
    let recipes = showSaved
      ? RECIPES.filter((r) => savedRecipes.includes(r.id))
      : RECIPES;

    if (selectedCategory !== 'all') {
      recipes = recipes.filter((r) => r.category === selectedCategory);
    }

    if (selectedDiet !== 'all') {
      recipes = recipes.filter((r) => r.dietaryTags.includes(selectedDiet));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      recipes = recipes.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.toLowerCase().includes(q))
      );
    }

    return recipes;
  }, [selectedCategory, selectedDiet, searchQuery, showSaved, savedRecipes]);

  if (selectedRecipe) {
    return <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} colors={colors} />;
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bgSecondary }} className="flex-1">
      <View style={{ backgroundColor: colors.bgCard, borderColor: colors.border }} className="px-4 pt-6 pb-4 border-b">
        <Text style={{ color: colors.text }} className="text-2xl font-bold">Recipes</Text>
        <Text style={{ color: colors.textMuted }} className="text-sm mt-1">Discover healthy meals for your goals</Text>
      </View>

      <View className="px-4 mt-4">
        <View style={{ backgroundColor: colors.bgCard, borderColor: colors.border }} className="flex-row rounded-xl border px-3 py-2 items-center mb-4">
          <MagnifyingGlass size={18} color={colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search recipes..."
            style={{ color: colors.text }}
            className="flex-1 ml-2 text-sm"
            placeholderTextColor={colors.textMuted}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={colors.textMuted} weight="bold" />
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row items-center justify-between mb-3">
          <Text style={{ color: colors.textSecondary }} className="text-sm font-bold">CATEGORY</Text>
          <TouchableOpacity
            onPress={() => setShowSaved(!showSaved)}
            className={`flex-row items-center px-3 py-1 rounded-full ${showSaved ? 'bg-red-50' : ''}`}
            style={!showSaved ? { backgroundColor: colors.bgSecondary } : undefined}
          >
            <Heart size={14} color={showSaved ? '#EF4444' : colors.textMuted} weight={showSaved ? 'fill' : 'regular'} />
            <Text
              style={!showSaved ? { color: colors.textSecondary } : undefined}
              className={`text-xs font-semibold ml-1 ${showSaved ? 'text-red-500' : ''}`}
            >
              Saved ({savedRecipes.length})
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedCategory === cat.key ? 'bg-green-500' : 'bg-white border border-gray-200'
              }`}
              style={selectedCategory !== cat.key ? { backgroundColor: colors.bgCard, borderColor: colors.border } : undefined}
            >
              <Text
                style={selectedCategory !== cat.key ? { color: colors.textSecondary } : undefined}
                className={`text-sm font-semibold ${
                  selectedCategory === cat.key ? 'text-white' : ''
                }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={{ color: colors.textSecondary }} className="text-sm font-bold mb-2">DIET</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {DIET_FILTERS.map((diet) => (
            <TouchableOpacity
              key={diet.key}
              onPress={() => setSelectedDiet(diet.key)}
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedDiet === diet.key ? 'bg-emerald-500' : 'bg-white border border-gray-200'
              }`}
              style={selectedDiet !== diet.key ? { backgroundColor: colors.bgCard, borderColor: colors.border } : undefined}
            >
              <Text
                style={selectedDiet !== diet.key ? { color: colors.textSecondary } : undefined}
                className={`text-sm font-semibold ${
                  selectedDiet === diet.key ? 'text-white' : ''
                }`}
              >
                {diet.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="px-4 mb-8">
        {filteredRecipes.length === 0 ? (
          <View className="items-center py-16">
            <CookingPot size={48} color={colors.textMuted} weight="duotone" />
            <Text style={{ color: colors.textMuted }} className="mt-4 font-semibold">No recipes found</Text>
            <Text style={{ color: colors.textMuted }} className="text-sm mt-1">Try adjusting your filters</Text>
          </View>
        ) : (
          filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onPress={() => setSelectedRecipe(recipe)} colors={colors} />
          ))
        )}
      </View>
    </ScrollView>
  );
}
