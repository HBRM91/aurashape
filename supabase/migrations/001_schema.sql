-- Aurashape Database Schema
-- Project: gfolypnclohpeqhaufhl (eu-central-1, Frankfurt)
-- Run this in the Supabase SQL Editor

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PUBLIC TABLES
-- ============================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  sex TEXT,
  date_of_birth DATE,
  height_cm NUMERIC,
  target_weight_kg NUMERIC,
  unit_system TEXT DEFAULT 'metric',
  goal TEXT,
  activity_level TEXT,
  dietary_preference TEXT,
  calorie_target INTEGER,
  protein_target_g INTEGER,
  carbs_target_g INTEGER,
  fat_target_g INTEGER,
  water_target_ml INTEGER DEFAULT 2000,
  fasting_plan TEXT,
  newsletter_opt_in BOOLEAN DEFAULT false,
  analytics_opt_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Diary entries (food logging)
CREATE TABLE IF NOT EXISTS public.diary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id TEXT,
  food_name TEXT NOT NULL,
  food_brand TEXT,
  meal_slot TEXT NOT NULL CHECK (meal_slot IN ('breakfast', 'lunch', 'dinner', 'snack')),
  servings NUMERIC DEFAULT 1,
  calories_per_serving NUMERIC DEFAULT 0,
  protein_g NUMERIC DEFAULT 0,
  carbs_g NUMERIC DEFAULT 0,
  fat_g NUMERIC DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_diary_entries_user_date ON public.diary_entries(user_id, date);

-- Custom foods
CREATE TABLE IF NOT EXISTS public.custom_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  serving_name TEXT DEFAULT 'serving',
  serving_size_g NUMERIC,
  calories_per_serving NUMERIC NOT NULL DEFAULT 0,
  protein_g NUMERIC DEFAULT 0,
  carbs_g NUMERIC DEFAULT 0,
  fat_g NUMERIC DEFAULT 0,
  fiber_g NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fasting sessions
CREATE TABLE IF NOT EXISTS public.fasting_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  target_hours NUMERIC NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workout sessions
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  total_volume NUMERIC DEFAULT 0,
  exercises_data JSONB,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workout personal records
CREATE TABLE IF NOT EXISTS public.personal_records (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  weight_kg NUMERIC NOT NULL,
  reps INTEGER NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, exercise_id)
);

-- Weight entries
CREATE TABLE IF NOT EXISTS public.weight_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg NUMERIC NOT NULL,
  body_fat_pct NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_weight_entries_user_date ON public.weight_entries(user_id, date);

-- Body measurements
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  neck_cm NUMERIC,
  shoulders_cm NUMERIC,
  chest_cm NUMERIC,
  waist_cm NUMERIC,
  hips_cm NUMERIC,
  left_arm_cm NUMERIC,
  right_arm_cm NUMERIC,
  left_thigh_cm NUMERIC,
  right_thigh_cm NUMERIC,
  left_calf_cm NUMERIC,
  right_calf_cm NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cycle entries
CREATE TABLE IF NOT EXISTS public.cycle_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  cycle_length INTEGER,
  period_length INTEGER,
  symptoms TEXT[],
  flow_level TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Meditation sessions
CREATE TABLE IF NOT EXISTS public.meditation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  completed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Water & habits
CREATE TABLE IF NOT EXISTS public.water_tracking (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  water_ml INTEGER DEFAULT 0,
  fruit_count INTEGER DEFAULT 0,
  veg_count INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- Community threads
CREATE TABLE IF NOT EXISTS public.community_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Thread replies
CREATE TABLE IF NOT EXISTS public.thread_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES public.community_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.thread_replies(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Submitted recipes
CREATE TABLE IF NOT EXISTS public.submitted_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  ingredients TEXT[],
  instructions TEXT[],
  prep_time INTEGER DEFAULT 0,
  cook_time INTEGER DEFAULT 0,
  servings INTEGER DEFAULT 1,
  calories_per_serving INTEGER DEFAULT 0,
  protein_g INTEGER DEFAULT 0,
  carbs_g INTEGER DEFAULT 0,
  fat_g INTEGER DEFAULT 0,
  tags TEXT[],
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Challenge participants
CREATE TABLE IF NOT EXISTS public.challenge_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  progress INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, challenge_id)
);

-- Achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Comments on tips and articles
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content_key TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('tip', 'article')),
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Privacy consent
CREATE TABLE IF NOT EXISTS public.user_consents (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  privacy_policy_accepted BOOLEAN DEFAULT false,
  newsletter_opt_in BOOLEAN DEFAULT false,
  analytics_opt_in BOOLEAN DEFAULT false,
  accepted_at TIMESTAMPTZ DEFAULT now()
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS public.notification_prefs (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  fasting_reminders BOOLEAN DEFAULT true,
  cycle_reminders BOOLEAN DEFAULT true,
  meditation_reminder BOOLEAN DEFAULT false,
  meditation_time TEXT DEFAULT '08:00',
  meal_reminders BOOLEAN DEFAULT false,
  breakfast_time TEXT DEFAULT '08:00',
  lunch_time TEXT DEFAULT '12:00',
  dinner_time TEXT DEFAULT '19:00',
  weekly_tips BOOLEAN DEFAULT true,
  expo_push_token TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES
  ('progress-photos', 'progress-photos', false),
  ('recipe-photos', 'recipe-photos', true),
  ('avatars', 'avatars', true),
  ('exercise-gifs', 'exercise-gifs', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Profiles: users read all profiles, can only update their own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Diary entries: users can only CRUD their own
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own diary entries" ON public.diary_entries
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Custom foods: users can only see/manage their own
ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own custom foods" ON public.custom_foods
  FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Custom foods are readable by all" ON public.custom_foods
  FOR SELECT TO authenticated USING (true);

-- Fasting sessions
ALTER TABLE public.fasting_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own fasting sessions" ON public.fasting_sessions
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Workouts
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own workouts" ON public.workouts
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Personal records
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own PRs" ON public.personal_records
  FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "PRs are viewable by all" ON public.personal_records
  FOR SELECT TO authenticated USING (true);

-- Weight entries
ALTER TABLE public.weight_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own weight entries" ON public.weight_entries
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Body measurements
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own measurements" ON public.body_measurements
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Cycle entries
ALTER TABLE public.cycle_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own cycle entries" ON public.cycle_entries
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Meditation sessions
ALTER TABLE public.meditation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own meditation sessions" ON public.meditation_sessions
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Water tracking
ALTER TABLE public.water_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own water tracking" ON public.water_tracking
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Community threads: all can read, users can CRUD own
ALTER TABLE public.community_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Threads are viewable by all" ON public.community_threads
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own threads" ON public.community_threads
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Thread replies: all can read, users can CRUD own
ALTER TABLE public.thread_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Replies are viewable by all" ON public.thread_replies
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own replies" ON public.thread_replies
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Submitted recipes: all can read, users can CRUD own
ALTER TABLE public.submitted_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recipes are viewable by all" ON public.submitted_recipes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own recipes" ON public.submitted_recipes
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Challenge progress
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenge progress viewable by all" ON public.challenge_progress
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own challenge progress" ON public.challenge_progress
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements viewable by all" ON public.user_achievements
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own achievements" ON public.user_achievements
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Comments: all can read, users can manage own
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by all" ON public.comments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own comments" ON public.comments
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- User consents
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own consents" ON public.user_consents
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Notification prefs
ALTER TABLE public.notification_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notification prefs" ON public.notification_prefs
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Storage RLS
CREATE POLICY "Users can manage own photos" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can read recipe photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'recipe-photos');

CREATE POLICY "Users can upload recipe photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'recipe-photos');

CREATE POLICY "Anyone can read avatars" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can read exercise gifs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'exercise-gifs');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Delete user data (used by delete account)
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
