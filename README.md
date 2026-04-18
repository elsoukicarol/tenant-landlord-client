# Habitare Mobile

Expo + React Native client for the Habitare tenant–landlord platform. Ships as a
single app with role-dispatched shells for tenants, maintainers, and landlords.

- Backend: `../server` (NestJS, REST at `/api/v1`)
- Design system: [Figma · Habitare v1.0](https://www.figma.com/design/TZ0ouZT86FcD6Xql3zRnmb/)
- Plan: [PLAN.md](PLAN.md)
- **Developer guide** (architecture, patterns, recipes): [DEVELOPING.md](DEVELOPING.md)

## Stack

- **Expo SDK 54** (managed) · React Native 0.81 · React 19 · TypeScript strict
- **Navigation:** React Navigation v7 (native-stack + bottom-tabs), role-dispatched root navigator
- **Server state:** TanStack Query v5 (`useInfiniteQuery` for paginated lists)
- **Client state:** Zustand (auth only — token, user, hydrate, signOut)
- **Forms:** React Hook Form + Zod (i18n-keyed error messages)
- **Styling:** NativeWind + Tailwind 3, theme tokens mirror the Figma foundations
- **Secure storage:** `expo-secure-store` for the JWT (never `AsyncStorage`)
- **Push:** `expo-notifications` + FCM; payload `data.deepLink` routes to the right screen
- **i18n:** `i18n-js` with Spanish default (backend `user.language` column)
- **Types:** generated from `../server/openapi.generated.json` via `openapi-typescript` (`npm run api:types`)

## Prerequisites

- Node 20+
- npm 10+
- Xcode 15+ (iOS simulator)
- Android Studio with an emulator image (Pixel 7 on API 34 is the QA baseline)
- A running backend: `cd ../server && npm run start:dev`

## Getting started

```bash
npm install
npm run api:types           # regenerate TS types from the backend OpenAPI spec
cp .env.example .env        # then edit to point at your backend
npm start                   # launches Metro; open iOS / Android from the menu
```

**LAN development**: set `EXPO_PUBLIC_API_URL` to your machine's LAN IP (not `localhost`)
so simulators on other machines can reach it.

## Scripts

| Command                           | What it does                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------- |
| `npm start`                       | Metro dev server                                                                |
| `npm run ios`                     | Launch iOS simulator                                                            |
| `npm run android`                 | Launch Android emulator                                                         |
| `npm run typecheck`               | `tsc --noEmit` — required before commit                                         |
| `npm run lint` / `lint:fix`       | ESLint (flat config, Expo + TanStack Query rules)                               |
| `npm run format` / `format:check` | Prettier                                                                        |
| `npm test`                        | Jest (unit + hook tests)                                                        |
| `npm run test:watch`              | Jest in watch mode                                                              |
| `npm run test:ci`                 | Jest with coverage                                                              |
| `npm run api:types`               | Regenerate `src/api/types.generated.ts` from `../server/openapi.generated.json` |

Pre-commit (Husky + lint-staged) runs ESLint + Prettier on staged files and
`tsc --noEmit` on the whole project.

## Project layout

```
src/
├── api/           # axios client, envelope unwrap, ApiError, generated types
├── components/ui/ # Button, Input, Chip, Pill, Card, Banner, Screen, Text, Skeleton…
├── features/
│   ├── auth/      # login, /auth/me, forgot/reset, invitation accept, store
│   ├── requests/  # list, detail, create, schedule proposals, sign-off, resolve
│   ├── announcements/
│   ├── expenses/
│   ├── buildings/
│   ├── portfolio/ # landlord dashboard
│   ├── invitations/
│   ├── notifications/  # feed + deep-link resolver + push handler
│   ├── devices/   # push token registration
│   └── profile/
├── hooks/
├── lib/           # i18n, secureStore, date, format, env
├── locales/       # es.json (default), en.json
├── navigation/    # RootNavigator + per-role tab nav + typed param lists
└── theme/         # tokens + typography
```

**Rules:**

- Every API call is typed end-to-end. No `any` at the network boundary.
- Every touchable has `accessibilityLabel`/`accessibilityRole`; min tap target 44×44
  (or `hitSlop` when the visual target is smaller).
- Every user-visible string comes from `src/locales/*.json` via `t('key')`.
- Server state lives in TanStack Query; `authStore` is the only place that
  mirrors server data (user is cached locally so the root navigator can
  dispatch before `/auth/me` responds).

## Auth flow

1. Boot → `authStore.hydrate()` reads the token from SecureStore.
2. If present → `<SessionBootstrapper />` fetches `/auth/me`. 401 → global sign-out.
3. On login → store JWT in SecureStore → best-effort `POST /devices` with the Expo push token.
4. On logout → `DELETE /devices/:token` → `POST /auth/logout` → clear store.
5. On 423 → `LockoutBanner` reads `details.lockout_until` from `ApiError` and
   counts down in `mm:ss`.

## Deep links

Scheme: `habitare://` (also `https://habitare.app`).

| URL                          | Target                                           |
| ---------------------------- | ------------------------------------------------ |
| `habitare://sign-in`         | SignInScreen                                     |
| `habitare://forgot-password` | ForgotPasswordScreen                             |
| `habitare://reset/:token`    | ResetPasswordScreen                              |
| `habitare://invite/:token`   | InvitationAcceptScreen (auto-signs in on accept) |

Push notifications carry a `data.deepLink` object; `pushHandler.ts` parses it
and routes via the central `resolveDeepLink(link, nav, role)`. Tap events are
handled in all three states (foreground / background / cold launch).

## Known backend gaps (render gracefully)

| Field                                          | Current state                                 | UI behavior                                         |
| ---------------------------------------------- | --------------------------------------------- | --------------------------------------------------- |
| `portfolio.summary.monthlyExpenses`            | stubbed at 0/null                             | `—` placeholder + info banner on the dashboard      |
| `portfolio.summary.netIncomeDeltaPct`          | missing                                       | `—` placeholder in the net-income card              |
| `maintenance-requests.force` (duplicate check) | ignored server-side                           | client always submits without warning               |
| `announcement.type = EMERGENCY` push bypass    | not wired                                     | behaves like a normal push for now                  |
| `notification.readAt`                          | synthesized from `createdAt` when `read=true` | we only display `timeAgo`, so no visible regression |

See `../server/PROJECT_DOCUMENTATION.md` §11 and `../server/BACKEND_AUDIT_REPORT.md`.

## Testing

- **Unit + hook tests:** Jest with `jest-expo` preset. State machine derivers,
  envelope unwrap, ApiError classification, date/countdown, Zod schemas,
  deep-link resolver — all covered.
- **E2E (planned):** Maestro flows in `e2e/` for each role's core loop. Wire
  these into CI against a seeded backend before GA.

## Device matrix (QA)

Run the tenant, maintainer, and landlord core loops on each:

- iPhone 15 (iOS 17)
- iPhone SE 3rd gen (small screen; watch for overflow)
- Pixel 7 (Android 14)
- Small Android (e.g. Pixel 4a) — verify no layout drift on 5.8" screen

## Release gates

Before every commit:

```bash
npm run typecheck && npm run lint && npm test
```

Before every PR:

```bash
npx expo-doctor            # 17/17 checks must pass
npx expo start --clear     # smoke test on both simulators
```
