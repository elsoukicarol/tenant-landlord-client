# Habitare Mobile — Developer Guide

Everything a new engineer needs to understand, navigate, and extend this codebase.
[README.md](README.md) covers setup; this file covers the _why_ and the _how_.

## Table of contents

1. [What this app is](#1-what-this-app-is)
2. [Architecture at a glance](#2-architecture-at-a-glance)
3. [State boundaries](#3-state-boundaries)
4. [Directory structure](#4-directory-structure)
5. [The API client](#5-the-api-client)
6. [Navigation](#6-navigation)
7. [Auth lifecycle](#7-auth-lifecycle)
8. [Push notifications](#8-push-notifications)
9. [Internationalization](#9-internationalization)
10. [Design system](#10-design-system)
11. [Forms](#11-forms)
12. [The request state machine](#12-the-request-state-machine)
13. [Recipes](#13-recipes)
14. [Testing strategy](#14-testing-strategy)
15. [Known backend gaps](#15-known-backend-gaps)
16. [Release gates](#16-release-gates)
17. [Troubleshooting](#17-troubleshooting)

---

## 1. What this app is

Habitare is a property-management platform that pairs **tenants** (renters in
units), **maintainers** (building caretakers), and **landlords** (property
owners). This repo is the **mobile client** — a single Expo + React Native app
that serves all three roles via a role-dispatched root navigator.

The backend ([`../server`](../server/)) is a NestJS HTTP API at `/api/v1`. It
owns the source of truth; the client is a thin typed shell over it.

**Release A** is the current scope: 25 screens covering auth, maintenance
requests, schedule negotiation, sign-off, announcements, expenses, invitations,
and a landlord portfolio dashboard. See [PLAN.md](PLAN.md) for the full screen
inventory and endpoint map.

---

## 2. Architecture at a glance

```
┌─────────────────────── App.tsx ───────────────────────┐
│  GestureHandlerRootView                               │
│  ├─ SafeAreaProvider                                  │
│  │  └─ QueryClientProvider (TanStack Query v5)        │
│  │     ├─ <SessionBootstrapper />   fetches /auth/me  │
│  │     └─ NavigationContainer                         │
│  │        ├─ onReady → attachPushHandlers(ref)        │
│  │        └─ <RootNavigator />                        │
│  │           ├─ Unauthed stack        (no user)       │
│  │           ├─ TenantTabs            (role=tenant)   │
│  │           ├─ MaintainerTabs        (role=maint.)   │
│  │           └─ LandlordTabs          (role=landlord) │
└───────────────────────────────────────────────────────┘
                           │
                           ▼
                 axios client (src/api)
                 ├─ request:  attach Bearer <token>
                 ├─ response: unwrap { data }
                 ├─ 4xx/5xx:  throw ApiError
                 └─ 401:      authStore.signOut()
                           │
                           ▼
                   Backend  /api/v1/*
```

**Key decisions:**

- **Role is a first-class navigation concern.** The root navigator reads `role`
  from the auth store and mounts an entirely different stack. There are no
  runtime "if role === landlord" branches in screens that exist in multiple
  roles — each role has its own screens (or a shared screen is made
  role-neutral: see [BuildingsListScreen](src/features/buildings/screens/BuildingsListScreen.tsx)).
- **Server state lives in TanStack Query, period.** If data came from the
  backend, it lives in a query cache. Zustand never mirrors server data except
  for the user object itself (cached so the root navigator can dispatch before
  `/auth/me` resolves).
- **Envelope unwrap happens once, at the transport layer.** Hooks and screens
  work with `{ data, pagination?, unreadCount? }` — they never see the raw
  `{ success, data, message, statusCode, timestamp }` shape.
- **Types flow from the backend.** `src/api/types.generated.ts` is produced by
  `openapi-typescript` from `../server/openapi.generated.json` and re-generated
  via `npm run api:types`. Domain types in `features/*/types.ts` are
  hand-written because the backend's OpenAPI spec currently has thin DTO
  definitions (`Record<string, never>`); when that lands, we'll narrow them.

---

## 3. State boundaries

| Category                | Owner               | Lives in                     | Examples                                                                        |
| ----------------------- | ------------------- | ---------------------------- | ------------------------------------------------------------------------------- |
| **Server state**        | TanStack Query      | `QueryClient` in App.tsx     | requests list, request detail, notifications, buildings                         |
| **Auth client state**   | Zustand `authStore` | `src/features/auth/store.ts` | `token`, `user`, `hydrate()`, `signOut()` — token persisted via SecureStore     |
| **Draft form state**    | React Hook Form     | per-screen `useForm()`       | every form (Login, Submit Request, Resolve, Sign-off, etc.)                     |
| **UI toggles, sheets**  | `useState`          | per-component                | filter chips, accordion open, modal visible                                     |
| **Language preference** | Zustand + backend   | `authStore.user.language`    | locally mirrored while `PATCH /auth/me` is in flight, then the query cache wins |

**Rule:** never mirror server state into Zustand. If you're tempted to, use
`useQuery` with `select` or a derived selector hook instead.

**Query key convention:** `[feature, entity, params]`. Use a factory to avoid
typos:

```ts
export const requestKeys = {
  all: ['requests'] as const,
  list: (p: ListParams) => ['requests', 'list', p] as const,
  detail: (id: string) => ['requests', 'detail', id] as const,
};
```

Mutations invalidate by the broadest relevant prefix:
`queryClient.invalidateQueries({ queryKey: requestKeys.all })`.

---

## 4. Directory structure

```
src/
├── api/                      # Transport layer + generated types
│   ├── client.ts             # axios instance + interceptors
│   ├── envelope.ts           # unwrap(), hasMorePages()
│   ├── errors.ts             # ApiError class
│   └── types.generated.ts    # openapi-typescript output (gitignored)
│
├── components/
│   ├── PlaceholderScreen.tsx # scaffold stub
│   └── ui/                   # Design-system primitives (no feature logic)
│
├── features/                 # One folder per domain; self-contained
│   ├── auth/
│   │   ├── api.ts            # useLogin, useMe, useLogout, ...
│   │   ├── schemas.ts        # Zod schemas w/ i18n error keys
│   │   ├── store.ts          # authStore (Zustand)
│   │   ├── SessionBootstrapper.tsx
│   │   ├── components/       # LockoutBanner, etc.
│   │   └── screens/
│   ├── requests/             # Maintenance requests (tenant + maintainer)
│   │   ├── api.ts            # One hook per endpoint
│   │   ├── types.ts          # Domain types + enum arrays
│   │   ├── stateMachine.ts   # availableActions(status × role × pending)
│   │   ├── statusTone.ts     # status → Pill tone
│   │   ├── components/       # RequestCard, Timeline, PhotoGallery, ...
│   │   ├── screens/          # Home, MyRequests, Submit, RequestDetail, Resolve
│   │   └── __tests__/
│   ├── announcements/
│   ├── expenses/
│   ├── buildings/
│   ├── portfolio/            # Landlord dashboard
│   ├── invitations/
│   ├── notifications/        # Feed + deep-link resolver + push handler
│   ├── devices/              # Push-token register/unregister
│   └── profile/
│
├── hooks/                    # Cross-feature hooks (reserved)
├── lib/                      # Generic utilities
│   ├── date.ts               # date-fns wrappers
│   ├── env.ts                # EXPO_PUBLIC_* access (no dynamic keys)
│   ├── format.ts             # Intl.NumberFormat wrappers + PLACEHOLDER
│   ├── i18n.ts               # i18n-js config, t(), setLanguage()
│   └── secureStore.ts        # expo-secure-store wrapper
│
├── locales/                  # es.json (default), en.json — flat JSON tree
├── navigation/
│   ├── RootNavigator.tsx     # Role switch
│   ├── UnauthedStack.tsx
│   ├── TenantTabs.tsx        # 5 nested stacks
│   ├── MaintainerTabs.tsx    # 8 nested stacks
│   ├── LandlordTabs.tsx      # 6 nested stacks
│   ├── linking.ts            # expo-linking config
│   └── types.ts              # ParamList per stack + RootParamList augmentation
│
└── theme/
    ├── tokens.ts             # color, space, radius, shadow (19 colors)
    ├── typography.ts         # 25 text styles, FONT_ASSETS for useFonts()
    └── index.ts              # barrel
```

**Rule of thumb:** screens, hooks, components, and types for one domain live
under one `features/<domain>/` folder. If you find yourself importing a screen
from another feature, either (a) that component belongs in `components/ui/`,
(b) the two features should merge, or (c) you're coupling across feature
boundaries — pass data down through route params instead.

---

## 5. The API client

[src/api/client.ts](src/api/client.ts) is the only module that speaks HTTP.

```ts
// Every call goes through this surface
export const api = {
  get: <T>(url, params?) => Promise<ApiResponse<T>>,
  post: <T>(url, data?) => Promise<ApiResponse<T>>,
  patch: <T>(url, data?) => Promise<ApiResponse<T>>,
  put: <T>(url, data?) => Promise<ApiResponse<T>>,
  delete: <T>(url, data?) => Promise<ApiResponse<T>>,
  upload: <T>(url, form) => Promise<ApiResponse<T>>, // multipart
};
```

### Interceptors

- **Request:** attaches `Authorization: Bearer <token>` from `authStore.getState().token`.
- **Response (success):** the raw response is `{ success, data, message, statusCode, timestamp }`. Our `unwrap()` reshapes it into `{ data, pagination?, unreadCount? }` so hooks see just the payload.
- **Response (error):** maps to a typed `ApiError(statusCode, message, errors[], details)`.
  - `401` → global `authStore.signOut()`.
  - `423` → `err.lockoutUntil` exposes the ISO unlock timestamp.
  - `409` / `400` / `404` / `403` have narrowing getters (`err.isConflict`, etc.).

### File uploads

Multipart uploads use `api.upload()` with a `FormData`. Backend field names
matter — match them exactly:

| Endpoint                                  | Multipart field                                                 |
| ----------------------------------------- | --------------------------------------------------------------- |
| `POST /maintenance-requests`              | `photos[]`                                                      |
| `POST /maintenance-requests/:id/resolve`  | `evidence[]`, optional custom PDF as another `evidence[]` entry |
| `POST /maintenance-requests/:id/sign-off` | `signedPdf`                                                     |
| `POST /expenses`                          | `receipt`                                                       |

React Native's `FormData` accepts `{ uri, name, type }` for files, but TS types
it as `string | Blob`. Cast through `as unknown as Blob` (see [requests/api.ts](src/features/requests/api.ts)).
All uploads are capped at 10 MB per file (client-side — see
[PhotoPickerField](src/features/requests/components/PhotoPickerField.tsx)).

### Envelope + pagination

```ts
type ApiResponse<T> = { data: T; pagination?: PaginationMeta; unreadCount?: number };
type PaginationMeta = { page: number; limit: number; total: number };
```

Paginated endpoints use `useInfiniteQuery` with `getNextPageParam` reading the
pagination meta:

```ts
getNextPageParam: (last, pages) => {
  const total = last.pagination?.total ?? 0;
  const fetched = pages.length * limit;
  return fetched < total ? pages.length + 1 : undefined;
},
```

---

## 6. Navigation

### The three layers

1. **RootNavigator** (`src/navigation/RootNavigator.tsx`) — a native-stack with
   one screen mounted at a time, chosen by role:
   ```ts
   {role === 'tenant'     ? <Tab.Screen name="TenantRoot"     component={TenantTabs}     />
    : role === 'maintainer' ? <Tab.Screen name="MaintainerRoot" component={MaintainerTabs} />
    : role === 'landlord'   ? <Tab.Screen name="LandlordRoot"   component={LandlordTabs}   />
    :                         <Tab.Screen name="Unauthed"       component={UnauthedStack}  />}
   ```
2. **Role tabs** (TenantTabs, MaintainerTabs, LandlordTabs) — bottom-tab
   navigators, each tab hosts its own native-stack.
3. **Nested stacks** — each tab's stack contains the list screen + any
   drill-downs and modals.

### Typed param lists

Every stack has a `ParamList` type in [navigation/types.ts](src/navigation/types.ts).
The `RootParamList` interface is augmented globally so `useNavigation()`
without a generic still gets autocomplete for top-level targets:

```ts
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

### Deep links

Scheme: `habitare://`. Config in [navigation/linking.ts](src/navigation/linking.ts).
Currently mapped:

- `habitare://sign-in`
- `habitare://forgot-password`
- `habitare://reset/:token`
- `habitare://invite/:token`

Push notifications use a separate pathway — see [§8](#8-push-notifications).

### Role-neutral shared screens

A screen that the maintainer and landlord both see (e.g. `BuildingsListScreen`,
`InvitationsScreen`) reads `role` from the auth store and picks the right
target screen name at runtime:

```ts
const target = role === 'landlord' ? 'LandlordBuildingDetail' : 'MaintainerBuildingDetail';
navigation.navigate(target, { id });
```

The detail screens themselves are registered under different names in each
stack but point to the **same component file**. The component uses a loose
route type — `RouteProp<{ Detail: { id: string } }, 'Detail'>` — since all it
needs is the `id`.

---

## 7. Auth lifecycle

### Boot

```
App.tsx mounts
  └─ authStore.hydrate()        reads token from SecureStore
      └─ setState({ token, isHydrated: true })
           └─ <SessionBootstrapper />
               └─ useMe(enabled = token && !user)
                   ├─ 200 → setUser(response)
                   └─ 401 → interceptor calls authStore.signOut()
```

Splash screen stays visible until fonts + hydration complete (see [App.tsx](App.tsx)).

### Login

```ts
const login = useLogin();
login.mutate(
  { email, password },
  {
    onSuccess: () => {
      void registerPushToken(); // best-effort, never blocks
    },
    onError: (err) => {
      if (isApiError(err) && err.isLocked && err.lockoutUntil) {
        setLockoutUntil(err.lockoutUntil);
        // <LockoutBanner> displays a live mm:ss countdown
      }
    },
  },
);
```

`useLogin` itself calls `authStore.setSession(token, user)` on success — the
screen doesn't need to store the token manually.

### Logout

```ts
const logout = useLogout();
await unregisterPushToken(); // best-effort DELETE /devices/:token
logout.mutate(); // POST /auth/logout → signOut() → queryClient.clear()
```

`queryClient.clear()` drops every cached query so the next user starts fresh.

### 401 handler

The axios response interceptor catches every 401 and calls
`authStore.signOut()`. The root navigator re-renders to the Unauthed stack.
Individual screens don't need to handle 401 — they'll unmount.

### Lockout (423)

The `/auth/login` endpoint returns HTTP 423 with `details.lockout_until` after
5 failed attempts in 15 min. Our `ApiError` exposes this via `err.lockoutUntil`.
The [LockoutBanner](src/features/auth/components/LockoutBanner.tsx) uses
`countdownSeconds(iso)` + `formatCountdown(s)` from [lib/date.ts](src/lib/date.ts)
to tick down every second.

---

## 8. Push notifications

### Registration (on login)

```ts
// src/features/devices/api.ts
export async function registerPushToken() {
  const pushToken = await Notifications.getExpoPushTokenAsync({ projectId }).data;
  await api.post('/devices', { token: pushToken, platform: 'IOS' | 'ANDROID' });
  await secureStore.setPushToken(pushToken);
}
```

Registration is **best-effort** — a network failure or missing permissions
must never block sign-in. The hook catches all errors silently.

### Handling (foreground / background / cold launch)

[src/features/notifications/pushHandler.ts](src/features/notifications/pushHandler.ts)
wires all three:

- **Foreground:** `Notifications.setNotificationHandler` returns
  `{ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: true }` so iOS still surfaces the banner while the app is active.
- **Background tap:** `addNotificationResponseReceivedListener` fires when the
  user taps a delivered notification.
- **Cold launch:** `getLastNotificationResponseAsync()` checks whether the app
  was _launched_ by a tap; if so, we replay the response into the same handler.

All three call `resolveDeepLink(link, navigationRef, role)` which routes based
on the notification's `data.deepLink` object:

```ts
// backend payload shape
data.deepLink = { requestId?, announcementId?, proposalId? };
```

`resolveDeepLink` accepts either a `NavigationProp` (inside a screen) or a
`NavigationContainerRef` (from the root App — where the push handler lives).
See [deepLinkResolver.ts](src/features/notifications/deepLinkResolver.ts).

### Android channel

Created lazily on first notification handler attach — `IMPORTANCE.HIGH` with
the accent-orange light color to match the brand.

### Real push vs Expo Go

Expo Go delivers in-app notifications perfectly but its Expo Push token won't
match your FCM config for real backend-sent pushes. For full end-to-end
testing, build a development client (`eas build --profile development`).

---

## 9. Internationalization

**Default locale is Spanish** (`es`) — the backend's `user.language` column
defaults to it. English (`en`) is a secondary translation.

### Structure

```
src/locales/
├── es.json      # source of truth, every key present
└── en.json      # mirror — every key present in es must exist here
```

Keys are namespaced by feature: `auth.*`, `requests.*`, `announcements.*`, etc.
Interpolation uses `{{name}}` syntax (i18n-js):

```json
"auth": {
  "lockedBody": "Demasiados intentos fallidos. Podrás intentar de nuevo en {{countdown}}."
}
```

### Usage

```ts
import { t } from '@/lib/i18n';

<Text>{t('auth.lockedBody', { countdown: '4:23' })}</Text>
```

### Error messages from Zod

Schemas use i18n **keys**, not literals:

```ts
z.string().email('auth.invalidEmail');
```

The screen resolves them at render:

```ts
error={fieldState.error ? t(fieldState.error.message ?? '') : undefined}
```

This keeps forms translatable and the schema library-agnostic.

### Rules

- **Never** put a user-visible string in a component. Always use `t()`.
- Adding a key to `es.json`? Add the same key to `en.json` in the same commit.
- Backend enum values (`PLUMBING`, `URGENT`) stay in English on the wire; we
  translate them on display via `requests.category.PLUMBING` etc.

---

## 10. Design system

Tokens extracted from [Figma Foundations](https://www.figma.com/design/TZ0ouZT86FcD6Xql3zRnmb/?node-id=6-2)
and mirrored in code + Tailwind config.

### Tokens ([src/theme/tokens.ts](src/theme/tokens.ts))

- **Color:** 19 named tokens (`color.ink`, `color.accent`, `color.okSoft`, etc.). Never hardcode a hex outside this file.
- **Space:** 8pt base + 4pt fine — `space[5]` = 20 (default screen padding).
- **Radius:** `xs:4 → 3xl:16` plus `pill:999`.
- **Shadow:** `card` (subtle), `fab` (accent-tinted), `phone` (multi-layer elevation).
- **MIN_TAP_TARGET:** 44 — enforced by `Button`, followed by every other interactive primitive.

### Typography ([src/theme/typography.ts](src/theme/typography.ts))

25 text styles across three families:

- **Fraunces** (serif display) — hero, greeting, screen-title, stat-large/medium/small, card-title
- **Inter** (UI) — title, body/{lead,default,small}, ui/{label-strong,label,button,chip,pill,tab,caption,tiny}, eyebrow
- **JetBrains Mono** (data) — mono/data, mono/label, mono/tag

Fonts load via `useFonts(FONT_ASSETS)` in App.tsx. The `Text` primitive picks a
style by variant:

```ts
<Text variant="display/hero">Welcome back.</Text>
```

### The italic accent rule

From the Figma spec: **exactly one word or punctuation mark per hero uses
Fraunces Italic + color.accent** — "the one brand moment."

```tsx
<Text variant="display/hero">
  {t('auth.signInHeroPrefix')}
  <AccentItalic>{t('auth.signInHeroItalic')}</AccentItalic>
  {t('auth.signInHeroSuffix')}
</Text>
```

Keep locale strings split into prefix/italic/suffix so translators can move the
accented word naturally (in English: "Welcome _back_."; in Spanish: "Hola de
_nuevo_.").

### Primitives ([src/components/ui/](src/components/ui/))

| Primitive      | Purpose                                                            |
| -------------- | ------------------------------------------------------------------ |
| `Text`         | Typography by variant                                              |
| `AccentItalic` | The one-italic-word rule                                           |
| `Button`       | Primary / secondary / ghost / danger, md / lg sizes, loading state |
| `Input`        | Label + error + hint + optional right-action (show/hide password)  |
| `Chip`         | Pill-shaped selectable (filter chips, small selectors)             |
| `Pill`         | Tone-colored label (status, priority, badges)                      |
| `Card`         | Paper background + line border + optional shadow                   |
| `Banner`       | Tone-colored info/ok/warn/danger/accent block                      |
| `Screen`       | SafeAreaView + consistent 20px horizontal padding                  |
| `EmptyState`   | Centered title + body + optional action                            |
| `Skeleton`     | Pulsing placeholder rectangle                                      |

Role-coloured shared primitives (RequestCard, AnnouncementCard, etc.) live in
`features/*/components/`, not here.

---

## 11. Forms

Every form uses **React Hook Form + Zod**, with error messages as i18n keys.

### Canonical pattern

```ts
// src/features/auth/schemas.ts
export const loginSchema = z.object({
  email: z.string().trim().email('auth.invalidEmail'),
  password: z.string().min(1, 'auth.passwordRequired'),
});
export type LoginInput = z.infer<typeof loginSchema>;
```

```tsx
// SignInScreen.tsx
const { control, handleSubmit } = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' },
  mode: 'onBlur',
});

const onSubmit = handleSubmit((values) => {
  login.mutate(values);
});

<Controller
  control={control}
  name="email"
  render={({ field, fieldState }) => (
    <Input
      label={t('auth.email')}
      value={field.value}
      onChangeText={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error ? t(fieldState.error.message ?? '') : undefined}
    />
  )}
/>;
```

### Why not uncontrolled refs?

Zod cross-field validation (password-confirm, date-after-now) is cleaner when
RHF owns the values. `mode: 'onBlur'` avoids noisy on-change errors while the
user is typing.

### Custom types (amount parsing, etc.)

Zod's `.transform()` changes the output type, which confuses RHF's generic
inference. Simpler: validate as string, convert at submit time:

```ts
const schema = z.object({
  amount: z.string().refine((v) => Number(v.replace(',', '.')) > 0, 'expenses.amountInvalid'),
});
// on submit:
create.mutate({ ...values, amount: Number(values.amount.replace(',', '.')) });
```

---

## 12. The request state machine

[`src/features/requests/stateMachine.ts`](src/features/requests/stateMachine.ts)
encodes the backend's maintenance-request state transitions (documented in
`../server/PROJECT_DOCUMENTATION.md` §6). The screen doesn't decide what a
role can do — it asks.

```ts
import { availableActions, buildActionContext } from '@/features/requests/stateMachine';

const ctx = buildActionContext(request.status, role, proposals);
const actions = availableActions(ctx);

if (actions.includes('ACKNOWLEDGE')) {
  // show the acknowledge button
}
```

### States

```
OPEN → ACKNOWLEDGED → IN_PROGRESS → RESOLVED → CLOSED
                                       ↓
                                     DISPUTED

Any → CLOSED_WITHOUT_RESOLVING  (maintainer escape hatch)
```

### Actions by state × role

| Status                                 | Tenant                     | Maintainer                                  |
| -------------------------------------- | -------------------------- | ------------------------------------------- |
| OPEN                                   | —                          | ACKNOWLEDGE, CLOSE_WITHOUT_RESOLVING        |
| ACKNOWLEDGED                           | PROPOSE_SCHEDULE\*         | PROPOSE_SCHEDULE\*, CLOSE_WITHOUT_RESOLVING |
| ACKNOWLEDGED + pending from maintainer | ACCEPT / DECLINE / COUNTER | —                                           |
| ACKNOWLEDGED + pending from tenant     | —                          | ACCEPT / DECLINE / COUNTER                  |
| IN_PROGRESS                            | —                          | RESOLVE                                     |
| RESOLVED                               | SIGN_OFF, DISPUTE          | —                                           |
| Any                                    | COMMENT                    | COMMENT                                     |

\* only if no pending proposal from that role.

This is tested in [stateMachine.test.ts](src/features/requests/__tests__/stateMachine.test.ts)
— 9 cases covering role gating, pending-proposal interactions, universal
actions. If you change the matrix, update the test.

---

## 13. Recipes

### Add a new API endpoint

Say the backend adds `GET /buildings/:id/inspections`.

1. **Define the domain type** in `src/features/buildings/types.ts`:
   ```ts
   export type Inspection = { id: string; date: string; passed: boolean; notes?: string };
   ```
2. **Add the hook** in `src/features/buildings/api.ts`:
   ```ts
   export function useInspections(buildingId: string | undefined) {
     return useQuery({
       queryKey: ['buildings', 'inspections', buildingId],
       enabled: Boolean(buildingId),
       queryFn: async () => {
         if (!buildingId) throw new Error('buildingId required');
         const res = await api.get<Inspection[]>(`/buildings/${buildingId}/inspections`);
         return res.data;
       },
     });
   }
   ```
3. **Regenerate types** if the OpenAPI spec adds shape detail:
   ```bash
   npm run api:types
   ```
4. **Use it in a screen** — no other wiring needed.

For **mutations**, add `onSuccess` with `queryClient.invalidateQueries({ queryKey: ['buildings'] })`.

### Add a new screen

Let's add `03.08 LandlordReports` (imaginary).

1. **Create the screen:** `src/features/reports/screens/LandlordReportsScreen.tsx`.
2. **Declare the route** in [navigation/types.ts](src/navigation/types.ts):
   ```ts
   export type LandlordReportsStackParamList = {
     LandlordReportsList: undefined;
     LandlordReportDetail: { id: string };
   };
   // add to LandlordTabParamList:
   LandlordReports: NavigatorScreenParams<LandlordReportsStackParamList>;
   ```
3. **Register the stack** in [LandlordTabs.tsx](src/navigation/LandlordTabs.tsx):
   ```ts
   const Reports = createNativeStackNavigator<LandlordReportsStackParamList>();
   function ReportsStack() { /* ... */ }
   <Tab.Screen name="LandlordReports" component={ReportsStack} options={{ title: t('nav.reports') }} />
   ```
4. **Add nav label** to `locales/es.json` + `en.json` under `nav.reports`.
5. **Done.** Tabs are type-checked end-to-end so a typo won't compile.

### Add a new form

Follow the RHF + Zod canonical pattern ([§11](#11-forms)). Put the schema next
to the API hook so both stay in sync:

```
src/features/<domain>/
├── api.ts        ← mutation hook
└── schemas.ts    ← Zod schema that validates its input
```

### Add support for a new role

A fourth role (e.g. `super_admin`) would need:

1. A new tab param list + stack navigator.
2. A branch in [RootNavigator](src/navigation/RootNavigator.tsx).
3. Role handling in [deepLinkResolver](src/features/notifications/deepLinkResolver.ts).
4. `roles.super_admin` translation keys.
5. Backend endpoints under `/admin/*` already exist; add API hooks per
   feature.

### End-to-end worked example: adding "Mark expense as reimbursed"

Suppose we want a landlord to flip `expense.reimbursed` on an expense.

1. **Backend adds** `PATCH /expenses/:id/reimburse { reimbursed: boolean }`.
2. **Add hook** in [features/expenses/api.ts](src/features/expenses/api.ts):
   ```ts
   export function useReimburseExpense() {
     const queryClient = useQueryClient();
     return useMutation({
       mutationFn: async (input: { id: string; reimbursed: boolean }) => {
         const res = await api.patch<Expense>(`/expenses/${input.id}/reimburse`, {
           reimbursed: input.reimbursed,
         });
         return res.data;
       },
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: expenseKeys.all });
       },
     });
   }
   ```
3. **Add strings** to both locale files:
   ```json
   "reimburse": "Mark as reimbursed",
   "unreimburse": "Unmark reimbursed"
   ```
4. **Render in [LandlordExpenseDetailScreen](src/features/expenses/screens/LandlordExpenseDetailScreen.tsx):**
   ```tsx
   const reimburse = useReimburseExpense();
   <Button
     label={t(e.reimbursed ? 'expenses.unreimburse' : 'expenses.reimburse')}
     onPress={() => reimburse.mutate({ id: e.id, reimbursed: !e.reimbursed })}
     loading={reimburse.isPending}
   />;
   ```
5. **Write a test** if there's non-trivial logic. Invalidation here is simple;
   skip.

Total: ~15 lines of new code, fully typed, fully translatable.

---

## 14. Testing strategy

### What we test

- **Pure utilities** — envelope unwrap, ApiError classification, countdown
  math, date formatting.
- **Zod schemas** — every form schema gets a test for required fields,
  min-length, and cross-field rules.
- **State machine** — every role × status × pending-proposal cell.
- **Deep-link resolver** — every role's routing, including the landlord
  no-op for request IDs.
- **Type/tone mappers** — e.g. `statusTone('OPEN')` → `'accent'`.

### What we don't test (yet)

- **Screen rendering** — React Native Testing Library tests exist for the
  foundational primitives but aren't added for every screen. The bang-per-buck
  is better at the E2E layer.
- **End-to-end flows** — Maestro is the planned tool (see README device
  matrix). Wire `e2e/tenant-core.yaml`, `e2e/maintainer-core.yaml`,
  `e2e/landlord-core.yaml` against a seeded backend; run nightly.

### Adding a test

Co-locate under `__tests__/` in the same feature:

```
src/features/requests/
├── __tests__/
│   ├── stateMachine.test.ts
│   └── statusTone.test.ts
├── stateMachine.ts
└── statusTone.ts
```

Jest config ([jest.config.js](jest.config.js)) uses `jest-expo` preset with the
`@/` alias mapped. Mocks for `expo-secure-store` and `expo-notifications` live
in [jest.setup.ts](jest.setup.ts) — extend as new Expo modules get tested.

Run: `npm test` (once) or `npm run test:watch` (dev loop).

---

## 15. Known backend gaps

The client renders gracefully around these — don't try to "fix" them:

| Area                                        | State                        | UI behavior                                                                                                             |
| ------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `portfolio.summary.monthlyExpenses`         | stubbed at 0/null            | `—` placeholder + info banner on the dashboard                                                                          |
| `portfolio.summary.netIncomeDeltaPct`       | missing                      | `—` placeholder in the net-income card                                                                                  |
| `maintenance-requests.force` dedupe         | ignored server-side          | client submits without warning; if the backend later adds 409 for duplicates we'll surface it via `ApiError.isConflict` |
| `announcement.type = EMERGENCY` push bypass | not wired                    | behaves like a normal push for now — no client change needed when the backend fixes this                                |
| `notification.readAt`                       | synthesized from `createdAt` | we only display `timeAgo`, so no visible bug                                                                            |
| Cursor pagination                           | not implemented              | offset pagination (page + limit) — acceptable under ~1000 items                                                         |

When a gap is closed server-side, remove the `—` placeholder path and the info
banner. Keep the `ApiError` handling paths — they harden the UI regardless.

---

## 16. Release gates

**Pre-commit (Husky + lint-staged):**

```
npx lint-staged         # ESLint + Prettier on staged *.ts{,x} + formatting on md/json/yml
npx tsc --noEmit        # whole-project typecheck
```

**Before opening a PR:**

```
npm run typecheck
npm run lint
npm test
npx expo-doctor         # 17/17 checks
npx expo start --clear  # smoke test on iOS + Android simulators
```

**Before tagging a release:**

- Maestro E2E passes against the staging backend.
- Device matrix smoke on iPhone 15 + iPhone SE + Pixel 7 + small Android.
- Accessibility spot-check (VoiceOver on iOS, TalkBack on Android).
- Cold-start <2.5s on Pixel 7 baseline.

---

## 17. Troubleshooting

### "Cannot find module '@/...'"

TS server lost its mapping. Restart it (VS Code: Cmd-Shift-P → "TypeScript:
Restart TS Server"). If that doesn't fix it, check `tsconfig.json` still has:

```json
"baseUrl": ".",
"paths": { "@/*": ["src/*"] }
```

### Metro "Unable to resolve module"

Usually a newly installed package not picked up. Kill Metro, then:

```
npx expo start --clear
```

If the module is a native one, you need a new development build — rebuild via
`eas build --profile development` or `npx expo run:ios`.

### "Missing react-native-worklets/plugin"

Reanimated v4 needs the `react-native-worklets` peer. It's already in
`package.json`; if it's missing locally:

```
npx expo install react-native-worklets
```

### Tests fail with "Cannot find module 'babel-preset-expo'"

Dev dep missing:

```
npm install --save-dev --legacy-peer-deps babel-preset-expo
```

### Login works locally but not on Android emulator / device

Android emulator can't reach `localhost` — it points to itself. Use:

```
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/v1     # Android emulator special host
# or for a real device:
EXPO_PUBLIC_API_URL=http://<your-mac-LAN-ip>:3000/api/v1
```

### `npm run api:types` fails

`../server/openapi.generated.json` is out of date. Rebuild it on the backend:

```
cd ../server && npm run openapi:generate    # or whatever script regenerates the spec
cd -
npm run api:types
```

### 401 loop on launch

The stored token is stale. The interceptor should clear it, but if you're
stuck, nuke SecureStore:

```ts
// In dev console / LogBox:
import { secureStore } from '@/lib/secureStore';
secureStore.clearToken();
```

Or uninstall + reinstall the app on the simulator.

### "Text strings must be rendered within a <Text> component"

You're rendering a bare string somewhere it shouldn't be. Usually a stray
expression like `{someVariable && ' · '}` that evaluates to a string outside a
`<Text>`. Wrap it in `<Text>`.

---

## Further reading

- [PLAN.md](PLAN.md) — original plan document, screen inventory, endpoint map
- [README.md](README.md) — quick start, scripts, stack summary
- [`../server/PROJECT_DOCUMENTATION.md`](../server/PROJECT_DOCUMENTATION.md) — backend auth, request lifecycle, known gaps
- [`../server/BACKEND_AUDIT_REPORT.md`](../server/BACKEND_AUDIT_REPORT.md) — backend audit findings H5/H7/H8 et al.
- [`../openapi-release-a.yaml`](../openapi-release-a.yaml) — product-level spec of all 25 Release A screens
- [Figma Foundations](https://www.figma.com/design/TZ0ouZT86FcD6Xql3zRnmb/) — design tokens source of truth
