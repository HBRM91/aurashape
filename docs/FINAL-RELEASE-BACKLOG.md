# Aurashape Final Release Backlog

Priority: P0 blocks release, P1 required for a strong release candidate, P2 post-launch.

## P0 Release Blockers

| ID | Item | Scope | Estimate | Dependency | Acceptance |
|---|---|---|---:|---|---|
| R-001 | Rotate exposed service-role key | Revoke old key, rotate, verify history/build safety | 1-2h + owner access | Supabase owner access | Old key no longer valid and no secret in client bundles |
| R-002 | Canonical Supabase schema | Pick one migration, apply, validate tables/RLS | 1-2d | R-001, project access | Cloud signup and all core writes pass with RLS |
| R-003 | Auth production config | Email confirmation, SMTP, OAuth, redirects, CAPTCHA, password policy | 0.5-1d | Supabase dashboard | Signup/login/reset/OAuth pass in production |
| R-004 | Authenticated browser matrix | Add local/cloud/profile/theme/reload/logout coverage | 1-2d | Phase 3 UI | No route silently redirects, hangs, or loses state |
| R-005 | Full theme migration | Replace remaining fixed child styles and hardcoded surfaces | 1-2d | Phase 3 screens | Light/dark/system visual checks pass on all primary routes |
| R-006 | Accessibility gate | Keyboard/focus/labels/contrast/reduced motion | 1-2d | R-004, R-005 | No critical accessibility defects |
| R-007 | Performance gate | Bundle/render/large-list/image audit | 1-2d | Stable UI | Budgets documented and pass |
| R-008 | Legal/data controls | Public legal URLs, consent, export, deletion, AI opt-out | 0.5-1d | R-002, R-003 | Production checks pass and actions are reversible where required |

## P1 Release Candidate

| ID | Item | Scope | Estimate | Acceptance |
|---|---|---|---:|---|
| R-101 | Web Home polish | Dynamic child cards, CTA semantics, empty/loading/error states | 0.5d | Desktop/mobile Home has no fixed light surface or dead CTA |
| R-102 | Web Learn polish | Dynamic article/comment/science cards and keyboard states | 0.5d | Learn is readable in both themes |
| R-103 | Web Recipes polish | Dynamic detail/filter states, keyboard save/log controls | 0.5d | Recipe search/filter/save/log flows pass |
| R-104 | Web Community polish | Dynamic thread/reply/challenge/recipe surfaces | 1d | Community has empty/error states and no overflow |
| R-105 | Sync verification | Wire queue actions, retry, conflict policy, status indicator | 1-2d | Offline local write queues and cloud sync recovers |
| R-106 | Action analytics | Meal, fast, workout, weight, meditation, challenge events | 0.5d | Events fire without PII and are test-covered |
| R-107 | Email operations | Welcome/newsletter/unsubscribe templates and logs | 1d + provider | Email opt-in/out and delivery smoke tests pass |
| R-108 | Push operations | Credentials, token registration, deep links, preference tests | 1d + provider | Real device notification tap reaches intended route |

## B2B Release Candidate

| ID | Item | Scope | Status |
|---|---|---|---|
| B-001 | Secure organization foundation | Organizations, memberships, owner/admin/member roles, audit events, RLS | Implemented and applied remotely |
| B-002 | Employer privacy boundary | Aggregate cohort function with a minimum 10-member threshold | Implemented and applied remotely |
| B-003 | Organization web route | Responsive local/cloud organization surface with privacy copy | Implemented and deployed |

## P2 Post-Launch

| ID | Item | Scope | Estimate |
|---|---|---|---:|
| R-201 | AI food capture | Safe photo/text estimation with confirmation | 3-5d |
| R-202 | Evidence reading assistant | Cited summaries, uncertainty, offline fallback | 3-5d |
| R-203 | Weekly AI health summary | Local metrics + optional server summary | 3-5d |
| R-204 | Community maturity | Profiles, moderation, leaderboards, team challenges | 1-2w |
| R-205 | Unified streaks | Cross-feature streaks and freezes | 2-3d |
| R-206 | Health platform sync | Apple Health/Google Fit exploration and consent | 1-2w |
| R-207 | Localization | German first, translation system and QA | 1-2w |

## Manual Owner Actions

These cannot be safely completed by code alone:

- Revoke/rotate Supabase service-role credential.
- Confirm Supabase project and production schema owner.
- Attach and verify canonical domain/DNS.
- Configure Apple Developer and Google Play accounts.
- Configure Resend sending domain and SMTP.
- Configure APNs/FCM/Expo push credentials.
- Approve AI data processing, retention, opt-out, and legal language.
