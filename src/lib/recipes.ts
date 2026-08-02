import type { DietaryPreference } from '@/src/types';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  caloriesPerServing: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dietaryTags: DietaryPreference[];
  imageQuery: string;
}

export const RECIPES: Recipe[] = [
  // BREAKFAST
  {
    id: 'r-protein-oats',
    name: 'High-Protein Overnight Oats',
    description: 'Creamy overnight oats packed with protein powder, chia seeds, and fresh berries.',
    ingredients: ['Rolled oats 60g', 'Whey protein (vanilla) 30g', 'Chia seeds 15g', 'Greek yogurt 100g', 'Almond milk 150ml', 'Mixed berries 80g'],
    instructions: ['Mix oats, protein powder, and chia seeds in a jar.', 'Add yogurt and almond milk, stir well.', 'Cover and refrigerate overnight.', 'Top with berries before serving.'],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    caloriesPerServing: 485,
    proteinG: 42,
    carbsG: 52,
    fatG: 14,
    fiberG: 8,
    category: 'breakfast',
    dietaryTags: ['omnivore', 'high_protein'],
    imageQuery: 'overnight oats with berries',
  },
  {
    id: 'r-veggie-scramble',
    name: 'Loaded Veggie Scramble',
    description: 'Fluffy scrambled eggs with spinach, mushrooms, and bell peppers. Quick high-protein start.',
    ingredients: ['Eggs 3 large', 'Spinach 40g', 'Mushrooms 50g', 'Bell pepper 50g', 'Olive oil 1 tsp', 'Salt & pepper'],
    instructions: ['Heat olive oil in a non-stick pan.', 'Sauté mushrooms and peppers for 3 min.', 'Add spinach, cook until wilted.', 'Beat eggs, pour over veggies, scramble until set.'],
    prepTime: 5,
    cookTime: 8,
    servings: 1,
    caloriesPerServing: 320,
    proteinG: 22,
    carbsG: 8,
    fatG: 22,
    fiberG: 3,
    category: 'breakfast',
    dietaryTags: ['omnivore', 'high_protein', 'keto'],
    imageQuery: 'veggie scramble eggs',
  },
  {
    id: 'r-green-smoothie',
    name: 'Super Green Protein Smoothie',
    description: 'Nutrient-dense smoothie with spinach, banana, protein, and almond butter.',
    ingredients: ['Spinach 60g', 'Banana 1 medium', 'Whey/Plant protein 30g', 'Almond butter 15g', 'Almond milk 250ml', 'Ice cubes'],
    instructions: ['Add all ingredients to a blender.', 'Blend on high until smooth.', 'Pour and enjoy immediately.'],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    caloriesPerServing: 410,
    proteinG: 35,
    carbsG: 42,
    fatG: 14,
    fiberG: 7,
    category: 'breakfast',
    dietaryTags: ['omnivore', 'vegetarian', 'vegan', 'high_protein'],
    imageQuery: 'green protein smoothie',
  },
  {
    id: 'r-tofu-scramble',
    name: 'Vegan Tofu Scramble',
    description: 'Plant-based scramble with turmeric, nutritional yeast, and colorful vegetables.',
    ingredients: ['Firm tofu 200g', 'Turmeric 1 tsp', 'Nutritional yeast 15g', 'Bell pepper 50g', 'Red onion 30g', 'Kale 50g', 'Olive oil 1 tsp'],
    instructions: ['Press and crumble tofu.', 'Sauté onion and pepper in oil.', 'Add tofu, turmeric, nutritional yeast.', 'Fold in kale until wilted. Season and serve.'],
    prepTime: 10,
    cookTime: 10,
    servings: 1,
    caloriesPerServing: 350,
    proteinG: 28,
    carbsG: 18,
    fatG: 20,
    fiberG: 6,
    category: 'breakfast',
    dietaryTags: ['vegan', 'vegetarian', 'high_protein'],
    imageQuery: 'tofu scramble',
  },

  // LUNCH
  {
    id: 'r-chicken-bowl',
    name: 'Mediterranean Chicken Power Bowl',
    description: 'Grilled chicken breast with quinoa, roasted vegetables, hummus, and feta.',
    ingredients: ['Chicken breast 150g', 'Quinoa (cooked) 150g', 'Cucumber 80g', 'Cherry tomatoes 100g', 'Hummus 40g', 'Feta cheese 30g', 'Olive oil 1 tbsp', 'Lemon juice'],
    instructions: ['Season chicken with salt, pepper, oregano. Grill 6 min per side.', 'Cook quinoa according to package.', 'Chop cucumber and halve tomatoes.', 'Assemble bowl: quinoa base, sliced chicken, veggies, hummus, feta.', 'Drizzle olive oil and lemon.'],
    prepTime: 15,
    cookTime: 20,
    servings: 1,
    caloriesPerServing: 620,
    proteinG: 48,
    carbsG: 45,
    fatG: 26,
    fiberG: 8,
    category: 'lunch',
    dietaryTags: ['omnivore', 'high_protein'],
    imageQuery: 'mediterranean chicken bowl',
  },
  {
    id: 'r-tuna-wrap',
    name: 'Protein Tuna Wrap',
    description: 'Quick high-protein tuna salad wrap with Greek yogurt, celery, and spinach.',
    ingredients: ['Canned tuna (in water) 150g', 'Greek yogurt 40g', 'Celery 30g', 'Red onion 20g', 'Whole wheat wrap 1 large', 'Spinach 30g', 'Dijon mustard 1 tsp'],
    instructions: ['Drain tuna and flake into bowl.', 'Mix with yogurt, diced celery, onion, mustard.', 'Warm wrap, layer spinach, top with tuna mix.', 'Roll tightly, slice in half.'],
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    caloriesPerServing: 430,
    proteinG: 40,
    carbsG: 35,
    fatG: 12,
    fiberG: 5,
    category: 'lunch',
    dietaryTags: ['omnivore', 'high_protein'],
    imageQuery: 'healthy tuna wrap',
  },
  {
    id: 'r-buddha-bowl',
    name: 'Vegan Buddha Bowl',
    description: 'Colorful bowl with roasted sweet potato, chickpeas, avocado, and tahini dressing.',
    ingredients: ['Sweet potato 150g', 'Chickpeas (canned) 120g', 'Avocado 60g', 'Kale 50g', 'Quinoa (cooked) 100g', 'Tahini 15g', 'Lemon juice', 'Paprika'],
    instructions: ['Cube sweet potato, toss with paprika, roast at 200°C for 25 min.', 'Rinse chickpeas, roast alongside for 15 min.', 'Massage kale with olive oil.', 'Assemble: quinoa, kale, sweet potato, chickpeas, sliced avocado.', 'Drizzle tahini-lemon dressing.'],
    prepTime: 15,
    cookTime: 25,
    servings: 1,
    caloriesPerServing: 580,
    proteinG: 22,
    carbsG: 72,
    fatG: 24,
    fiberG: 16,
    category: 'lunch',
    dietaryTags: ['vegan', 'vegetarian'],
    imageQuery: 'buddha bowl vegan',
  },
  {
    id: 'r-salmon-salad',
    name: 'Asian Salmon Salad',
    description: 'Seared salmon fillet on a bed of mixed greens with sesame-ginger dressing.',
    ingredients: ['Salmon fillet 150g', 'Mixed greens 80g', 'Edamame 60g', 'Carrot (shredded) 40g', 'Sesame oil 1 tsp', 'Soy sauce 1 tbsp', 'Ginger (grated) 1 tsp', 'Sesame seeds'],
    instructions: ['Season salmon, sear skin-side down 4 min, flip 3 min.', 'Mix dressing: soy sauce, sesame oil, ginger.', 'Toss greens, edamame, carrot with half dressing.', 'Top with salmon, drizzle remaining dressing, sprinkle sesame seeds.'],
    prepTime: 10,
    cookTime: 10,
    servings: 1,
    caloriesPerServing: 480,
    proteinG: 38,
    carbsG: 16,
    fatG: 28,
    fiberG: 6,
    category: 'lunch',
    dietaryTags: ['omnivore', 'keto'],
    imageQuery: 'asian salmon salad',
  },

  // DINNER
  {
    id: 'r-steak-sweetpotato',
    name: 'Lean Steak with Sweet Potato & Broccoli',
    description: 'Perfect post-workout meal: lean sirloin, roasted sweet potato, and steamed broccoli.',
    ingredients: ['Sirloin steak 200g', 'Sweet potato 200g', 'Broccoli 150g', 'Olive oil 1 tbsp', 'Garlic 2 cloves', 'Rosemary'],
    instructions: ['Cube sweet potato, toss with oil and rosemary, roast at 200°C for 30 min.', 'Steam broccoli for 5 min.', 'Season steak with salt, pepper, garlic. Grill 4 min per side for medium.', 'Rest steak 5 min, slice, serve with sides.'],
    prepTime: 10,
    cookTime: 30,
    servings: 1,
    caloriesPerServing: 650,
    proteinG: 55,
    carbsG: 48,
    fatG: 22,
    fiberG: 8,
    category: 'dinner',
    dietaryTags: ['omnivore', 'high_protein'],
    imageQuery: 'steak sweet potato broccoli',
  },
  {
    id: 'r-turkey-meatballs',
    name: 'Turkey Meatballs with Zucchini Noodles',
    description: 'Lean turkey meatballs in marinara sauce over spiralized zucchini noodles.',
    ingredients: ['Ground turkey (lean) 200g', 'Zucchini 2 medium', 'Marinara sauce 120ml', 'Parmesan 20g', 'Egg 1', 'Garlic 3 cloves', 'Italian herbs'],
    instructions: ['Mix turkey with egg, garlic, herbs. Form 8-10 meatballs.', 'Bake meatballs at 200°C for 18 min.', 'Spiralize zucchini, sauté 2 min in pan.', 'Heat marinara, add meatballs, serve over zucchini noodles.', 'Top with parmesan.'],
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    caloriesPerServing: 380,
    proteinG: 34,
    carbsG: 14,
    fatG: 20,
    fiberG: 4,
    category: 'dinner',
    dietaryTags: ['omnivore', 'high_protein', 'keto'],
    imageQuery: 'turkey meatballs zucchini noodles',
  },
  {
    id: 'r-lentil-curry',
    name: 'Hearty Red Lentil Curry',
    description: 'Rich, warming plant-based curry with red lentils, coconut milk, and spinach.',
    ingredients: ['Red lentils 120g', 'Coconut milk (light) 200ml', 'Spinach 80g', 'Onion 1 medium', 'Garlic 3 cloves', 'Ginger 2 tsp', 'Curry powder 1 tbsp', 'Brown rice (cooked) 150g'],
    instructions: ['Sauté diced onion, garlic, ginger in pot for 5 min.', 'Add curry powder, stir 1 min.', 'Add lentils, coconut milk, 200ml water. Simmer 20 min.', 'Stir in spinach until wilted.', 'Serve over brown rice.'],
    prepTime: 10,
    cookTime: 25,
    servings: 2,
    caloriesPerServing: 480,
    proteinG: 22,
    carbsG: 65,
    fatG: 14,
    fiberG: 14,
    category: 'dinner',
    dietaryTags: ['vegan', 'vegetarian'],
    imageQuery: 'red lentil curry',
  },
  {
    id: 'r-shrimp-stirfry',
    name: 'Garlic Shrimp Stir-Fry',
    description: 'Quick garlic shrimp with colorful vegetables and brown rice. Ready in 15 minutes.',
    ingredients: ['Shrimp (peeled) 200g', 'Bell pepper 100g', 'Snap peas 80g', 'Carrot 60g', 'Garlic 4 cloves', 'Soy sauce 1 tbsp', 'Sesame oil 1 tsp', 'Brown rice (cooked) 150g'],
    instructions: ['Heat sesame oil in wok over high heat.', 'Sauté garlic for 30 sec.', 'Add shrimp, cook 2 min per side, remove.', 'Stir-fry veggies 3-4 min.', 'Return shrimp, add soy sauce, toss. Serve over rice.'],
    prepTime: 10,
    cookTime: 8,
    servings: 1,
    caloriesPerServing: 520,
    proteinG: 42,
    carbsG: 52,
    fatG: 12,
    fiberG: 6,
    category: 'dinner',
    dietaryTags: ['omnivore', 'high_protein'],
    imageQuery: 'garlic shrimp stir fry',
  },
  {
    id: 'r-grilled-chicken',
    name: 'Simple Grilled Chicken & Veggies',
    description: 'Perfectly grilled chicken breast with roasted mixed vegetables. Meal prep friendly.',
    ingredients: ['Chicken breast 200g', 'Bell pepper 100g', 'Zucchini 100g', 'Red onion 50g', 'Olive oil 1 tbsp', 'Mixed herbs', 'Lemon'],
    instructions: ['Season chicken with herbs, salt, pepper.', 'Grill chicken 6-7 min per side.', 'Chop veggies, toss with oil and herbs.', 'Roast veggies at 200°C for 20 min.', 'Serve with lemon wedge.'],
    prepTime: 10,
    cookTime: 25,
    servings: 1,
    caloriesPerServing: 450,
    proteinG: 50,
    carbsG: 16,
    fatG: 18,
    fiberG: 5,
    category: 'dinner',
    dietaryTags: ['omnivore', 'high_protein', 'keto'],
    imageQuery: 'grilled chicken vegetables',
  },

  // SNACKS
  {
    id: 'r-greek-yogurt',
    name: 'Greek Yogurt Protein Bowl',
    description: 'Thick Greek yogurt with granola, honey, and mixed berries. High-protein snack.',
    ingredients: ['Greek yogurt (0% fat) 200g', 'Granola 30g', 'Honey 10g', 'Mixed berries 60g', 'Chia seeds 5g'],
    instructions: ['Spoon yogurt into bowl.', 'Top with granola, berries.', 'Drizzle honey, sprinkle chia seeds.'],
    prepTime: 3,
    cookTime: 0,
    servings: 1,
    caloriesPerServing: 310,
    proteinG: 24,
    carbsG: 38,
    fatG: 6,
    fiberG: 5,
    category: 'snack',
    dietaryTags: ['omnivore', 'vegetarian', 'high_protein'],
    imageQuery: 'greek yogurt bowl berries',
  },
  {
    id: 'r-protein-balls',
    name: 'No-Bake Protein Energy Balls',
    description: 'Peanut butter, oats, and chocolate protein bites. Perfect pre-workout fuel.',
    ingredients: ['Rolled oats 80g', 'Peanut butter 60g', 'Chocolate protein powder 30g', 'Honey 20g', 'Dark chocolate chips 20g'],
    instructions: ['Mix all ingredients in a bowl until combined.', 'Roll into 8-10 balls.', 'Refrigerate 30 min before eating.', 'Store in fridge up to a week.'],
    prepTime: 10,
    cookTime: 0,
    servings: 4,
    caloriesPerServing: 210,
    proteinG: 14,
    carbsG: 22,
    fatG: 9,
    fiberG: 3,
    category: 'snack',
    dietaryTags: ['omnivore', 'vegetarian', 'high_protein'],
    imageQuery: 'protein energy balls',
  },
  {
    id: 'r-hummus-veggies',
    name: 'Hummus & Veggie Sticks',
    description: 'Classic hummus with crunchy carrot, cucumber, and bell pepper sticks.',
    ingredients: ['Hummus 80g', 'Carrot 80g', 'Cucumber 80g', 'Bell pepper 60g', 'Paprika sprinkle'],
    instructions: ['Cut vegetables into sticks.', 'Spoon hummus into a bowl.', 'Sprinkle paprika on hummus.', 'Arrange veggies around hummus.'],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    caloriesPerServing: 250,
    proteinG: 10,
    carbsG: 28,
    fatG: 12,
    fiberG: 8,
    category: 'snack',
    dietaryTags: ['vegan', 'vegetarian'],
    imageQuery: 'hummus vegetable sticks',
  },
  {
    id: 'r-rice-cakes',
    name: 'Rice Cakes with Avocado & Egg',
    description: 'Crunchy rice cakes topped with mashed avocado and a perfectly boiled egg.',
    ingredients: ['Rice cakes 2', 'Avocado 60g', 'Egg 1 large', 'Everything bagel seasoning', 'Red pepper flakes'],
    instructions: ['Hard-boil egg (8 min), peel and slice.', 'Mash avocado, spread on rice cakes.', 'Top with egg slices.', 'Season with everything bagel and red pepper flakes.'],
    prepTime: 5,
    cookTime: 10,
    servings: 1,
    caloriesPerServing: 290,
    proteinG: 12,
    carbsG: 28,
    fatG: 16,
    fiberG: 6,
    category: 'snack',
    dietaryTags: ['omnivore', 'vegetarian'],
    imageQuery: 'rice cakes avocado egg',
  },
];

export function getRecipesByCategory(category: Recipe['category']): Recipe[] {
  return RECIPES.filter((r) => r.category === category);
}

export function getRecipesByDiet(
  preference: DietaryPreference,
  excludeCategories?: Recipe['category'][]
): Recipe[] {
  let recipes = RECIPES.filter((r) => r.dietaryTags.includes(preference));
  if (excludeCategories) {
    recipes = recipes.filter((r) => !excludeCategories.includes(r.category));
  }
  return recipes;
}

export function suggestRecipesForMacros(
  remainingCalories: number,
  remainingProtein: number,
  remainingCarbs: number,
  remainingFat: number,
  dietaryPreference: DietaryPreference,
  topK = 5
): Recipe[] {
  const eligible = RECIPES.filter((r) => r.dietaryTags.includes(dietaryPreference));

  const scored = eligible.map((r) => {
    const calScore = 1 - Math.abs(r.caloriesPerServing - remainingCalories) / Math.max(remainingCalories, 1);
    const proteinScore = 1 - Math.abs(r.proteinG - remainingProtein) / Math.max(remainingProtein, 1);
    const carbScore = remainingCarbs > 0
      ? 1 - Math.abs(r.carbsG - remainingCarbs) / Math.max(remainingCarbs, 1)
      : -1;
    const fatScore = remainingFat > 0
      ? 1 - Math.abs(r.fatG - remainingFat) / Math.max(remainingFat, 1)
      : -1;

    const totalScore = calScore * 0.4 + proteinScore * 0.3 + carbScore * 0.15 + fatScore * 0.15;
    return { recipe: r, score: totalScore };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.recipe);
}

export function getRecipeById(id: string): Recipe | undefined {
  return RECIPES.find((r) => r.id === id);
}

import type { Food } from '@/src/types';

export function recipeToFood(recipe: Recipe): Food {
  return {
    id: recipe.id,
    name: recipe.name,
    serving_name: '1 serving',
    calories_per_serving: recipe.caloriesPerServing,
    protein_g: recipe.proteinG,
    carbs_g: recipe.carbsG,
    fat_g: recipe.fatG,
    fiber_g: recipe.fiberG,
    is_verified: false,
    is_aurabiosens: false,
    source: 'aurashape_recipes',
  };
}
