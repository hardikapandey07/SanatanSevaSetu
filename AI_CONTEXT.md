# SanatanSevaSetu — AI Context

Read this first when working on this project. It tells you what the app is, how it's structured, and the conventions you must follow.

## What this is

**Sanatan Seva Setu** — a spiritual mobile app for Indian users (Hindu devotion / temple services theme). Built with **Expo SDK 56** + **expo-router**. Targets iOS, Android, and web from a single codebase.

Brand tagline (in the logo): *"Bridging Devotion, Connecting Lives"*.
In-app tagline below the brand: *"सेवा से, सबके लिए"*.

The owner of this project is **Hardik Pandey** (hardik.apandey@motilaloswal.com). The project lives at `D:\2026\Freelancing\SanatanSevaSetu` and is currently NOT in a git repo of its own.

## Tech stack — locked versions, do not bump casually

- **Expo SDK 56** (very new — APIs changed from SDK 53). See https://docs.expo.dev/versions/v56.0.0/ before writing any Expo code.
- **expo-router 56** with file-based routing under `src/app/`
- **React 19.2.3** + **React Native 0.85.3** + **react-native-web 0.21**
- **TypeScript 6** with strict mode and path alias `@/*` → `src/*`
- **React Compiler** is ON (`experiments.reactCompiler: true` in `app.json`) — avoid manual `useMemo`/`useCallback` unless needed
- **typedRoutes** is ON — `router.push('/foo')` is type-checked

Installed libraries:
- `expo-linear-gradient` — header gradients (orange→darker orange, peach→cream), CTA gradients
- `expo-image` for the logo, `expo-symbols` for icons (SF Symbols on iOS, Material on Android/web)
- `@react-native-async-storage/async-storage` — i18n persists language choice (becomes `localStorage` on web)
- `react-native-safe-area-context` — wrap header/footer with `<SafeAreaView edges={[...]} />`

## Directory layout

```
src/
├── app/                       # expo-router screens (file-based routing)
│   ├── _layout.tsx            # Root Stack — wraps tree in <LanguageProvider> + <ThemeProvider>
│   ├── index.tsx              # Screen 1: Select Language (dropdown UI)
│   ├── register.tsx           # Screen 2: combined Name + Mobile + inline OTP + Referral + Register
│   └── (tabs)/                # Tab group, mounted after register
│       ├── _layout.tsx        # Bottom tabs with custom tabBar (Home, Services, Events, Profile)
│       ├── home.tsx           # Dashboard: orange header, search, role cards, quick access, live, events
│       ├── services.tsx       # Placeholder
│       ├── events.tsx         # Placeholder
│       └── profile.tsx        # Placeholder
├── components/                # ThemedText, ThemedView, etc. (from Expo starter)
├── constants/
│   ├── languages.ts           # 4 supported languages + LANGUAGE_LABEL pill text
│   └── theme.ts               # Colors (light/dark), Fonts, Spacing
├── i18n/
│   ├── translations.ts        # Dictionary keyed by lang → string keys (satisfies parity check)
│   └── LanguageContext.tsx    # <LanguageProvider>, useLanguage(), useT() + AsyncStorage persistence
├── hooks/                     # use-color-scheme, use-theme
└── global.css                 # CSS variables for web fonts
assets/
└── images/
    ├── logo.png               # The Sanatan Seva Setu banner (used on register & home header)
    └── (Expo starter icons)
```

## Brand colors (BRAND constant — duplicated per-screen, intentional)

```ts
primary:    '#E8731C'  // orange — buttons, selected state, links, badges
primaryDark:'#C95A0E'  // gradient bottom, dark amber accents
amber:      '#D89216'  // (older OTP screen — may still appear in archived patches)
peach:      '#FCD9A8'  // header gradient top (older screens)
cream:      '#FFF6E9'  // soft background (older screens)
bg:         '#F7F4EE'  // home dashboard background
card:       '#FFFFFF'
border:     '#EFE7D7'  // card borders
iconBg:     '#FFF1DE'  // circular icon container background (live services)
liveBg:     '#FDE2D0'  // "Live Now" / "Starting Soon" badge background
liveText:   '#C95A0E'  // badge text
text:       '#1F1A14'
textSecondary: '#6B6258'
```

Each screen defines its own local `BRAND` object. If you need a global token, add it to `src/constants/theme.ts` — don't centralize prematurely.

## Supported languages — exactly 4

Defined in `src/constants/languages.ts`:
- `en` — English
- `hi` — हिन्दी
- `gu` — ગુજરાતી
- `mr` — मराठी

**Do not add more** unless the user explicitly asks. He trimmed an earlier 10-language list down to these.

## i18n pattern — MUST follow

1. Add a key to ALL 4 language blocks in `src/i18n/translations.ts`. TypeScript will error if you miss one (the `satisfies` clause enforces parity).
2. In a component:
   ```tsx
   import { useT } from '@/i18n/LanguageContext';
   const t = useT();
   <Text>{t('myKey')}</Text>
   ```
3. To read or change current language: `const { lang, setLang } = useLanguage();`
4. The choice is persisted under AsyncStorage key `sss.lang`.
5. NEVER hardcode user-facing strings — always go through `t()`. This includes content like event names ("Spiritual Webinar", "Chanting Program") which are keys today but should move to a backend later.

The provider is wired at the root in `src/app/_layout.tsx`. First paint may briefly flash English before AsyncStorage resolves — acceptable for now.

## Routes & screen status

| Route | Status | Notes |
|-------|--------|-------|
| `/` (index) | ✅ Built | Language picker — logo card, "Select Language" title, dropdown trigger that opens an inline list of the 4 languages. "Continue" navigates to `/register`. |
| `/register` | ✅ Built | Single-page registration: small logo + "Register / अपना खाता बनाएं" header, Name, Mobile Number, OTP Verification (with inline **Send OTP** button that switches to a 30s `Resend in Ns` countdown then `Resend OTP`), Referral Code (Optional), and **Register** button that activates only when name (>1 char) + mobile (10 digits) + OTP (6 digits) are all valid. On submit: `router.replace('/(tabs)/home')`. |
| `/(tabs)/home` | ✅ Built | Dashboard. Orange→darker-orange gradient header with brand row + search bar. Below: two role cards ("Register as Pandit / Offer Services" and "Register as Yajman / Book Services"), Quick Access grid (Pandit Search, Temple Search, Book Pooja, Healing, Sanskrit Learning), Live Services rows (Live Aarti with "Live Now" badge, Live Katha with "Starting Soon" badge), Upcoming Events with "View All" link and 3 mock event cards. None of the inner Pressables route anywhere yet — they're shells. |
| `/(tabs)/services` | 🟡 Stub | Centered title only. |
| `/(tabs)/events` | 🟡 Stub | Centered title only. |
| `/(tabs)/profile` | 🟡 Stub | Centered title only. |

The Register button on `/register` and the language Continue button both navigate; the role cards, quick-access cards, live rows, event cards, and View All link are non-interactive shells waiting for designs / endpoints.

## Tabs architecture — IMPORTANT (changed twice)

Earlier versions of this doc said "don't add tabs back". That guidance was **overridden** when the Home dashboard design arrived. The current architecture:

- Onboarding (`/`, `/register`) is a plain **Stack** with no tabs.
- After `/register` succeeds, we `router.replace('/(tabs)/home')` — this swaps to the tab group.
- The tab group lives in `src/app/(tabs)/` and uses **`Tabs` from `expo-router`** with a custom `tabBar` prop in `(tabs)/_layout.tsx`.
- Tab bar is a single `Pressable` per route in a `<SafeAreaView edges={['bottom']}>` — orange icon/label when focused, gray when not.
- Icons use `SymbolView` with iOS/Android/web names.

If a new screen needs the tab bar, put it in `src/app/(tabs)/`. Non-tab screens (modals, deeper flows) go directly under `src/app/`.

## Conventions

- **Press handlers** use React Native `<Pressable>` with `style={({ pressed }) => [...]}` — don't use `<TouchableOpacity>`.
- **Inputs**: include `inputMode` + `keyboardType` together; strip non-digits with `.replace(/\D/g, '')` for numeric fields.
- **Web outline**: TextInput on web shows a default outline. Suppress via `...(Platform.OS === 'web' ? ({ outlineWidth: 0 } as object) : null)`.
- **Gradients**: header gradients are vertical (`{x:0,y:0}` → `{x:0,y:1}`); CTAs are horizontal (`{x:0,y:0}` → `{x:1,y:0}`).
- **Icons**: use `<SymbolView name={{ ios, android, web }} ... />`. Always provide all three platform names.
- **Logos**: `<Image source={require('@/assets/images/logo.png')} contentFit="contain" />` — `expo-image`, not `react-native`'s Image.
- **Safe area**: wrap top section in `<SafeAreaView edges={['top']} />` and the footer in `<SafeAreaView edges={['bottom']} />`. Don't double-wrap.
- **Registering screens**: routes are headerless (`headerShown: false`). Add new screens by creating a file under `src/app/` and (for non-tab routes) registering a `<Stack.Screen name="…" />` in `src/app/_layout.tsx`.

## Critical do-nots

- ❌ Do NOT bump Expo / RN / React versions without confirming SDK 56 compatibility.
- ❌ Do NOT introduce styling libraries (NativeWind, Tamagui, unistyles). Stick with `StyleSheet.create`.
- ❌ Do NOT install i18next or similar. The homegrown context in `src/i18n/` is intentional.
- ❌ Do NOT use `TouchableOpacity` or React Native's `Image`. Use `Pressable` and `expo-image`.
- ❌ Do NOT hardcode user-facing text — every string goes through `t()`. Forgetting this is a regression.
- ❌ Do NOT bring back the deleted `sign-in.tsx` / `verify-otp.tsx` screens — they were merged into `/register`.

## Known design references

The user shares designs as screenshots pasted into chat (he sometimes references a Figma site preview at `https://best-taffy-76713165.figma.site/`, but that's JS-rendered and can't be parsed). Logo banner lives at `assets/images/logo.png` (originally provided by him at `C:\Users\pande\Downloads\SanatanBanner.png`).

When pixel-precision matters, ask for the original Figma file URL (`figma.com/design/...`) or PNG exports.

## Next likely screens (not yet built)

When his Figma designs continue, expect:
- Deep-linked screens for each Quick Access tile (Pandit Search list, Temple Search map/list, Book Pooja flow, Healing categories, Sanskrit Learning lessons)
- "Register as Pandit" and "Register as Yajman" profile flows
- Live stream player (when Live Aarti / Live Katha is tapped)
- Upcoming Event detail + booking
- Filled-in Services / Events / Profile tabs

Follow the existing patterns: localized strings, BRAND palette, Pressable + LinearGradient CTAs, put tab-bar screens under `(tabs)/`, put modals/deep flows under `src/app/`, register them in the appropriate `_layout.tsx`.

## See also

- [SETUP.md](SETUP.md) — install steps, software requirements, how to run
- `app.json` — Expo config (slug, splash, plugins, experiments)
- `AGENTS.md` / `CLAUDE.md` — reminder to read SDK 56 docs before writing Expo code
