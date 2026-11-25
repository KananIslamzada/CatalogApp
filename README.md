# Catalog

React Native (Expo) app for browsing the DummyJSON product catalogue with search, product details, deep links and offline favourites.

## Requirements

- Node 20+
- Xcode 26+ (iOS) / Android Studio with an emulator (Android)
- [Maestro](https://maestro.mobile.dev) for end-to-end tests

## Run

```bash
npm install
npm run ios
npm run android
```

## Quality gates

```bash
npm run lint
npm run typecheck
npm test
npm run check
```

Architecture notes live in [`docs/architecture`](docs/architecture/overview.md).
