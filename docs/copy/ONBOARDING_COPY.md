# Onboarding Copy — All Steps

## Privacy Consent Screen (shown before signup)

**Title**: Your data is yours. Period.

**Body**: Before we begin, here's our promise to you:

**Consent 1 (Required)**: I agree to the Privacy Policy and Terms of Service.
- Helper text: We're GDPR-compliant. Your data stays in the EU. You can export or delete everything anytime.

**Consent 2 (Optional)**: Send me weekly science-based health tips via email.
- Helper text: No spam. One email per week. Unsubscribe anytime.

**Consent 3 (Optional)**: Share anonymous usage data to help improve Aurashape.
- Helper text: We never collect personal data. Just which features you use so we can make them better.

**Footer**: By continuing, you acknowledge that Aurashape is not a medical device and does not provide medical advice.

This copy is already implemented in `app/onboarding/privacy-consent.tsx`. ✅

---

## Step 1 — Goal

**Title**: What's your goal?

**Body**: This helps us calculate your daily calorie and macro targets. You can change this anytime.

Goal cards:
- ⚖️ **Lose Weight** — We'll create a 500 kcal daily deficit based on your TDEE
- 💪 **Build Muscle** — We'll add 300 kcal surplus to support muscle growth
- 🎯 **Maintain** — Stay at your current weight with balanced macros
- 🧬 **Improve Health** — Science-backed targets for overall wellness

This copy is already implemented in the onboarding wizard. ✅

---

## Step 2 — Body Info

**Title**: Tell us about yourself

**Body**: We use the Mifflin-St Jeor equation — the most accurate BMR formula — to calculate your targets. All calculations happen on your device.

This copy is already implemented. ✅

---

## Step 3 — Activity & Diet

**Title (Activity)**: Your activity level

**Body**: How active is your daily life? This adjusts your calorie target.

Activity options:
- **Lightly Active** — Desk job, little exercise. (PAL: 1.375)
- **Moderately Active** — Exercise 3-5× per week. (PAL: 1.55)
- **Active** — Daily exercise or physical job. (PAL: 1.725)
- **Very Active** — Intense daily training or athlete. (PAL: 1.9)

**Title (Diet)**: Dietary preference

**Body**: This helps us personalize your macro targets and food recommendations.

Diet options: Omnivore, Vegetarian, Vegan, Keto, High Protein

This copy is already implemented. ✅

---

## Step 4 — Fasting (Optional)

**Title**: Intermittent fasting

**Body**: Choose a fasting plan. You can change this anytime — it's not locked in.

Plan cards:
- **14:10** (Beginner) — 14 hours fasting, 10 hours eating
- **16:8** (Recommended) — 16 hours fasting, 8 hours eating. Hits the autophagy window.
- **18:6** (Intermediate) — 18 hours fasting, 6 hours eating
- **20:4** (Advanced) — Warrior diet: 20 hours fasting, 4 hours eating
- **5:2** — Eat normally 5 days, restrict to 500-600 kcal 2 days
- **6:1** — Eat normally 6 days, fast for 1 day
- **Custom** — Set your own fasting hours

This copy is already implemented. ✅

---

## Step 5 — Summary

**Title**: Your plan summary

**Body**: Here's what we calculated based on your inputs. All targets are science-backed using the Mifflin-St Jeor equation.

**Science note**: These targets are based on peer-reviewed research. Actual results vary by individual. Adjust as needed based on how you feel.

This copy is already implemented. ✅

---

## Step 6 — Newsletter

**Title**: Stay in the loop

**Body**: Get weekly science-based health tips delivered to your inbox. One email per week. No spam. Unsubscribe anytime.

**Checkbox**: Yes, send me health tips

This copy is already implemented. ✅
