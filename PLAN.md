# Habitare Mobile — Release A Plan

## Context

The Habitare backend (NestJS at [`../server`](../server/)) is feature-complete for Release A: 45 user-facing endpoints across 12 tags, JWT auth with 423 lockout, FCM push with deep-link payloads, S3-backed multipart uploads, Spanish-default `language` column on the User entity. Twenty-five Release A screens are specified across three roles (tenant, maintainer, landlord), plus a complete Figma design system ([Habitare v1.0](https://www.figma.com/design/TZ0ouZT86FcD6Xql3zRnmb/Habitare-%E2%80%94-Tenant---Landlord-Platform)) with 19 color tokens, 25 text styles, 8pt spacing scale, and an "italic accent" brand rule.

The mobile client is empty ([`test.ts`](test.ts) is a stub). Our job is to stand up the Expo + TypeScript app, wire it to the live API, implement the 25 screens against the designs, and ship a working three-role product. This plan sequences that work and nails down the non-code decisions (folder layout, theme tokens, API generation, test strategy, phase order) so implementation is mechanical.

**User-confirmed decisions:**

- Target both iOS and Android simulators from day one.
- Building-detail unit management (Add Unit, Assign Tenant, Remove Tenant) — **hide** in Release A; backend lacks write endpoints outside `/admin/*`. Flag as R-B follow-up.
- Figma depth: capture foundations now, pull per-screen Figma context (`mcp__claude_ai_Figma__get_design_context`) during each screen's build.
- No offline cache persistence in Release A — in-memory TanStack Query only.

---

## 1. Screen inventory → endpoint map

Release A has **25 screens**. Each screen row below names the endpoints it hits; `*` = primary mutation, `→` = navigation target after success.

### Tenant (9 screens)

| #     | Screen              | Endpoints                                                                                                                                                                           | Notes                                 |
| ----- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| 01.01 | Sign In             | `POST /auth/login` \*, `POST /devices` (after login)                                                                                                                                | 423 → show `lockout_until` countdown  |
| 01.02 | Home                | `GET /auth/me` (cached), `GET /maintenance-requests?limit=3`, `GET /announcements?limit=3&unreadCount`                                                                              | Uses `tenantContext` from `/auth/me`  |
| 01.03 | My Requests list    | `GET /maintenance-requests` (infinite)                                                                                                                                              | Filter chips: status enum             |
| 01.04 | Submit Request      | `POST /maintenance-requests` (multipart `photos[]`) \* → 01.05                                                                                                                      | Client-side 10 MB per-photo guard     |
| 01.05 | Request Detail      | `GET /maintenance-requests/:id`, `GET /.../:id/schedule`, `POST /.../:id/comments`, `POST /.../:id/schedule-proposals` _, `POST /.../:id/schedule-proposals/:pid/accept\|decline` _ | One screen, multi-state               |
| 01.06 | Resolution Sign-off | `GET /.../:id/signoff`, `GET /.../:id/signoff/pdf`, `POST /.../:id/sign-off` (multipart `signedPdf`) \*, `POST /.../:id/dispute`                                                    | Section of 01.05 when status=RESOLVED |
| 01.07 | Announcements list  | `GET /announcements`, `PATCH /announcements/:id/read` on tap                                                                                                                        | Unread indicator from envelope        |
| 01.08 | Notifications feed  | `GET /notifications`, `POST /notifications/:id/read`, `POST /notifications/mark-all-read`                                                                                           | Tap → deep-link resolver              |
| 01.09 | Profile             | `GET /auth/me`, `PATCH /auth/me` \*, `POST /auth/logout` + `DELETE /devices/:token`                                                                                                 | Language toggle + notification prefs  |

### Maintainer (9 screens)

| #     | Screen                      | Endpoints                                                                                                  | Notes                                               |
| ----- | --------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 02.01 | Home                        | `GET /auth/me`, `GET /maintenance-requests?status=OPEN&limit=5`, counts from `maintainerContext`           |                                                     |
| 02.02 | Buildings list              | `GET /buildings`                                                                                           | Scoped to assigned buildings                        |
| 02.03 | Request Detail (maintainer) | Same as 01.05 + `POST /.../:id/acknowledge` _, `POST /.../:id/close-without-resolving` _                   | Action set differs by role                          |
| 02.04 | Resolve Request             | `POST /.../:id/resolve` (multipart `evidence[]`, `autoGeneratePdf`, optional custom PDF) \* → 02.03        | `notes` ≥ 20 chars                                  |
| 02.05 | Expenses list               | `GET /expenses?buildingId=...`, `GET /expenses/summary?from&to`, `POST /expenses` (multipart `receipt`) \* | Maintainer sees own only                            |
| 02.06 | Create Announcement         | `POST /announcements` \*, `GET /buildings/:id/units` (for audience picker)                                 | Audience: all vs `unitIds[]` (note backend DTO gap) |
| 02.07 | Invitations sent            | `GET /invitations`, `POST /invitations` \*, `POST /invitations/:id/resend`, `DELETE /invitations/:id`      |                                                     |
| 02.08 | All Requests                | `GET /maintenance-requests?status=&buildingId=` (infinite)                                                 | Filter: status + building                           |
| 02.09 | Profile                     | same as 01.09                                                                                              |                                                     |

### Landlord (7 screens)

| #     | Screen          | Endpoints                                                                   | Notes                                                             |
| ----- | --------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 03.01 | Dashboard       | `GET /portfolio/dashboard?period=YYYY-MM`                                   | `monthlyExpenses=0`, `deltaVsPreviousPeriod` missing → render `—` |
| 03.02 | Building Detail | `GET /buildings/:id`, `GET /buildings/:id/units`                            | Read-only; no unit mgmt in R-A                                    |
| 03.03 | Expense Detail  | `GET /expenses/:id`, `GET /expenses/:id/receipt`, `POST /expenses/:id/flag` | Flag is write-only                                                |
| 03.04 | Buildings list  | `GET /buildings`                                                            |                                                                   |
| 03.05 | Expenses list   | `GET /expenses`, `GET /expenses/summary`                                    |                                                                   |
| 03.06 | Invitations     | same as 02.07 + role=MAINTAINER option                                      |                                                                   |
| 03.07 | Profile         | same as 01.09                                                               |                                                                   |

**Cross-cutting (not on the 25 but required):** Forgot Password (`POST /auth/forgot-password`), Reset Password (`POST /auth/reset-password` via deep link), Invitation Accept (`GET/POST /invitations/by-token/:token` → auto-login).

---

## 2. Folder structure

```
client/
├── app.json                      # Expo config: name, scheme ('habitare'), deep link host
├── babel.config.js               # NativeWind + expo preset
├── tailwind.config.js            # theme extended from Figma tokens (section 5)
├── tsconfig.json                 # strict: true, paths: { "@/*": ["src/*"] }
├── eslint.config.mjs             # typescript-eslint + @tanstack/eslint-plugin-query + react-native
├── .prettierrc
├── jest.config.js                # jest-expo preset
├── App.tsx                       # root: providers + navigation
├── src/
│   ├── api/
│   │   ├── client.ts             # axios instance + auth interceptor + envelope unwrap
│   │   ├── errors.ts             # normalize error envelope → typed ApiError
│   │   ├── types.generated.ts    # from openapi-typescript (gitignored-generated)
│   │   └── schemas/              # Zod schemas for responses that need runtime validation
│   │       └── index.ts
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api.ts            # useLogin, useMe, useUpdateMe, useLogout, useForgotPassword, useResetPassword
│   │   │   ├── store.ts          # Zustand: token, user, hydrate(), signOut()
│   │   │   ├── screens/
│   │   │   │   ├── SignInScreen.tsx
│   │   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   │   ├── ResetPasswordScreen.tsx
│   │   │   │   └── InvitationAcceptScreen.tsx
│   │   │   └── components/
│   │   ├── requests/             # 01.03–06, 02.03–04, 02.08
│   │   │   ├── api.ts
│   │   │   ├── screens/
│   │   │   ├── components/       # RequestCard, StatusPill, Timeline, PhotoGallery, ScheduleProposalSheet, SignOffForm
│   │   │   └── hooks/            # useRequestStateMachine (derive available actions per status × role)
│   │   ├── announcements/
│   │   ├── expenses/
│   │   ├── buildings/
│   │   ├── portfolio/            # landlord dashboard
│   │   ├── invitations/
│   │   ├── notifications/
│   │   │   ├── api.ts
│   │   │   ├── deepLinkResolver.ts  # deepLink { requestId | announcementId | proposalId } → nav action
│   │   │   └── screens/
│   │   ├── devices/              # push token registration on login / logout
│   │   └── profile/              # 01.09 et al.
│   ├── navigation/
│   │   ├── RootNavigator.tsx     # dispatches Unauthed | Tenant | Maintainer | Landlord
│   │   ├── UnauthedStack.tsx
│   │   ├── TenantTabs.tsx
│   │   ├── MaintainerTabs.tsx
│   │   ├── LandlordTabs.tsx
│   │   ├── linking.ts            # expo-linking config: scheme, prefixes, deep link routes
│   │   └── types.ts              # ParamList types per navigator
│   ├── components/
│   │   └── ui/                   # Button, Input, Chip, Pill, Card, Sheet, Banner, Avatar, Toast, EmptyState, Skeleton, FileField
│   ├── hooks/                    # useToast, useUnreadCount, useKeyboard, useFilePicker, useImagePicker
│   ├── lib/
│   │   ├── secureStore.ts        # expo-secure-store wrapper
│   │   ├── i18n.ts               # i18n-js config, default 'es', langs in /locales
│   │   ├── date.ts               # date-fns-tz helpers (UTC → device tz)
│   │   ├── format.ts             # currency (€), numbers, distance-to-now
│   │   └── env.ts                # typed env: API_URL, FCM_SENDER_ID, etc.
│   ├── theme/
│   │   ├── tokens.ts             # exported design tokens (section 5)
│   │   └── typography.ts         # Fraunces + Inter + JetBrains Mono style objects
│   └── locales/
│       ├── es.json               # default
│       └── en.json
├── assets/
│   ├── fonts/                    # Fraunces, Inter, JetBrains Mono
│   └── images/
├── __tests__/                    # co-located where small; integration tests here
└── e2e/                          # Maestro flows
```

**Rationale**: features-by-domain beats technical-layer folders because screens, hooks, and components for `requests/` change together. `api/` owns the generic transport; each feature owns its own query hooks.

---

## 3. Auth flow + navigation tree

### Auth flow

1. **Boot**: `App.tsx` calls `authStore.hydrate()` which reads `token` from `expo-secure-store`.
2. If token present: `GET /auth/me` warms the user cache. On 401 → clear token → Unauthed stack.
3. If no token: Unauthed stack (`SignIn` or `InvitationAccept` via deep link).
4. **Login**: `POST /auth/login` → `{ token, user }` → `SecureStore.setItemAsync('token', ...)` → `authStore.setUser(user)` → `POST /devices { token: fcmToken, platform }` (fire-and-forget; ignore failure) → Root re-renders to role-appropriate tabs.
5. **423 lockout**: surface `lockout_until` with a live countdown; disable submit until expiry.
6. **Logout**: `DELETE /devices/:fcmToken` (best-effort) → `POST /auth/logout` → clear SecureStore → `authStore.signOut()`.
7. **401 from any request**: interceptor triggers `authStore.signOut()` globally (token invalidated server-side or expired).

### Navigation tree per role

```
RootNavigator (role switch on authStore.user?.role)
├── Unauthed (Stack)
│   ├── SignIn
│   ├── ForgotPassword
│   ├── ResetPassword                  (deep link: habitare://reset?token=...)
│   └── InvitationAccept               (deep link: habitare://invite/:token)
├── TenantTabs (BottomTabs: 5)
│   ├── Home stack           → Home → RequestDetail → SignOff
│   ├── My Requests stack    → List → RequestDetail → SignOff; modal: SubmitRequest
│   ├── Announcements stack  → List → Detail
│   ├── Notifications stack  → Feed (deep-link resolved at tap)
│   └── Profile stack        → Profile → Settings
├── MaintainerTabs (BottomTabs: 6)
│   ├── Home stack
│   ├── Requests stack       → AllRequests → RequestDetail → Resolve (modal)
│   ├── Buildings stack      → List → BuildingDetail
│   ├── Expenses stack       → List → ExpenseDetail; modal: CreateExpense
│   ├── Announcements stack  → List → Detail; modal: CreateAnnouncement
│   └── Invitations stack    → List; modal: NewInvitation
│   └── Profile (inside More or absorbed into Home header menu; decision pending final Figma)
└── LandlordTabs (BottomTabs: 5)
    ├── Dashboard stack      → Portfolio → BuildingDetail
    ├── Buildings stack
    ├── Expenses stack       → List → ExpenseDetail (flag modal)
    ├── Invitations stack
    └── Profile stack
```

**Notification bell**: header right on every stack screen → opens `Notifications` modal (shared route registered on each navigator).

**Deep link resolver** ([src/features/notifications/deepLinkResolver.ts](src/features/notifications/deepLinkResolver.ts)):

```ts
// deepLink: { requestId?, announcementId?, proposalId? }
// proposalId is nested under a request, so we also need requestId for it
```

— resolves to `navigation.navigate('RequestDetail', { id })` etc. For proposals, fetch the proposal first (or require backend to include `requestId` alongside `proposalId` in the payload).

---

## 4. Typed API client strategy

**Transport** — Axios with interceptors:

- Request: attach `Authorization: Bearer <token>` from `authStore.getState().token`.
- Response success: `response.data.data` becomes the resolved value (envelope unwrap). Keep `pagination` and `unreadCount` accessible via a second channel (e.g., a custom response transform that returns `{ data, meta }` for paginated endpoints).
- Response error: map the error envelope to a typed `ApiError(statusCode, message, errors?, details?)`. Surface `details.lockout_until` on 423.
- 401: call `authStore.signOut()`.

**Types** — generate with `openapi-typescript` against `../server/openapi.generated.json`:

```json
// package.json
"scripts": {
  "api:types": "openapi-typescript ../server/openapi.generated.json -o src/api/types.generated.ts"
}
```

Run on `postinstall` and in CI. Output is a `paths` / `components` tree typed to the wire shape.

**Hand-written hooks per endpoint** — one `api.ts` per feature exports strongly-typed query/mutation hooks:

```ts
// src/features/requests/api.ts
import type { paths } from '@/api/types.generated';
type ListResponse =
  paths['/maintenance-requests']['get']['responses']['200']['content']['application/json']['data'];

export const useRequestList = (params: ListParams) =>
  useInfiniteQuery({
    queryKey: ['requests', params],
    queryFn: ({ pageParam = 1 }) =>
      api.get<ListResponse>('/maintenance-requests', { params: { ...params, page: pageParam } }),
    getNextPageParam: (last, pages) =>
      pages.length * params.limit < last.meta.total ? pages.length + 1 : undefined,
  });
```

**Why not TanStack `@tanstack/react-query` code-gen?** openapi-typescript gives us types; hand-written hooks keep the call sites readable and let us encode caching/invalidation per endpoint. Generator-produced hooks end up generic and hard to customize.

**Zod validation**: only at boundaries where drift is likely (login response, `/auth/me`). Don't validate every list response — trust openapi-typescript for shape correctness.

**Multipart uploads**: `FormData` with exact backend field names — `photos[]`, `evidence[]`, `receipt`, `signedPdf`, `attachments[]`. Pre-upload client check: each file ≤ 10 MB; allowed MIME types `image/jpeg|png|webp` + `application/pdf`.

---

## 5. Theme tokens (from Figma Foundations)

**Colors** (19 tokens; reference by name, never hex):

```ts
// src/theme/tokens.ts
export const color = {
  bg: '#F4F1EC',
  paper: '#FBFAF6',
  paperWarm: '#F8F4EC',
  ink: '#161613',
  inkSoft: '#3A3A35',
  inkMute: '#6B6A62',
  inkFaint: '#9A998F',
  line: '#E2DDD2',
  lineSoft: '#EDE8DE',
  accent: '#E8502A',
  accentSoft: '#FCE8DF',
  ok: '#2F6F4E',
  okSoft: '#DDEAE0',
  warn: '#B8871C',
  warnSoft: '#F5ECD3',
  danger: '#9B2D20',
  dangerSoft: '#F3DBD6',
  info: '#2E4F7A',
  infoSoft: '#DCE5F0',
} as const;
```

**Spacing** (8pt base + 4pt fine; default screen padding is `space[5]` = 20):

```ts
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;
```

**Radius**: `xs:4, sm:6, md:8, lg:10, xl:12, '2xl':14, '3xl':16, pill:999`.

**Shadows**: three tokens — `card`, `fab` (colored, accent-tinted), `phone` (multi-layer).

**Typography — 25 styles, three families**:

- **Fraunces** (serif display): `display/hero`, `display/section`, `display/greeting`, `display/screen-title`, `display/card-title`, `display/stat-large`, `display/stat-medium`, `display/stat-small`
- **Inter** (UI, substituting Inter Tight per Figma): `title/app`, `body/lead`, `body/default`, `body/small`, `ui/label-strong`, `ui/label`, `ui/button`, `ui/chip`, `ui/pill`, `ui/tab`, `ui/caption`, `ui/tiny`, `eyebrow`, `eyebrow/accent`
- **JetBrains Mono** (data): `mono/data`, `mono/label`, `mono/tag`
- Weights needed: Fraunces SemiBold (600, stands in for Medium), Inter Regular/Medium/SemiBold, JetBrains Mono Regular/Medium.

**Italic accent rule**: exactly one word/glyph per hero uses `Fraunces Italic + color.accent`. Encode as `<AccentItalic>` component.

**Load fonts** via `expo-font` + `useFonts()` hook in `App.tsx`; block render with `SplashScreen.preventAutoHideAsync()` until loaded.

**NativeWind decision**: the spec is utility-friendly (pure spacing scale, token names), so NativeWind yields terse screens. Use it. Extend `tailwind.config.js` to mirror `color`, `space`, `radius`, and compose typography as component `className` presets.

---

## 6. State boundaries

| Category                  | Owner               | Examples                                                                                                      |
| ------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Server state**          | TanStack Query      | every API response, paginated lists, derived counts                                                           |
| **Auth client state**     | Zustand `authStore` | `token`, `user`, `hydrate()`, `signOut()` — persisted via SecureStore                                         |
| **UI client state**       | Zustand `uiStore`   | `theme` (future), `language`, `activeToast`                                                                   |
| **Draft form state**      | React Hook Form     | every form (Submit Request, Resolve, Create Expense, Create Announcement, Sign-off, Invitation, Profile edit) |
| **Local component state** | `useState`          | filter chips, accordion open/closed, sheet visibility                                                         |

Rule: **never mirror server state into Zustand**. The query cache is the source of truth. Zustand only holds what needs to persist across unmounts (auth) or isn't server-owned (language preference locally mirrored while the `PATCH /auth/me` flight is in progress, then the cache wins).

Query keys follow `[feature, entity, params]`: e.g. `['requests', 'list', { status, buildingId }]`, `['requests', 'detail', id]`, `['announcements', 'list']`. Mutations invalidate with `queryClient.invalidateQueries({ queryKey: ['requests'] })`.

---

## 7. Testing strategy

- **Unit** — Jest with `jest-expo` preset. Target: utility functions, state-machine derivers (`useRequestStateMachine` action map per status × role), date formatters, envelope unwrap, deep-link resolver. No mocks beyond `@react-native-async-storage/async-storage` and `expo-secure-store`.
- **Component** — React Native Testing Library. Test each `features/*/components/` in isolation: RequestCard renders correct StatusPill; SubmitRequestForm enforces photo size; SignOffForm allows optional PDF. Snapshot a few but prefer behavior assertions.
- **Hook** — `@testing-library/react-hooks` around TanStack Query hooks using a mock axios — confirm envelope unwrap + pagination wiring.
- **E2E** — **Maestro** (simpler than Detox for Expo managed workflow). One flow per role's core loop:
  - `tenant-core.yaml`: sign in → submit request with photo → propose schedule → accept proposal → sign off
  - `maintainer-core.yaml`: sign in → acknowledge → propose schedule → accept → resolve with evidence
  - `landlord-core.yaml`: sign in → view dashboard → open building → flag expense
- **Runs**: unit/component in pre-commit hook + CI; Maestro nightly against a seeded test backend.
- **Type safety gate**: `tsc --noEmit` blocks commits via `lint-staged` + `husky`. `eslint` + `prettier` also pre-commit.

---

## 8. Phase ordering

Each phase ends with `tsc --noEmit` clean, lint clean, relevant tests passing, app installable on iOS and Android simulators.

### Phase 0 — Scaffold (half day)

- `npx create-expo-app` with TS template, strict mode, absolute imports
- Install: `@tanstack/react-query`, `zustand`, `axios`, `react-hook-form`, `zod`, `@hookform/resolvers`, `expo-secure-store`, `expo-notifications`, `expo-linking`, `expo-image-picker`, `expo-document-picker`, `expo-font`, `expo-splash-screen`, `date-fns`, `date-fns-tz`, `i18n-js`, `nativewind`, `@react-navigation/native` + `native-stack` + `bottom-tabs`
- Dev: `openapi-typescript`, `jest-expo`, `@testing-library/react-native`, `eslint`, `prettier`, `husky`, `lint-staged`, `typescript-eslint`
- Configure: Tailwind with token extension, ESLint, Prettier, Husky pre-commit, Jest, `app.json` scheme `habitare`, iOS and Android bundle IDs, FCM `google-services.json` / `GoogleService-Info.plist` placeholders
- Generate `src/api/types.generated.ts`
- Smoke: empty Home screen renders on both simulators.

### Phase 1 — Shell + Auth (2 days)

- `api/client.ts` with interceptors + envelope unwrap + `ApiError`
- `authStore` with SecureStore hydration
- Theme tokens, fonts loaded, base `ui/` primitives (Button, Input, Chip, Pill, Card, Banner)
- `RootNavigator` with role dispatch (mock role via Zustand until login works)
- Sign In + Forgot + Reset + Invitation Accept screens, deep-link config
- Push token registration via `POST /devices` on successful login
- i18n scaffolding with `es.json` / `en.json` (all strings in Phase 1+)
- Gate: log in as each role on both simulators and land on correct tab shell.

### Phase 2 — Tenant core loop (3 days)

- 01.02 Home, 01.03 My Requests, 01.04 Submit (with photo upload), 01.05 Request Detail (schedule negotiation + comments), 01.06 Sign-off (+ dispute), 01.07 Announcements, 01.08 Notifications, 01.09 Profile
- Gate: Maestro `tenant-core.yaml` passes end-to-end.

### Phase 3 — Maintainer loop (3 days)

- 02.01–02.09. Key screens: 02.03 Request Detail (acknowledge, close-without-resolving, propose schedule), 02.04 Resolve (multipart evidence + PDF toggle), 02.06 Create Announcement, 02.07 Invitations
- Gate: Maestro `maintainer-core.yaml` passes.

### Phase 4 — Landlord + portfolio (2 days)

- 03.01 Dashboard (render `—` for `monthlyExpenses`, `deltaVsPreviousPeriod`), 03.02–03.07
- Building Detail explicitly read-only for maintainers too (no Add Unit in R-A)
- Gate: Maestro `landlord-core.yaml` passes.

### Phase 5 — Polish (2 days)

- Push notification handler (foreground/background/quit) with deep-link dispatch
- Loading skeletons + empty states (localized strings)
- 44×44 min tap target audit; `accessibilityLabel` on every Touchable
- Icon + splash, app name per locale
- Device testing matrix: iPhone 15, iPhone SE, Pixel 7, small Android
- Performance: measure cold start, list scroll jank on My Requests with 100 items, image upload progress on slow network
- README + `.env.example`

**Total estimate**: ~12 working days of focused build before Release A handoff.

---

## Critical files to reference during implementation

- [`../server/postman/postman_collection.json`](../server/postman/postman_collection.json) — request bodies, multipart field names, example responses
- [`../server/openapi.generated.json`](../server/openapi.generated.json) — source for `openapi-typescript` codegen
- [`../server/PROJECT_DOCUMENTATION.md`](../server/PROJECT_DOCUMENTATION.md) — §4 auth, §6 request lifecycle, §11 known gaps (monthlyExpenses stub, emergency push, force-dup)
- [`../server/BACKEND_AUDIT_REPORT.md`](../server/BACKEND_AUDIT_REPORT.md) — H5 no refresh rotation, H7 no tx wrapping, H8 partial-unique on proposals
- [`../openapi-release-a.yaml`](../openapi-release-a.yaml) — screen-by-screen product spec
- [`../UI-UX-SPEC.md`](../UI-UX-SPEC.md) — edge cases (EDGE-06 lockout, EDGE-17 dup, EDGE-22 decline, EDGE-31 dispute)
- Figma Foundations: [node 6:2](https://www.figma.com/design/TZ0ouZT86FcD6Xql3zRnmb/?node-id=6-2) — tokens already captured in §5
- For each screen during its phase: `mcp__claude_ai_Figma__get_design_context` with the screen's Figma node id

---

## Verification (end-to-end)

1. Backend running: `cd ../server && npm run start:dev` → `curl http://localhost:3000/api/v1/health` returns 200.
2. Seeded accounts: pick one tenant, one maintainer, one landlord from `../server/test/fixtures` or seed via `/admin/*` superAdmin endpoints.
3. `API_URL=http://<lan-ip>:3000/api/v1 npx expo start` — open on both iOS simulator and Android emulator.
4. Run Maestro: `maestro test e2e/tenant-core.yaml` (repeat for maintainer, landlord) — all three pass.
5. Manual smoke of notification path: create a request as tenant → verify FCM push arrives on maintainer's simulator → tap it → Maintainer Request Detail opens on the correct request.
6. Language: switch to English in Profile → every user-visible string retranslates without requiring restart.
7. Lockout: submit bad password 5× → verify 423 screen shows countdown.
8. `tsc --noEmit && eslint . && jest` all clean.
9. `open -a Simulator` and `adb install` the built artifact — app launches, auth persists across kills.
