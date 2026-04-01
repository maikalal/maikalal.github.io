# Maikalal - Telegram Mini App

A Telegram Mini App where users watch ads to unlock pictures/links. Built with React, TypeScript, DaisyUI, Firebase, Cloudflare R2, and Monetag SDK.

## Features

- **Browse Unlockables**: View all available content with thumbnails
- **Search**: Find unlockables by title or description
- **Favorites**: Save favorite items for quick access
- **Ad Watching**: Watch ads to progress toward unlocking content
- **Content Unlocking**: Unlock pictures or links after watching required ads
- **Admin Panel**: Full management dashboard for admins
- **Telegram Auth**: Seamless authentication via Telegram Mini App
- **TON Connect**: Wallet connection for TON blockchain
- **Multi-language**: English and Bengali localization with auto-detection
- **Maintenance Mode**: Admin-controlled maintenance overlay

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: DaisyUI + TailwindCSS
- **Backend**: Firebase (Firestore, Auth)
- **Storage**: Cloudflare R2 (via r2-worker)
- **Auth**: Telegram Mini App authentication
- **Ads**: Monetag SDK (Rewarded Interstitial, Rewarded Popup, In-App Interstitial, Direct Links)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Anonymous Authentication
4. Copy your Firebase config and add to `.env` (see `.env.example`)

### 3. Configure R2 Worker

1. Deploy the r2-worker (see `../r2-worker/README.md`)
2. Add the worker URL and token to `.env`

### 4. Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# R2 Worker Configuration
VITE_R2_WORKER_URL=https://your-worker.your-subdomain.workers.dev
VITE_UPLOAD_TOKEN=your-secret-token
```

### 5. Configure Firestore Rules

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }

    // Unlockables - public read, admin write
    match /unlockables/{unlockableId} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // User unlockables
    match /user_unlockables/{docId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // User favorites
    match /user_favorites/{docId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Settings - admin only
    match /settings/{docId} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 6. Make a User Admin

In Firebase Console, edit the user document and set `role` to `"admin"`.

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

### Firebase (Initialize & Deploy)

Initialize and deploy Firebase resources:

```bash
firebase deploy
```

This deploys:

- `firestore.rules` - Security rules
- `firestore.indexes.json` - Composite indexes
- Anonymous authentication provider (enabled in `firebase.json`)

**Note**: This can be used to initialize the Firebase project instead of using the Firebase Console UI.

### Frontend (GitHub Pages)

Deploy to GitHub Pages:

```bash
npm run deploy
```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── admin/           # Admin-specific components
│   ├── AdViewModal.tsx  # Ad watching modal
│   ├── Footer.tsx       # Bottom navigation
│   ├── Icons.tsx        # SVG icon components
│   ├── Layout.tsx       # Main layout wrapper
│   ├── SearchBar.tsx    # Search input
│   ├── UnlockableCard.tsx
│   └── UnlockableList.tsx
├── context/             # React context for global state
│   └── AppContext.tsx
├── firebase/            # Firebase configuration and services
│   ├── auth.ts
│   ├── config.ts
│   └── firestore.ts
├── helpers/             # Utility functions
│   ├── publicUrl.ts     # Public URL helper
│   └── upload.ts        # R2 file upload
├── i18n/                # Internationalization
│   ├── constants.ts     # Language mappings
│   ├── index.ts         # i18n setup
│   └── translations/    # Language files (en, bn)
├── navigation/          # Routing configuration
│   └── routes.tsx
├── pages/               # Page components
│   ├── admin/           # Admin pages
│   │   ├── AnalyticsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── UnlockableFormPage.tsx
│   │   ├── UnlockablesPage.tsx
│   │   └── UsersPage.tsx
│   ├── AllPage.tsx
│   ├── FavoritesPage.tsx
│   ├── ProfilePage.tsx
│   ├── TONConnectPage/   # TON wallet connection
│   ├── UnlockableDetailPage.tsx
│   └── UnlockedPage.tsx
├── services/            # External service integrations
│   ├── geolocation.ts   # IP-based location detection
│   └── monetag.ts       # Monetag SDK integration
├── css/                 # Additional styles
└── types/               # TypeScript type definitions
    └── index.ts
```

## How It Works

1. **Authentication**: Users are authenticated via Telegram Mini App init data
2. **Browse**: Users can browse all unlockables and search by title
3. **Watch Ads**: Click "Watch Ad" on any unlockable to open the ad viewer
4. **Progress**: After watching for the threshold duration, progress increments
5. **Unlock**: Once enough ads are watched, the content is unlocked
6. **View**: Unlocked content (pictures/links) can be viewed anytime

## Admin Features

Admins can access the Admin panel (`/admin`) to:

- **Analytics**: View stats (users, unlockables, unlocks, engagement)
- **Unlockables**: Create, edit, archive, and delete unlockables
- **Users**: View and manage users, assign admin roles
- **Settings**: Configure app-wide settings

### Settings

| Setting                   | Description                                  |
| ------------------------- | -------------------------------------------- |
| Ad Watch Threshold        | Seconds required for ad to count (1-60)      |
| Ad Detection Grace Period | Seconds before showing fallback claim option |
| Hide Timer UI             | Hide all timer-related UI from users         |
| **Primary Ad Type**      | Choose the main ad format                    |
| Direct Link URL           | URL to open for direct link ad type          |
| **Monetag SDK Config**   |                                             |
| Zone ID                   | Monetag zone ID (required for SDK ads)       |
| ymid                      | User/event tracking ID for postbacks         |
| requestVar                | Placement tracking for analytics             |
| Preload Ads               | Preload ads for faster display               |
| Ad Load Timeout           | Max seconds to wait for ad load              |
| **In-App Interstitial**   | Background ads (runs alongside primary)      |
| Enable                    | Toggle automatic background ads              |
| Frequency                 | Max ads per session (1-10)                   |
| Capping                   | Session duration in hours                    |
| Interval                  | Seconds between ads                          |
| Initial Delay             | Delay before first ad                        |
| Reset on Page Nav         | Reset session on page navigation             |
| **Maintenance Mode**      |                                              |
| Enable                    | Toggle maintenance mode overlay              |
| Message                   | Custom message to display                    |
| Allow Admins              | Let admins bypass maintenance mode           |
| **Language Settings**     |                                              |
| Default Language          | Fallback language (en/bn)                    |
| Auto Detect               | Detect language from Telegram                |
| Force Language            | Admin-forced language override              |
| IP Detection              | Detect language via geolocation             |

### Primary Ad Types

1. **Direct Link URL**: Opens any ad network URL in a new window (Adsterra, Monetag direct links, etc.)
2. **Monetag Rewarded Interstitial**: Full-screen SDK ad that resolves when completed
3. **Monetag Rewarded Popup**: Opens advertiser page in new context

## Data Models

### Unlockable

- `title`, `description`, `type` (picture/link)
- `content[]` - Array of image URLs or single link
- `thumbnail`, `adsRequired`, `archived`
- `unlockCount` - Number of users who unlocked this item
- `favoriteCount` - Number of users who favorited this item
- `createdBy` - User ID of creator

### User

- `telegramId`, `firstName`, `lastName`, `username`
- `photoUrl`, `role` (user/admin)
- `firebaseUid` - Firebase authentication UID
- `preferredLanguage` - User's language preference (en/bn)

### UserUnlockable

- `unlockableId`, `adsRequired`, `adsWatched`, `unlocked`
- `unlockedAt` - Timestamp when unlocked

### AppSettings

- `adWatchThreshold`, `adDetectionGracePeriod`, `hideTimerUI`
- `primaryAdType` - 'direct_link' | 'monetag_rewarded_interstitial' | 'monetag_rewarded_popup'
- `directLinkUrl` - URL for direct link ad type
- `monetagZoneId`, `monetagYmid`, `monetagRequestVar`, `monetagPreloadEnabled`, `monetagTimeout`
- `monetagInApp` - In-App Interstitial settings (enabled, frequency, capping, interval, timeout, everyPage)
- `maintenanceMode`, `maintenanceMessage`, `maintenanceAllowAdmins` - Maintenance mode control
- `languageSettings` - Language configuration (defaultLanguage, autoDetectLanguage, supportedLanguages, forceLanguage, enableIpDetection)
- `adsterraUrl` - Legacy field (mapped to directLinkUrl for backward compatibility)

## License

Copyright (c) 2026 Maikalal. All rights reserved.

No part of this repository may be copied, modified, redistributed, published, sublicensed, or used in any form without prior written permission from the copyright holder. See [../LICENSE](../LICENSE) for details.
