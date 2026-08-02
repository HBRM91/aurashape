import type { ExerciseCategory, MuscleGroup } from '@/src/types';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroup: MuscleGroup;
  difficulty: 1 | 2 | 3;
  instructions?: string;
  tips?: string;
}

export const EXERCISES: Exercise[] = [
  // Bodyweight (35)
  { id: 'bw-pushups', name: 'Push-ups', category: 'bodyweight', muscleGroup: 'chest', difficulty: 1 },
  { id: 'bw-diamond-pushups', name: 'Diamond Push-ups', category: 'bodyweight', muscleGroup: 'triceps', difficulty: 2 },
  { id: 'bw-wide-pushups', name: 'Wide Push-ups', category: 'bodyweight', muscleGroup: 'chest', difficulty: 1 },
  { id: 'bw-decline-pushups', name: 'Decline Push-ups', category: 'bodyweight', muscleGroup: 'chest', difficulty: 2 },
  { id: 'bw-pike-pushups', name: 'Pike Push-ups', category: 'bodyweight', muscleGroup: 'shoulders', difficulty: 3 },
  { id: 'bw-pullups', name: 'Pull-ups', category: 'bodyweight', muscleGroup: 'back', difficulty: 2 },
  { id: 'bw-chinups', name: 'Chin-ups', category: 'bodyweight', muscleGroup: 'biceps', difficulty: 2 },
  { id: 'bw-squats', name: 'Bodyweight Squats', category: 'bodyweight', muscleGroup: 'legs', difficulty: 1 },
  { id: 'bw-jump-squats', name: 'Jump Squats', category: 'bodyweight', muscleGroup: 'legs', difficulty: 2 },
  { id: 'bw-bulgarian-split', name: 'Bulgarian Split Squats', category: 'bodyweight', muscleGroup: 'legs', difficulty: 2 },
  { id: 'bw-lunges', name: 'Lunges', category: 'bodyweight', muscleGroup: 'legs', difficulty: 1 },
  { id: 'bw-walking-lunges', name: 'Walking Lunges', category: 'bodyweight', muscleGroup: 'legs', difficulty: 1 },
  { id: 'bw-jumping-lunges', name: 'Jumping Lunges', category: 'bodyweight', muscleGroup: 'legs', difficulty: 3 },
  { id: 'bw-glute-bridges', name: 'Glute Bridges', category: 'bodyweight', muscleGroup: 'legs', difficulty: 1 },
  { id: 'bw-single-leg-bridges', name: 'Single-Leg Glute Bridges', category: 'bodyweight', muscleGroup: 'legs', difficulty: 2 },
  { id: 'bw-plank', name: 'Plank', category: 'bodyweight', muscleGroup: 'core', difficulty: 1 },
  { id: 'bw-side-plank', name: 'Side Plank', category: 'bodyweight', muscleGroup: 'core', difficulty: 1 },
  { id: 'bw-mountain-climbers', name: 'Mountain Climbers', category: 'bodyweight', muscleGroup: 'core', difficulty: 1 },
  { id: 'bw-burpees', name: 'Burpees', category: 'bodyweight', muscleGroup: 'full_body', difficulty: 3 },
  { id: 'bw-crunches', name: 'Crunches', category: 'bodyweight', muscleGroup: 'core', difficulty: 1 },
  { id: 'bw-bicycle-crunches', name: 'Bicycle Crunches', category: 'bodyweight', muscleGroup: 'core', difficulty: 2 },
  { id: 'bw-leg-raises', name: 'Leg Raises', category: 'bodyweight', muscleGroup: 'core', difficulty: 2 },
  { id: 'bw-flutter-kicks', name: 'Flutter Kicks', category: 'bodyweight', muscleGroup: 'core', difficulty: 1 },
  { id: 'bw-russian-twists', name: 'Russian Twists', category: 'bodyweight', muscleGroup: 'core', difficulty: 2 },
  { id: 'bw-hollow-body', name: 'Hollow Body Hold', category: 'bodyweight', muscleGroup: 'core', difficulty: 3 },
  { id: 'bw-superman', name: 'Superman', category: 'bodyweight', muscleGroup: 'back', difficulty: 1 },
  { id: 'bw-dips', name: 'Dips', category: 'bodyweight', muscleGroup: 'triceps', difficulty: 2 },
  { id: 'bw-step-ups', name: 'Step-ups', category: 'bodyweight', muscleGroup: 'legs', difficulty: 1 },
  { id: 'bw-box-jumps', name: 'Box Jumps', category: 'bodyweight', muscleGroup: 'legs', difficulty: 2 },
  { id: 'bw-wall-sit', name: 'Wall Sit', category: 'bodyweight', muscleGroup: 'legs', difficulty: 2 },
  { id: 'bw-bear-crawl', name: 'Bear Crawl', category: 'bodyweight', muscleGroup: 'full_body', difficulty: 2 },
  { id: 'bw-inchworms', name: 'Inchworms', category: 'bodyweight', muscleGroup: 'full_body', difficulty: 1 },
  { id: 'bw-high-knees', name: 'High Knees', category: 'bodyweight', muscleGroup: 'full_body', difficulty: 1 },
  { id: 'bw-butt-kicks', name: 'Butt Kicks', category: 'bodyweight', muscleGroup: 'legs', difficulty: 1 },
  { id: 'bw-jumping-jacks', name: 'Jumping Jacks', category: 'bodyweight', muscleGroup: 'full_body', difficulty: 1 },

  // Dumbbell (25)
  { id: 'db-bench-press', name: 'DB Bench Press', category: 'dumbbell', muscleGroup: 'chest', difficulty: 1 },
  { id: 'db-flyes', name: 'DB Flyes', category: 'dumbbell', muscleGroup: 'chest', difficulty: 2 },
  { id: 'db-shoulder-press', name: 'DB Shoulder Press', category: 'dumbbell', muscleGroup: 'shoulders', difficulty: 1 },
  { id: 'db-lateral-raises', name: 'DB Lateral Raises', category: 'dumbbell', muscleGroup: 'shoulders', difficulty: 1 },
  { id: 'db-front-raises', name: 'DB Front Raises', category: 'dumbbell', muscleGroup: 'shoulders', difficulty: 1 },
  { id: 'db-rows', name: 'DB Rows', category: 'dumbbell', muscleGroup: 'back', difficulty: 1 },
  { id: 'db-bicep-curls', name: 'DB Bicep Curls', category: 'dumbbell', muscleGroup: 'biceps', difficulty: 1 },
  { id: 'db-hammer-curls', name: 'Hammer Curls', category: 'dumbbell', muscleGroup: 'biceps', difficulty: 1 },
  { id: 'db-tricep-extensions', name: 'DB Tricep Extensions', category: 'dumbbell', muscleGroup: 'triceps', difficulty: 1 },
  { id: 'db-kickbacks', name: 'DB Kickbacks', category: 'dumbbell', muscleGroup: 'triceps', difficulty: 2 },
  { id: 'db-goblet-squats', name: 'Goblet Squats', category: 'dumbbell', muscleGroup: 'legs', difficulty: 1 },
  { id: 'db-lunges', name: 'DB Lunges', category: 'dumbbell', muscleGroup: 'legs', difficulty: 2 },
  { id: 'db-deadlifts', name: 'DB Deadlifts', category: 'dumbbell', muscleGroup: 'legs', difficulty: 1 },
  { id: 'db-rdls', name: 'DB RDLs', category: 'dumbbell', muscleGroup: 'legs', difficulty: 2 },
  { id: 'db-thrusters', name: 'DB Thrusters', category: 'dumbbell', muscleGroup: 'full_body', difficulty: 3 },
  { id: 'db-snatch', name: 'DB Snatch', category: 'dumbbell', muscleGroup: 'full_body', difficulty: 3 },
  { id: 'db-clean', name: 'DB Clean', category: 'dumbbell', muscleGroup: 'full_body', difficulty: 3 },
  { id: 'db-renegade-rows', name: 'DB Renegade Rows', category: 'dumbbell', muscleGroup: 'back', difficulty: 3 },
  { id: 'db-pullovers', name: 'DB Pullovers', category: 'dumbbell', muscleGroup: 'back', difficulty: 2 },
  { id: 'db-shrugs', name: 'DB Shrugs', category: 'dumbbell', muscleGroup: 'shoulders', difficulty: 1 },
  { id: 'db-calf-raises', name: 'DB Calf Raises', category: 'dumbbell', muscleGroup: 'legs', difficulty: 1 },
  { id: 'db-step-ups', name: 'DB Step-ups', category: 'dumbbell', muscleGroup: 'legs', difficulty: 2 },
  { id: 'db-russian-twists', name: 'DB Russian Twists', category: 'dumbbell', muscleGroup: 'core', difficulty: 2 },
  { id: 'db-woodchoppers', name: 'DB Woodchoppers', category: 'dumbbell', muscleGroup: 'core', difficulty: 2 },
  { id: 'db-farmers-walk', name: "DB Farmer's Walk", category: 'dumbbell', muscleGroup: 'full_body', difficulty: 1 },

  // Barbell (15)
  { id: 'bb-squat', name: 'BB Squat', category: 'barbell', muscleGroup: 'legs', difficulty: 2 },
  { id: 'bb-deadlift', name: 'BB Deadlift', category: 'barbell', muscleGroup: 'legs', difficulty: 2 },
  { id: 'bb-bench-press', name: 'BB Bench Press', category: 'barbell', muscleGroup: 'chest', difficulty: 2 },
  { id: 'bb-ohp', name: 'BB Overhead Press', category: 'barbell', muscleGroup: 'shoulders', difficulty: 2 },
  { id: 'bb-row', name: 'BB Row', category: 'barbell', muscleGroup: 'back', difficulty: 2 },
  { id: 'bb-hip-thrust', name: 'BB Hip Thrust', category: 'barbell', muscleGroup: 'legs', difficulty: 2 },
  { id: 'bb-lunge', name: 'BB Lunge', category: 'barbell', muscleGroup: 'legs', difficulty: 3 },
  { id: 'bb-rdl', name: 'BB RDL', category: 'barbell', muscleGroup: 'legs', difficulty: 2 },
  { id: 'bb-front-squat', name: 'BB Front Squat', category: 'barbell', muscleGroup: 'legs', difficulty: 3 },
  { id: 'bb-good-morning', name: 'BB Good Morning', category: 'barbell', muscleGroup: 'legs', difficulty: 3 },
  { id: 'bb-bicep-curl', name: 'BB Bicep Curl', category: 'barbell', muscleGroup: 'biceps', difficulty: 1 },
  { id: 'bb-skull-crusher', name: 'BB Skull Crusher', category: 'barbell', muscleGroup: 'triceps', difficulty: 2 },
  { id: 'bb-calf-raise', name: 'BB Calf Raise', category: 'barbell', muscleGroup: 'legs', difficulty: 1 },
  { id: 'bb-shrug', name: 'BB Shrug', category: 'barbell', muscleGroup: 'shoulders', difficulty: 1 },
  { id: 'bb-clean-press', name: 'BB Clean & Press', category: 'barbell', muscleGroup: 'full_body', difficulty: 3 },

  // Cardio (15)
  { id: 'cardio-running', name: 'Running', category: 'cardio', muscleGroup: 'full_body', difficulty: 2 },
  { id: 'cardio-cycling', name: 'Cycling', category: 'cardio', muscleGroup: 'full_body', difficulty: 1 },
  { id: 'cardio-jump-rope', name: 'Jump Rope', category: 'cardio', muscleGroup: 'full_body', difficulty: 2 },
  { id: 'cardio-rowing', name: 'Rowing', category: 'cardio', muscleGroup: 'full_body', difficulty: 2 },
  { id: 'cardio-elliptical', name: 'Elliptical', category: 'cardio', muscleGroup: 'full_body', difficulty: 1 },
  { id: 'cardio-stair-climber', name: 'Stair Climber', category: 'cardio', muscleGroup: 'legs', difficulty: 2 },
  { id: 'cardio-swimming', name: 'Swimming', category: 'cardio', muscleGroup: 'full_body', difficulty: 2 },
  { id: 'cardio-walking', name: 'Walking', category: 'cardio', muscleGroup: 'full_body', difficulty: 1 },
  { id: 'cardio-sprint-intervals', name: 'Sprint Intervals', category: 'cardio', muscleGroup: 'full_body', difficulty: 3 },
  { id: 'cardio-battle-ropes', name: 'Battle Ropes', category: 'cardio', muscleGroup: 'full_body', difficulty: 3 },
  { id: 'cardio-kettlebell-swings', name: 'Kettlebell Swings', category: 'cardio', muscleGroup: 'full_body', difficulty: 2 },
  { id: 'cardio-box-jumps', name: 'Box Jumps', category: 'cardio', muscleGroup: 'legs', difficulty: 2 },
  { id: 'cardio-burpees', name: 'Burpees', category: 'cardio', muscleGroup: 'full_body', difficulty: 3 },
  { id: 'cardio-mountain-climbers', name: 'Mountain Climbers', category: 'cardio', muscleGroup: 'core', difficulty: 1 },
  { id: 'cardio-shadow-boxing', name: 'Shadow Boxing', category: 'cardio', muscleGroup: 'full_body', difficulty: 2 },

  // Stretching (10)
  { id: 'stretch-hamstring', name: 'Hamstring Stretch', category: 'stretching', muscleGroup: 'legs', difficulty: 1 },
  { id: 'stretch-quad', name: 'Quad Stretch', category: 'stretching', muscleGroup: 'legs', difficulty: 1 },
  { id: 'stretch-hip-flexor', name: 'Hip Flexor Stretch', category: 'stretching', muscleGroup: 'legs', difficulty: 1 },
  { id: 'stretch-cat-cow', name: 'Cat-Cow', category: 'stretching', muscleGroup: 'back', difficulty: 1 },
  { id: 'stretch-childs-pose', name: "Child's Pose", category: 'stretching', muscleGroup: 'back', difficulty: 1 },
  { id: 'stretch-downward-dog', name: 'Downward Dog', category: 'stretching', muscleGroup: 'full_body', difficulty: 1 },
  { id: 'stretch-cobra', name: 'Cobra', category: 'stretching', muscleGroup: 'back', difficulty: 1 },
  { id: 'stretch-shoulder', name: 'Shoulder Stretch', category: 'stretching', muscleGroup: 'shoulders', difficulty: 1 },
  { id: 'stretch-tricep', name: 'Tricep Stretch', category: 'stretching', muscleGroup: 'triceps', difficulty: 1 },
  { id: 'stretch-butterfly', name: 'Butterfly Stretch', category: 'stretching', muscleGroup: 'legs', difficulty: 1 },
];

export const EXERCISE_INSTRUCTIONS: Record<string, { instructions: string; tips: string }> = {
  'bw-pushups': { instructions: 'Hands shoulder-width apart, body in a straight line. Lower chest to ground, elbows at 45°. Push back up explosively.', tips: 'Keep core tight. Don\'t flare elbows. Full range of motion.' },
  'bw-pullups': { instructions: 'Grip bar slightly wider than shoulders, palms facing forward. Pull chin over bar, squeeze shoulder blades. Lower with control.', tips: 'Start each rep from dead hang. Avoid kipping. Look up slightly.' },
  'bw-squats': { instructions: 'Feet shoulder-width, toes slightly out. Hinge at hips, keep chest up. Go below parallel if mobility allows. Drive through heels.', tips: 'Keep knees tracking over toes. Don\'t let heels lift. Brace core throughout.' },
  'bw-plank': { instructions: 'Forearms on ground, elbows under shoulders. Body in straight line from head to heels. Hold position without sagging.', tips: 'Squeeze glutes and quads. Don\'t hold breath. Progress by adding time or lifting a limb.' },
  'bw-burpees': { instructions: 'From standing, drop to squat, kick legs back to plank, do a push-up, jump feet forward, explode up with a jump.', tips: 'Modify by stepping back instead of jumping. Land softly on the jump. Keep a steady pace.' },
  'bw-lunges': { instructions: 'Step forward, lower back knee toward ground. Front knee at 90°, back knee hovering. Push through front heel to return.', tips: 'Keep torso upright. Don\'t let front knee go past toes. Engage core for balance.' },
  'db-bench-press': { instructions: 'Lie on bench, dumbbells at chest level. Press up until arms extended, squeeze chest. Lower with control to starting position.', tips: 'Keep wrists straight. Don\'t bounce at bottom. Full lockout at top.' },
  'db-shoulder-press': { instructions: 'Sit or stand, dumbbells at shoulder height. Press straight overhead, biceps near ears. Lower with control.', tips: 'Don\'t arch lower back excessively. Keep core tight. Full range without locking elbows hard.' },
  'db-rows': { instructions: 'Hinge at hips, back flat. Pull dumbbell to hip, squeeze shoulder blade. Lower with control.', tips: 'Keep neck neutral. Don\'t twist torso. Focus on back contraction, not arm pull.' },
  'db-bicep-curls': { instructions: 'Stand with dumbbells at sides. Curl weights up, keep elbows at sides. Squeeze at top, lower slowly.', tips: 'No swinging. Full range of motion. Twist pinkies outward at top for extra squeeze.' },
  'db-goblet-squats': { instructions: 'Hold one dumbbell vertically against chest. Squat down keeping weight close. Drive through heels to stand.', tips: 'Keep dumbbell touching chest at all times. Elbows inside knees. Deep as mobility allows.' },
  'bb-squat': { instructions: 'Bar on upper back, chest up, core braced. Squat to parallel or below. Drive through full foot to stand.', tips: 'Set safeties. Look slightly down. Big breath in before descent, exhale at top.' },
  'bb-deadlift': { instructions: 'Bar over midfoot. Hinge, grip just outside knees. Chest up, pull slack out of bar, stand by pushing floor away.', tips: 'Keep bar close to body throughout. Don\'t round lower back. Lock out with glutes, not by leaning back.' },
  'bb-bench-press': { instructions: 'Lie on bench, eyes under bar. Grip wider than shoulder width. Unrack, lower to chest, press to lockout.', tips: 'Set shoulder blades back and down. Drive feet into floor. Touch bar to lower chest.' },
  'bb-ohp': { instructions: 'Bar at collarbone, grip shoulder-width. Brace core, press straight overhead. Lock out at top, head through.', tips: 'Squeeze glutes. Don\'t lean back excessively. Lower under control.' },
  'cardio-jump-rope': { instructions: 'Rope handles at hip height. Jump with both feet, just clearing the rope. Land softly on balls of feet.', tips: 'Keep elbows close to sides. Spin rope with wrists, not arms. Stay on toes.' },
  'cardio-burpees': { instructions: 'Drop to ground, perform a push-up, jump back up with hands overhead. Full body cardio movement.', tips: 'Modify with step-backs. Breathe rhythmically. Land softly each rep.' },
};

export function getExerciseInstruction(exerciseId: string): { instructions: string; tips: string } | null {
  return EXERCISE_INSTRUCTIONS[exerciseId] || null;
}

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  bodyweight: 'Bodyweight',
  dumbbell: 'Dumbbell',
  barbell: 'Barbell',
  cardio: 'Cardio',
  stretching: 'Stretching',
};

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  legs: 'Legs',
  core: 'Core',
  full_body: 'Full Body',
};

export const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  bodyweight: '#3B82F6',
  dumbbell: '#F59E0B',
  barbell: '#EF4444',
  cardio: '#22C55E',
  stretching: '#A855F7',
};
