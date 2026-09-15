# Before shipping to the App Store / Play Store

Action items from the Google/Apple sign-in + Capacitor packaging work. None of these block local development — only a real store submission.

## 1. Google OAuth credentials
- Create an OAuth Client ID (Web application type) in Google Cloud Console → APIs & Services → Credentials.
- Add `http://localhost:5173` and your production origin under "Authorized JavaScript origins".
- Set `VITE_GOOGLE_CLIENT_ID` in `todo-client/.env.local` (see `todo-client/.env.example`).
- Set `Google__ClientId` in `docker-compose.yml` (or the real deployment's env config) to the same value.

## 2. Apple Sign-In credentials
- Requires a paid Apple Developer Program membership.
- Create a Services ID in Apple Developer → Certificates, IDs & Profiles → Identifiers.
- Register a verified HTTPS domain + return URL under that Services ID — Apple's Sign-In JS refuses to run on `http://localhost`, so this leg can't be tested until a real domain exists.
- Set `VITE_APPLE_CLIENT_ID` and `VITE_APPLE_REDIRECT_URI` in `todo-client/.env.local`.
- Set `Apple__ClientId` in the deployment env config.

## 3. iOS build needs a Mac
- `todo-client/ios/App.xcodeproj` is scaffolded but Xcode doesn't run on Windows.
- Once on a Mac (or a macOS CI runner like Codemagic / GitHub Actions macOS / EAS): `npm run cap:ios` to open and build.
- Android *can* be built here once Android Studio is installed (Java 17 is already present; `ANDROID_HOME` isn't set yet).

## 4. Rename the app — trademark issue
- The header still literally reads "✅ Todoist" (`todo-client/src/App.jsx`, `todo-client/src/components/AuthScreen.jsx`) — that's Doist's registered product name.
- Fine for local dev; must change before any real store listing or public deployment.

## 5. Replace the placeholder App ID
- `todo-client/capacitor.config.json` currently has `com.example.todoapp`.
- Needs to become a bundle ID you actually own before submitting to either store — changing it later means re-registering the app in both Play Console and App Store Connect.

## 6. Remove the Android cleartext-traffic allowance
- `android/app/src/main/AndroidManifest.xml` has `android:usesCleartextTraffic="true"`, added so the app can reach a plain-HTTP dev API.
- Remove it once the API is served over real HTTPS — shipping it as-is would let the app talk to any HTTP endpoint, not just yours.

## 7. Rotate the JWT signing keys
- The two `Jwt__Key` values (in `docker-compose.yml` and `TodoApi/appsettings.Development.json`) were generated for local dev and are sitting in plaintext in the repo.
- Generate a fresh secret for any real deployment and keep it out of source control (env var / secrets manager).
