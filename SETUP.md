# SanatanSevaSetu — Setup & Run Guide

How to install everything and run the app on Web, Android, and iOS.

## 1. Software requirements

Install these **before** you touch the project:

| Tool | Minimum version | Where to get it | Why you need it |
|------|----------------|-----------------|-----------------|
| **Node.js** | 20.x LTS (or 22.x) | https://nodejs.org | Required by Expo SDK 56. Comes bundled with `npm` and `npx`. |
| **Git** | any recent | https://git-scm.com | For version control (project is not yet a repo, but you'll want it). |
| **VS Code** (recommended) | latest | https://code.visualstudio.com | Editor. Install the **Expo Tools** and **ESLint** extensions. |
| **Expo Go** app | latest | App Store / Play Store | Run the app on your physical phone without building. |

### Optional (only if you want to build a real native app)

| Tool | Needed for |
|------|-----------|
| **Android Studio** (latest) + Android SDK + an emulator (Pixel 7, API 34+) | Running on Android emulator or building APKs |
| **Xcode** (latest, macOS only) + iOS Simulator | Running on iOS simulator (Mac only) |
| **EAS CLI** (`npm i -g eas-cli`) | Cloud builds via Expo Application Services |

### Verify the installs

```powershell
node --version    # → v20.x or v22.x
npm --version     # → 10.x+
npx --version     # → 10.x+
git --version
```

If `node --version` is below 20, upgrade — Expo SDK 56 will not run on older Node.

## 2. Install project dependencies

From PowerShell or Terminal:

```powershell
cd D:\2026\Freelancing\SanatanSevaSetu
npm install
```

This downloads `node_modules/` (~500 MB). Takes 1–3 minutes on a good connection.

If you see vulnerability warnings, ignore them for now — they are upstream issues in dependencies. Do NOT run `npm audit fix --force` (it can break Expo).

## 3. Run the app

The `package.json` defines these scripts:

| Command | What it does |
|---------|--------------|
| `npm start` | Starts the Expo dev server with a QR code for Expo Go |
| `npm run web` | Opens the app in your browser (fastest dev loop) |
| `npm run android` | Opens on Android emulator or connected device |
| `npm run ios` | Opens on iOS simulator (Mac only) |
| `npm run lint` | Type-checks and lints with Expo's ESLint config |
| `npm run reset-project` | Wipes `src/app/` back to a blank starter — **don't run this**, it destroys our screens |

### Easiest path: run on the web

```powershell
cd D:\2026\Freelancing\SanatanSevaSetu
npm run web
```

A browser tab opens at `http://localhost:8081`. Edit a file under `src/` and it reloads instantly.

### Run on your phone

1. Install **Expo Go** from the App Store or Play Store.
2. Run `npm start` in the project folder.
3. A QR code appears in the terminal.
   - **Android**: open Expo Go → tap "Scan QR code" → scan.
   - **iOS**: open the iPhone camera → point at the QR → tap the popup.
4. The app loads. Shake the phone to open the dev menu.

Note: phone and laptop must be on the same Wi-Fi network. If they're not, run `npm start --tunnel` to route through Expo's tunnel.

### Run on Android emulator

1. Open Android Studio → Device Manager → start your emulator.
2. `npm run android` — Expo detects the emulator and launches.

### Run on iOS simulator (Mac only)

1. `npm run ios` — Expo opens the simulator and installs the app.

## 4. Project layout (quick map)

```
SanatanSevaSetu/
├── AI_CONTEXT.md          # Project context for AI assistants — READ THIS
├── SETUP.md               # This file
├── app.json               # Expo config — slug, splash, plugins
├── package.json           # Scripts and dependencies
├── tsconfig.json          # TypeScript config + @/ path alias
├── assets/
│   └── images/
│       └── logo.png       # The Sanatan Seva Setu banner
└── src/
    ├── app/               # Screens (file-based routing)
    │   ├── _layout.tsx
    │   ├── index.tsx          # Choose Language
    │   ├── sign-in.tsx        # Mobile number → Send OTP
    │   └── verify-otp.tsx     # 6-digit OTP → Verify
    ├── components/
    ├── constants/
    │   ├── languages.ts
    │   └── theme.ts
    └── i18n/
        ├── translations.ts        # Text in en/hi/gu/mr
        └── LanguageContext.tsx    # useT() / useLanguage() hook
```

Open `AI_CONTEXT.md` first if you want a deeper architectural overview.

## 5. Useful dev-menu shortcuts

Inside Expo Go or a dev build:

| Key in terminal | Action |
|-----------------|--------|
| `r` | Reload the app |
| `m` | Open the dev menu |
| `j` | Open the JS debugger in Chrome |
| `o` | Open in browser/editor |
| `?` | Show all keys |

## 6. Common problems

### "Cannot determine the project's Expo SDK version"
You ran `expo start` from the wrong directory. `cd` into `D:\2026\Freelancing\SanatanSevaSetu` first.

### "Port 8081 already in use"
Another Metro server is running. Either kill it (Task Manager → end `node.exe`) or start on a different port:
```powershell
npx expo start --web --port 8090
```

### "Unable to resolve module @/foo"
The `@/` alias points to `src/`. Make sure your import path lives under `src/` and you typed `@/path/to/file` correctly (case-sensitive).

### "Devanagari/Gujarati text shows as boxes"
The system font on your dev machine is missing those scripts. The app itself is fine — install the relevant language pack on the OS, or test on a phone (mobile OSes have these fonts built in).

### Hot reload stops working
Press `r` in the Expo terminal to force a reload, or save the file again.

## 7. Building for release (later)

Not needed for development. When you're ready to ship:

```powershell
npm i -g eas-cli
eas login
eas build --platform android   # builds an AAB / APK in the cloud
eas build --platform ios       # builds an IPA (requires Apple Developer account)
```

See https://docs.expo.dev/build/setup/ for the full guide.

## 8. Where to ask

- Expo docs (pinned to our SDK): https://docs.expo.dev/versions/v56.0.0/
- expo-router docs: https://docs.expo.dev/router/introduction/
- React Native docs: https://reactnative.dev/docs/getting-started

That's it — `cd` into the folder, `npm install`, `npm run web`, and you're developing.
