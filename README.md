# Catalog

React Native (Expo) app for browsing the DummyJSON product catalogue with search, product details, deep links and offline favourites.

## Requirements

- Node 20+
- Xcode 26+ (iOS) / Android Studio with an emulator (Android)
- [Maestro](https://maestro.mobile.dev) for end-to-end tests

## Configuration

Copy `.env.example` to `.env` to override the API URL or the token lifetime (set `EXPO_PUBLIC_TOKEN_LIFETIME_MINS=1` to see token refresh quickly).

## Run

```bash
npm install
npm run ios
npm run android
```

## Deep links

```bash
xcrun simctl openurl booted "catalog://product/42"
adb shell am start -W -a android.intent.action.VIEW -d "catalog://product/42" com.catalogapp.mobile
```

When signed out, the app shows the login screen first and opens the product right after signing in.

## Quality gates

```bash
npm run lint
npm run typecheck
npm test
npm run check
```

Architecture notes live in [`docs/architecture`](docs/architecture/overview.md).
