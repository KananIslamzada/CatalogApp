# UI, theming and i18n

## Theme (`src/theme/`)

- `palette.ts` holds a light and a dark `Palette`. `useTheme()` picks one from the system `useColorScheme()`, so dark mode follows the OS with no in-app toggle.
- `tokens.ts` holds `spacing`, `radius`, `typography` (semantic variants: `display`, `title`, `heading`, `body`, `bodyStrong`, `label`, `caption`) and `MAX_FONT_SCALE`.
- Styles that depend on colours are built with `useThemedStyles(createStyles)`, where `createStyles` is a module-level `(theme) => StyleSheet.create(...)`. It is memoised per theme, so styles are created once per scheme change.
- The root layout sets the system UI background and the status bar style from the active theme.

## Primitives (`src/components/ui/`)

| Component       | Notes                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Text`          | The only text component. `variant` + `tone`; font scaling stays on and is capped at `MAX_FONT_SCALE`.                   |
| `Button`        | `primary` / `secondary` / `ghost`, `loading` (spinner, `busy` + `disabled` state), spring press scale on the UI thread. |
| `IconButton`    | Round icon-only button; `accessibilityLabel` is required by its type.                                                   |
| `TextField`     | Label, animated focus/error border, error text announced as an alert, password visibility toggle.                       |
| `Screen`        | Safe-area container with the theme background.                                                                          |
| `StateView`     | Shared loading / empty / error layout with an optional action (used for retry).                                         |
| `usePressScale` | Shared Reanimated press feedback used by both buttons.                                                                  |

Rules:

- Shared values are read and written with `.get()` / `.set()` (React Compiler lint rules reject `.value` writes).
- Every Reanimated hook gets an explicit dependency array.
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
