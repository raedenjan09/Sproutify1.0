# Sproutify Deployment Guide

## 1. Deploy the backend to Vercel

1. In Vercel, create a new project and set the **Root Directory** to `backend`.
2. Add the environment variables from [backend/.env.example](backend/.env.example).
3. Deploy once, then test:
   - `https://<your-backend>.vercel.app/api/v1/health`
4. Set `PUBLIC_BACKEND_URL` to that final Vercel URL so email links use the live domain.

## 2. Point the mobile app to the live backend

1. Copy [frontend/.env.example](frontend/.env.example) to `frontend/.env`.
2. Set `EXPO_PUBLIC_BACKEND_URL=https://<your-backend>.vercel.app`.
3. Make sure `frontend/google-services.json` matches the Firebase Android app for `com.sproutify.app`.

## 3. Build the Android application

### EAS cloud build

1. Install the Expo tools:
   - `npm install -g eas-cli`
2. Log in:
   - `eas login`
3. In `frontend`, install dependencies if needed:
   - `npm install`
4. Configure EAS if prompted:
   - `eas build:configure`
5. Start an installable APK build:
   - `eas build --platform android --profile preview`
6. Start a Play Store build when you are ready:
   - `eas build --platform android --profile production`

The `preview` profile now builds an APK, and `production` builds an AAB for Play Store submission.

### Local Android build

1. In `frontend`, install dependencies:
   - `npm install`
2. Build a release bundle locally:
   - `npx expo run:android --variant release`

For Play Store uploads, EAS is usually the smoother path because it handles signing more cleanly.

## 4. Important notes

- Vercel request bodies are limited, so very large image uploads can still fail even though the backend accepts up to 10 MB files.
- Password reset and email verification now work directly from the backend deployment, so you do not need a separate web frontend for those links.
- If you use Google or Facebook sign-in, the matching Firebase and OAuth credentials must also be added in `frontend/.env` and in your provider dashboards.

## 5. Android social login setup

- Current EAS release APK signing SHA-1: `94:60:46:B6:06:41:FB:52:C2:42:FC:B5:F0:0C:F5:00:7E:80:02:7E`
- Current EAS release APK signing SHA-256: `F5:E9:BA:71:40:DE:68:C9:26:04:D9:89:93:CF:73:0B:0B:CC:C5:8B:4A:02:33:B2:E9:35:09:FF:DD:8A:9D:32`
- Current EAS release Facebook key hash: `lGBGtgZB+1LCQvy18Az1AH6AAn4=`
- Local Android debug Facebook key hash: `Xo8WBi6jzSxKDVR4drqm84yr9iU=`

To make Google sign-in work on Android:
- Add the release SHA-1 and SHA-256 above to the `com.sproutify.app` Android app in Firebase.
- Download the refreshed `google-services.json`.
- Replace `frontend/google-services.json`.
- Rebuild the APK.

To make Facebook sign-in work on Android:
- Add the release Facebook key hash above in Meta for Developers for this Android app.
- Keep the package name as `com.sproutify.app`.
- Rebuild the APK after updating Meta if login still fails.
