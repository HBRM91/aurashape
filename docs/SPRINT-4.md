# Sprint 4 — Community Core

*Start: August 3, 2026 | Status: Complete*

## Goal

Build the core community experience: thread detail view with nested replies, challenge leaderboards, user profile viewing, recipe submission, and comment polish.

---

## What Was Built

### Stores
| File | Purpose |
|---|---|
| `src/stores/community.ts` | Expanded: thread replies (nested), recipe submissions, user profiles (5 mock profiles), upvote/downvote, reply threading |

### Screens
| File | Purpose |
|---|---|
| `app/(tabs)/community.tsx` | Full community: (1) Forum — thread list + create + detail modal with nested 3-level replies + upvote/downvote, (2) Recipes — curated list + community submissions with full form (camera, ingredients, macros, tags), (3) Challenges — 5 challenges with join/progress + leaderboard modal with ranked players + community average. UserProfileModal — tap any username for stats, bio, goal, privacy settings |

---

## User Stories Covered

- **E07-F01**: Community User Profiles ✅
- **E07-F02**: Challenge Leaderboards ✅
- **E07-F03**: Recipe Submission + Feed ✅
- **E07-F04**: Discussion Forum + Thread Detail + Nested Replies ✅
- **E07-F05**: Tip & Article Comment Polish (nested replies + likes) ✅

**Points delivered: 20 of 20**
