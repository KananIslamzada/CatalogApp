# UI, theming and i18n

## Theme (`src/theme/`)

- `palette.ts` holds a light and a dark `Palette`. `useTheme()` picks one from the system `useColorScheme()`, so dark mode follows the OS with no in-app toggle.
- `tokens.ts` holds `spacing`, `radius`, `typography` (semantic variants: `display`, `title`, `heading`, `body`, `bodyStrong`, `label`, `caption`) and `MAX_FONT_SCALE`.
- Styles that depend on colours are built with `useThemedStyles(createStyles)`, where `createStyles` is a module-level `(theme) => StyleSheet.create(...)`. It is memoised per theme, so styles are created once per scheme change.
- The root layout sets the system UI background and the status bar style from the active theme.

## Primitives (`src/components/ui/`)

| Component          | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Text`             | The only text component. `variant` + `tone`; font scaling stays on and is capped at `MAX_FONT_SCALE`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `Button`           | `primary` / `secondary` / `ghost`. `loading`: the press action is never delayed; the spinner appears immediately and stays at least 300 ms, the muted tint only appears if loading lasts over 150 ms and then stays at least 450 ms (`useStableBusy`), so fast requests never flash. Forms pass `loading` only while the request is in flight, not during validation; no press action or feedback (Pressable disabled, glass made non-interactive), background eases to a muted accent (`accentMuted` / `surfaceMuted`, 180 ms via `useBusyTint`), spinner stays in the accent colour, label fades to 80%. `disabled`: dimmed to 50%. |
| `IconButton`       | Round icon-only button; `accessibilityLabel` is required by its type.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `TextField`        | Label, animated focus/error border, error text announced as an alert, password visibility toggle.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `Screen`           | Safe-area container with the theme background.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `GlassSurface`     | Liquid Glass container with a solid fallback.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `StateView`        | Shared loading / empty / error layout with an optional action (used for retry).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `usePressFeedback` | Shared press feedback for both buttons: scale 0.97 (90 ms in / 160 ms out, ease-out), resets when the button becomes disabled mid-press, and animates the dimmed opacity instead of snapping. Loading keeps full colour.                                                                                                                                                                                                                                                                                                                                                                                                              |

## Design principles

Follows Apple's interface guidance (HIG, WWDC "Designing Fluid Interfaces", "The Details of UI Typography"):

- **Response:** feedback starts on touch-down (press scale or native glass response), never on release.
- **Calm motion:** short ease-out timings with no overshoot; everything animates from its current value, so it can be interrupted.
- **Spatial consistency:** things leave the way they came (e.g. the login banner enters downward and exits upward).
- **No layout jumps:** appearing content fades, and its siblings move with `layoutTransition`.
- **Inline validation:** fields validate when they lose focus and then as the user types (`mode: 'onTouched'`), not only on submit.
- **Haptics only at meaningful moments** (`lib/haptics.ts`): success, warning (invalid submit), error (failed request), selection/light for toggles. Fired on the same frame as the visual change.
- **Typography:** system font, Dynamic Type on (capped at 2×), tracking by size: negative on large text, near zero on body, slightly positive on captions.
- **Android text under transforms:** pressable surfaces set `renderToHardwareTextureAndroid` while enabled, so the press scale animates a GPU texture instead of re-laying out text every frame (no glyph jitter). Turned off while loading/disabled so the spinner and tint still animate.
- **Font scaling:** `Text` sets `includeFontPadding: false` (Android centres text without extra padding); `TextField` inputs have no fixed `lineHeight` (Android clips it); button labels can shrink and wrap; icons follow the font scale up to 1.5× via `useScaledSize`. Verified on an Android emulator at font scale 2.0.
- **Accessibility settings:** Reanimated animations follow the system Reduce Motion setting by default; Reduce Transparency turns all glass solid (`useGlassEnabled`).

## Native feel: Liquid Glass

- `lib/glass.ts` exports `canUseGlass` (iOS with Liquid Glass, iOS 26+, computed once) and `useGlassEnabled()`, which also turns glass off while the user has **Reduce Transparency** on. It uses one shared `AccessibilityInfo` subscription, not one per button. Components use the hook.
- `Button` (primary/secondary) and `IconButton` (`filled`) render an interactive `GlassView` tinted with the variant colour, same as vyra's `BasePress`:
  - the content sits in a `pointerEvents="none"` view so every touch reaches the glass and its native press effect plays across the whole button;
  - no JS press animation runs on glass (it would fight the native effect); a disabled glass button is simply dimmed;
  - the glass radius is read from the final flattened style, so a `borderRadius` override still matches.
- `GlassSurface` is the shared container for floating chrome (pills, toolbars, panels): `GlassView` on iOS 26+, a themed surface with a hairline border elsewhere.
- Use glass where iOS itself would (buttons, floating controls, tab bar, search, overlays over content), not for whole screens or list rows.

Motion (`theme/motion.ts`): `layoutTransition` (200 ms ease-out `LinearTransition`), `fadeIn` (180 ms), `fadeOut` (120 ms), `easeOut`. Springs are avoided: short eased timings feel calmer and never overshoot.

Rules:

- Anything that can appear or disappear (errors, banners, spinners) uses `entering` / `exiting`, and every sibling whose position depends on it gets `layout={layoutTransition}`, so the screen never jumps.

- Shared values are read and written with `.get()` / `.set()` (React Compiler lint rules reject `.value` writes).
- React hooks get a complete dependency array; Reanimated worklet hooks get none (the Babel plugin captures closures; a deps array is web-only and warns on native).
- Icons come from `lucide-react-native` and take colours from the theme.
- Interactive elements set `accessibilityRole`, `accessibilityLabel` and `accessibilityState`.

## i18n (`src/i18n/`)

- English (`en.json`, source of truth) and Azerbaijani (`az.json`). `Record<Locale, Dictionary>` makes a missing key in `az.json` a type error.
- `TranslationKey` is the dotted-path union of `en.json`, so `t('common.retyr')` does not compile.
- `useTranslation()` re-renders on device language change (`useLocales`). `t()` is the non-React version.
- `{name}` placeholders are filled from the `params` argument.
- Lookup order: active locale → English → the key itself.

## Testing notes

- Jest uses `react-native-reanimated/jest/resolver` and `setUpTests()` from Reanimated in `jest.setup.ts`.
- `lucide-react-native` is mapped to its CommonJS build in Jest (`moduleNameMapper`).
- Testing Library v14 is async: `await render(...)`, `await fireEvent.press(...)`.
