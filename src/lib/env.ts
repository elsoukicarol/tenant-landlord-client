// Expo statically inlines `process.env.EXPO_PUBLIC_*` at build time, so each
// variable must be referenced by literal name — no dynamic key access.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const ENVIRONMENT = process.env.EXPO_PUBLIC_ENVIRONMENT ?? 'development';

export const env = {
  apiUrl: API_URL,
  environment: ENVIRONMENT,
} as const;

export const isProduction = env.environment === 'production';
