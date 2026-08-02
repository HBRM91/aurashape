# Sprint 1 — Food Diary Core

*Start: August 2026 | Status: Complete*

## Goal

Build the core food diary experience: meal slots, food search (Open Food Facts API), barcode scanner, custom food creator, macro dashboard, and water/habit trackers.

---

## What Was Built

### Stores
| File | Purpose |
|---|---|
| `src/stores/diary.ts` | Diary entries, food log CRUD, recent foods, date management |
| `src/stores/water.ts` | Water intake, fruit/vegetable counters per date |

### Services
| File | Purpose |
|---|---|
| `src/lib/foodApi.ts` | Open Food Facts API v2 — search by name, lookup by barcode |

### Components
| File | Purpose |
|---|---|
| `src/components/DatePickerBar.tsx` | Horizontal scrollable date picker (14 days) |
| `src/components/ProgressBars.tsx` | Calorie bar (green/yellow/red) + macro bars (protein/carbs/fat) |
| `src/components/MealSlotCard.tsx` | Meal slot card (breakfast, lunch, dinner, snacks) with entries list + swipe delete |
| `src/components/AddFoodSheet.tsx` | Slide-up sheet — search foods, scan barcode, manual add |
| `src/components/CustomFoodModal.tsx` | Form to create custom foods (name, macros, brand, serving) |
| `src/components/MacroDonut.tsx` | SVG donut chart showing macro distribution |
| `src/components/Trackers.tsx` | Water tracker ring + fruit/vegetable counters |

### Screens
| File | Purpose |
|---|---|
| `app/(tabs)/diary.tsx` | Full diary: date picker → calorie/macro bars → 4 meal slots → add food flow |
| `app/(tabs)/index.tsx` | Home dashboard: macro donut, water tracker, habits, quick actions, daily tip placeholder |
| `app/barcode.tsx` | Camera barcode scanner (EAN-13, UPC-A, EAN-8) with Open Food Facts lookup |

### Modified Files
| File | Change |
|---|---|
| `src/stores/onboarding.ts` | Added `calorieTarget`, `proteinTargetG`, `carbsTargetG`, `fatTargetG`, `setTargets()` |
| `app/onboarding/index.tsx` | Step summary now persists calculated macro targets to store |
| `src/types/index.ts` | Existing types used (no changes needed) |

---

## User Stories Covered

- **E02-F01**: Food Diary — Meal Slots ✅
- **E02-F02**: Food Search & Database ✅
- **E02-F03**: Barcode Scanner ✅
- **E02-F04**: Custom Food Creator ✅
- **E02-F05**: Macro Dashboard ✅
- **E02-F06**: Water & Habit Trackers ✅

**Points delivered: 23 of 23**
