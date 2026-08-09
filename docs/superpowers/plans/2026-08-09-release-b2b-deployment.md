# Aurashape Release, B2B, and Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the current Aurashape web product with verified privacy/security controls, a minimal secure multi-tenant B2B foundation, privacy-safe employer reporting, and a repeatable Cloudflare Pages release.

**Architecture:** Keep the existing Expo Router web app and local-first data mode. Add B2B data as isolated Supabase tables with membership-based RLS; no personal health rows become employer-readable. Employer reporting uses server-side aggregate views/functions with a minimum cohort threshold. Cloudflare Pages remains the web deployment target and Supabase Edge Functions remain the only server-side provider-secret boundary.

**Tech Stack:** Expo SDK 57, Expo Router, React Native Web, NativeWind, Zustand 5, Supabase Postgres/RLS/Edge Functions, Jest 29, Playwright, Cloudflare Pages/Wrangler.

## Global Constraints

- Preserve unrelated user changes already present in the worktree; never reset or overwrite them.
- Follow Expo SDK 57 documentation and keep React Native `0.86`, React `19.2.3`, and Node `22.13+` compatibility.
- Never expose service-role, OpenAI, Resend, Cloudflare, or database credentials to Expo public variables or client bundles.
- Local privacy mode remains the default unless `EXPO_PUBLIC_DATA_MODE=cloud` is explicitly configured.
- Employer dashboards may show only aggregate metrics for cohorts with at least 10 members; no individual health data, diary entries, cycle data, weight, or AI content is exposed.
- Do not add billing, SSO, SCIM, or provider integrations without configured external accounts; represent unavailable integrations as disabled states.
- Run `npm run check` before claiming completion.

---

### Task 1: Establish release baseline and safety checks

**Files:**
- Modify: `scripts/assert-local-privacy.js`
- Create: `scripts/assert-secret-hygiene.js`
- Modify: `package.json`
- Modify: `.github/workflows/deploy-web.yml`
- Test: `scripts/assert-secret-hygiene.js` via direct Node execution

**Interfaces:**
- Produces `npm run assert:secrets`, which scans tracked source/config files for private credential values and fails closed without printing matches.
- Keeps `npm run assert:local-privacy` focused on generated web artifacts.

- [ ] **Step 1: Add failing secret-hygiene cases**

Create a temporary ignored fixture during the test command containing a service-role-shaped JWT and assert the script exits non-zero; delete the fixture after the assertion.

- [ ] **Step 2: Implement tracked-file secret scanning**

Use `git ls-files -z`, skip ignored binary/generated paths, reject private key prefixes and service-role JWT signatures, and print only the filename plus rule name.

- [ ] **Step 3: Wire CI before build**

Add `npm run assert:secrets` after `npm ci --ignore-scripts` and add the package script without changing dependency versions.

- [ ] **Step 4: Verify**

Run `npm run assert:secrets`, `npm run assert:local-privacy`, and the existing focused tests.

### Task 2: Canonicalize the Supabase migration boundary

**Files:**
- Create: `supabase/migrations/202608090001_b2b_foundation.sql`
- Create: `supabase/tests/rls_b2b.sql`
- Modify: `docs/PRODUCTION_READINESS.md`
- Modify: `docs/FINAL-RELEASE-BACKLOG.md`

**Interfaces:**
- Adds `organizations`, `organization_members`, `organization_invitations`, `employer_programs`, and `organization_audit_events`.
- Adds `organization_membership_role(uuid, uuid)` returning `owner`, `admin`, or `member` for the requesting user.
- Adds `employer_cohort_summary(uuid)` returning aggregate counts and opt-in metric values only when membership count is at least 10.

- [ ] **Step 1: Write SQL security assertions**

Cover owner/admin/member permissions, invitation token non-disclosure, organization isolation, personal-row isolation, and the cohort threshold.

- [ ] **Step 2: Add tables and constraints**

Use UUID primary keys, unique organization slugs, unique `(organization_id, user_id)` memberships, invitation expiry/status fields, and audit timestamps. Use `ON DELETE CASCADE` only for membership-owned rows.

- [ ] **Step 3: Add RLS policies**

Allow members to read their own organization membership, owners/admins to manage memberships and invitations, and only owners/admins to manage programs. Never create a policy granting employers access to existing personal health tables.

- [ ] **Step 4: Add aggregate reporting boundary**

Implement a `SECURITY DEFINER` function with a fixed `search_path`, membership authorization, minimum cohort check, and `NULL`/empty output below threshold.

- [ ] **Step 5: Verify locally or with Supabase SQL tooling**

Run the SQL assertions against a linked/local project when the CLI is available. If remote credentials are unavailable, record the exact SQL and leave deployment of this migration as a release blocker rather than claiming it is applied.

### Task 3: Add B2B domain types and client service

**Files:**
- Create: `src/lib/organizations.ts`
- Create: `src/lib/__tests__/organizations.test.ts`
- Modify: `src/lib/constants.ts`

**Interfaces:**
- `OrganizationRole = 'owner' | 'admin' | 'member'`
- `OrganizationSummary`, `OrganizationMembership`, `OrganizationInvitation`, and `EmployerCohortSummary` types.
- `listOrganizations(): Promise<OrganizationMembership[]>`
- `createOrganization(name: string): Promise<OrganizationSummary>`
- `inviteOrganizationMember(organizationId: string, email: string, role: Exclude<OrganizationRole, 'owner'>): Promise<void>`
- `getEmployerCohortSummary(organizationId: string): Promise<EmployerCohortSummary | null>`

- [ ] **Step 1: Write tests for local mode, validation, and cloud calls**

Assert invalid names/emails fail before network calls, local mode returns safe empty values, and cloud calls select only the documented fields.

- [ ] **Step 2: Implement the service**

Use the existing Supabase client and data-mode guards. Never accept a service-role client or raw invitation token in the public API.

- [ ] **Step 3: Run focused tests**

Run `npx jest src/lib/__tests__/organizations.test.ts --runInBand`.

### Task 4: Add organization UX and route protection

**Files:**
- Create: `app/organization/index.tsx`
- Create: `src/web/screens/WebOrganization.tsx`
- Create: `src/web/__tests__/organization.test.tsx`
- Modify: `app/_layout.tsx`
- Modify: `src/web/WebSidebar.tsx`
- Modify: `src/web/WebMobileNav.tsx`

**Interfaces:**
- Route `/organization` renders a member-safe workspace screen.
- Owners/admins see invite and membership controls; members see membership information only.
- Empty local-mode state explains that organization management requires cloud mode.

- [ ] **Step 1: Write route and role rendering tests**

Cover unauthenticated redirect, local-mode empty state, member read-only state, and admin invite form validation.

- [ ] **Step 2: Implement the screen using existing web tokens/components**

Keep the layout responsive at 390px and 1440px, add visible focus states, labels, loading/error/retry states, and do not render personal health metrics.

- [ ] **Step 3: Add navigation and route protection**

Expose the organization link only for authenticated users and preserve existing auth routing behavior.

- [ ] **Step 4: Run focused tests and static export**

Run the organization Jest suite and `npm run build:web`.

### Task 5: Add employer-safe reporting

**Files:**
- Create: `supabase/functions/employer-report/index.ts`
- Create: `src/lib/__tests__/employerReport.test.ts`
- Create: `src/web/screens/WebEmployerReport.tsx`
- Create: `src/web/__tests__/employerReport.test.tsx`
- Modify: `app/organization/index.tsx`

**Interfaces:**
- Edge Function accepts `{ organizationId }` with the caller JWT and returns only `EmployerCohortSummary | null`.
- UI displays “not enough members” below 10 participants and aggregate trend cards at or above 10.

- [ ] **Step 1: Write authorization and disclosure tests**

Cover missing JWT, non-member access, member access, admin access, below-threshold suppression, and absence of row-level fields in the response.

- [ ] **Step 2: Implement the Edge Function**

Reuse `_shared/auth.ts` and CORS utilities, validate UUID input, call the database function, and return generic errors without provider/database details.

- [ ] **Step 3: Implement the report screen**

Use explicit privacy copy, accessible cards, and no raw health-record rendering.

- [ ] **Step 4: Run focused tests**

Run the function/client/UI tests and the existing privacy assertions.

### Task 6: Release QA and deployment

**Files:**
- Modify: `e2e/web.spec.ts`
- Modify: `playwright.config.ts` only if required by the existing project setup
- Modify: `docs/PRODUCTION_READINESS.md`
- Modify: `docs/FINAL-RELEASE-ROADMAP.md`

**Interfaces:**
- Browser coverage includes public legal routes, auth redirect behavior, organization route protection, responsive organization layout, and security headers.

- [ ] **Step 1: Add failing browser assertions**

Assert `/privacy`, `/terms`, `/organization`, mobile navigation, no horizontal overflow, and required response headers.

- [ ] **Step 2: Run the complete local gate**

Run `npm run check`, `npm run build:web`, `npm run assert:web`, `npm run assert:local-privacy`, `npm run assert:secrets`, and `npm run test:e2e`.

- [ ] **Step 3: Deploy through the configured Cloudflare Pages workflow/CLI**

Use the existing project `aurashape`; do not print tokens. If credentials are absent, stop at the verified build artifact and report the missing secret names only.

- [ ] **Step 4: Smoke-test the deployed URL**

Check public routes, asset loading, response headers, and the authenticated route boundary without creating or exposing real user data.

- [ ] **Step 5: Record release status**

Update production readiness with command evidence and distinguish completed code work from owner-only actions: Supabase key rotation, remote migration application, auth dashboard settings, DNS/domain ownership, and provider secrets.
