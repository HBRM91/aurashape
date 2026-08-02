# Sprint 3 — Workout Tracking

*Start: August 2026 | Status: Complete*

## Goal

Build the workout tracking experience: exercise library (100+ exercises), workout logger with set tracking, workout history, and post-workout summary.

---

## What Was Built

### Stores
| File | Purpose |
|---|---|
| `src/stores/workout.ts` | Active workout session, add/remove exercises, set tracking (weight/reps), volume calculation, personal records, workout history |

### Data
| File | Purpose |
|---|---|
| `src/lib/exercises.ts` | 100 exercises across 5 categories (bodyweight, dumbbell, barbell, cardio, stretching) with 8 muscle groups |

### Screens
| File | Purpose |
|---|---|
| `app/(tabs)/workout.tsx` | Three views: (1) idle — start workout button + recent history, (2) active — exercise list with editable sets, exercise picker, timer, volume counter, (3) summary — duration, exercises, sets, total volume, per-exercise breakdown |

---

## User Stories Covered

- **E04-F01**: Exercise Library (100+ exercises, filter by category) ✅
- **E04-F02**: Workout Logger (add exercises, log sets with weight/reps, timer, volume) ✅
- **E04-F03**: Workout History & PRs (history list, personal records tracking) ✅
- **E04-F04**: Post-Workout Summary (duration, volume, exercise breakdown) ✅

**Points delivered: 18 of 18**
