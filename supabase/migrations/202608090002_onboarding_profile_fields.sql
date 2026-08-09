-- Profile fields used by the richer onboarding flow.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dietary_preferences TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS allergies TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS excluded_ingredients TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS fasting_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS target_weight_kg NUMERIC,
  ADD COLUMN IF NOT EXISTS weekly_change_kg NUMERIC;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_dietary_preference_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_dietary_preference_check
  CHECK (dietary_preference IS NULL OR dietary_preference = ANY (ARRAY['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'mediterranean', 'high_protein']));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_weekly_change_kg_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_weekly_change_kg_check
  CHECK (weekly_change_kg IS NULL OR (weekly_change_kg > 0 AND weekly_change_kg <= 1.5));
