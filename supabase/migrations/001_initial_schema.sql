-- Aurashape Database Schema
-- Supabase Migration v1.0 — Sprint 0
-- EU Region (Frankfurt)

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  sex TEXT CHECK (sex IN ('male', 'female', 'other', 'prefer_not_to_say')),
  date_of_birth DATE,
  height_cm DECIMAL,
  unit_system TEXT DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
  goal TEXT CHECK (goal IN ('lose_weight', 'build_muscle', 'maintain', 'improve_health')),
  activity_level TEXT CHECK (activity_level IN ('lightly_active', 'moderately_active', 'active', 'very_active')),
  dietary_preference TEXT CHECK (dietary_preference IN ('omnivore', 'vegetarian', 'vegan', 'keto', 'high_protein')),
  calorie_target INT,
  protein_target_g INT,
  carbs_target_g INT,
  fat_target_g INT,
  fasting_plan TEXT DEFAULT '16:8',
  custom_fasting_hours INT,
  water_target_ml INT DEFAULT 2000,
  newsletter_opt_in BOOLEAN DEFAULT false,
  analytics_opt_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- USER CONSENTS (GDPR audit trail)
-- ============================================================
CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('privacy_policy', 'tos', 'newsletter', 'analytics')),
  consented BOOLEAN NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FOODS
-- ============================================================
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  barcode TEXT UNIQUE,
  serving_size_g DECIMAL,
  serving_name TEXT DEFAULT 'serving',
  calories_per_serving DECIMAL NOT NULL,
  protein_g DECIMAL DEFAULT 0,
  carbs_g DECIMAL DEFAULT 0,
  fat_g DECIMAL DEFAULT 0,
  fiber_g DECIMAL DEFAULT 0,
  sugar_g DECIMAL DEFAULT 0,
  saturated_fat_g DECIMAL DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_aurabiosens BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'user_submitted' CHECK (source IN ('open_food_facts', 'user_submitted', 'curated')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_foods_name ON foods USING gin (name gin_trgm_ops);
CREATE INDEX idx_foods_barcode ON foods(barcode);

-- ============================================================
-- DIARY ENTRIES
-- ============================================================
CREATE TABLE diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
  custom_food_name TEXT,
  custom_food_macros JSONB,
  meal_slot TEXT NOT NULL CHECK (meal_slot IN ('breakfast', 'lunch', 'dinner', 'snack')),
  servings DECIMAL NOT NULL DEFAULT 1,
  date DATE NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_diary_user_date ON diary_entries(user_id, date);

-- ============================================================
-- FASTING SESSIONS
-- ============================================================
CREATE TABLE fasting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  planned_duration_minutes INT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('14:10', '16:8', '18:6', '20:4', '5:2', '6:1', 'custom')),
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fasting_user ON fasting_sessions(user_id, started_at);

-- ============================================================
-- WORKOUTS
-- ============================================================
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INT,
  calories_burned_est DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workouts_user ON workouts(user_id, started_at);

CREATE TABLE workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  set_number INT NOT NULL,
  weight_kg DECIMAL,
  reps INT,
  rpe INT CHECK (rpe >= 1 AND rpe <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sets_workout ON workout_sets(workout_id);

-- ============================================================
-- BODY MEASUREMENTS
-- ============================================================
CREATE TABLE body_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg DECIMAL,
  body_fat_pct DECIMAL,
  neck_cm DECIMAL,
  shoulder_cm DECIMAL,
  chest_cm DECIMAL,
  waist_cm DECIMAL,
  hip_cm DECIMAL,
  arm_left_cm DECIMAL,
  arm_right_cm DECIMAL,
  thigh_left_cm DECIMAL,
  thigh_right_cm DECIMAL,
  calf_left_cm DECIMAL,
  calf_right_cm DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_body_user_date ON body_logs(user_id, date);

-- ============================================================
-- PROGRESS PHOTOS
-- ============================================================
CREATE TABLE progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  photo_date DATE NOT NULL,
  pose TEXT NOT NULL CHECK (pose IN ('front', 'side', 'back')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXERCISE LIBRARY (curated, pre-loaded)
-- ============================================================
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('bodyweight', 'dumbbell', 'barbell', 'cardio', 'stretching')),
  muscle_group TEXT NOT NULL CHECK (muscle_group IN ('chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'full_body')),
  equipment TEXT,
  difficulty INT DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 3),
  instructions TEXT,
  gif_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DAILY SCIENCE TIPS
-- ============================================================
CREATE TABLE daily_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food_hack', 'health_hack', 'fasting_science')),
  study_title TEXT,
  study_authors TEXT,
  study_journal TEXT,
  study_year INT,
  study_summary TEXT,
  study_url TEXT,
  active BOOLEAN DEFAULT true,
  display_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ARTICLES
-- ============================================================
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  body_markdown TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food_hack', 'health_hack', 'fasting_science', 'general')),
  read_time_min INT,
  cover_image_url TEXT,
  author TEXT DEFAULT 'Aurashape Team',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMMUNITY: FORUM
-- ============================================================
CREATE TABLE forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  category TEXT NOT NULL CHECK (category IN ('fasting', 'workouts', 'nutrition', 'progress_stories', 'off_topic')),
  image_url TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  reply_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_threads_category ON forum_threads(category, created_at DESC);

CREATE TABLE forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMMUNITY: CHALLENGES
-- ============================================================
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rules TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('tracking_streak', 'fasting', 'workout_frequency', 'protein_goal', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  participant_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  progress_pct DECIMAL DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- ============================================================
-- COMMUNITY: RECIPES
-- ============================================================
CREATE TABLE community_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  ingredients JSONB NOT NULL,
  instructions TEXT NOT NULL,
  prep_time_min INT,
  cook_time_min INT,
  servings INT DEFAULT 1,
  total_calories DECIMAL,
  total_protein_g DECIMAL,
  total_carbs_g DECIMAL,
  total_fat_g DECIMAL,
  tags TEXT[],
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER FAVORITES
-- ============================================================
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES community_recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (food_id IS NOT NULL OR recipe_id IS NOT NULL),
  UNIQUE(user_id, food_id),
  UNIQUE(user_id, recipe_id)
);

-- ============================================================
-- STREAKS (Phase 1)
-- ============================================================
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL CHECK (streak_type IN ('logging', 'fasting', 'workout')),
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active_date DATE,
  streak_freeze_used BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

-- ============================================================
-- WORKOUT ROUTINES (Phase 1)
-- ============================================================
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  exercises JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_own_profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Consents
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_own_consents" ON user_consents FOR SELECT USING (auth.uid() = user_id);

-- Foods
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all_foods" ON foods FOR SELECT USING (true);
CREATE POLICY "create_foods" ON foods FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "update_own_foods" ON foods FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "delete_own_foods" ON foods FOR DELETE USING (auth.uid() = created_by);

-- Diary
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crud_own_diary" ON diary_entries FOR ALL USING (auth.uid() = user_id);

-- Fasting
ALTER TABLE fasting_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crud_own_fasting" ON fasting_sessions FOR ALL USING (auth.uid() = user_id);

-- Workouts
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crud_own_workouts" ON workouts FOR ALL USING (auth.uid() = user_id);

ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crud_own_sets" ON workout_sets FOR ALL USING (
  EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_sets.workout_id AND workouts.user_id = auth.uid())
);

-- Body logs
ALTER TABLE body_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crud_own_body_logs" ON body_logs FOR ALL USING (auth.uid() = user_id);

-- Progress photos
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crud_own_photos" ON progress_photos FOR ALL USING (auth.uid() = user_id);

-- Exercises (public read-only)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all_exercises" ON exercises FOR SELECT USING (true);

-- Daily tips (public read-only)
ALTER TABLE daily_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all_tips" ON daily_tips FOR SELECT USING (true);

-- Articles (public read-only)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all_articles" ON articles FOR SELECT USING (true);

-- Forum
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all_threads" ON forum_threads FOR SELECT USING (true);
CREATE POLICY "create_threads" ON forum_threads FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "update_own_threads" ON forum_threads FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "delete_own_threads" ON forum_threads FOR DELETE USING (auth.uid() = author_id);

ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all_replies" ON forum_replies FOR SELECT USING (true);
CREATE POLICY "create_replies" ON forum_replies FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "update_own_replies" ON forum_replies FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "delete_own_replies" ON forum_replies FOR DELETE USING (auth.uid() = author_id);

-- Challenges
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all_challenges" ON challenges FOR SELECT USING (true);

ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all_participants" ON challenge_participants FOR SELECT USING (true);
CREATE POLICY "join_challenges" ON challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Recipes
ALTER TABLE community_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all_recipes" ON community_recipes FOR SELECT USING (true);
CREATE POLICY "create_recipes" ON community_recipes FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "update_own_recipes" ON community_recipes FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "delete_own_recipes" ON community_recipes FOR DELETE USING (auth.uid() = author_id);

-- Favorites
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crud_own_favorites" ON user_favorites FOR ALL USING (auth.uid() = user_id);

-- Streaks
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_own_streaks" ON streaks FOR SELECT USING (auth.uid() = user_id);

-- Routines
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crud_own_routines" ON routines FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('progress_photos', 'progress_photos', false)
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "upload_own_photos" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'progress_photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "view_own_photos" ON storage.objects FOR SELECT
  USING (bucket_id = 'progress_photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "delete_own_photos" ON storage.objects FOR DELETE
  USING (bucket_id = 'progress_photos' AND (storage.foldername(name))[1] = auth.uid()::text);

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "upload_avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "view_avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

INSERT INTO storage.buckets (id, name, public) VALUES ('content', 'content', true)
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "view_content" ON storage.objects FOR SELECT USING (bucket_id = 'content');

INSERT INTO storage.buckets (id, name, public) VALUES ('recipe_photos', 'recipe_photos', true)
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "upload_recipe_photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'recipe_photos');
CREATE POLICY "view_recipe_photos" ON storage.objects FOR SELECT USING (bucket_id = 'recipe_photos');
