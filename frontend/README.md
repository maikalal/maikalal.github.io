# Maikalal - Telegram Mini App

A Telegram Mini App where users watch Adsterra ads to unlock pictures/links. Built with React, TypeScript, DaisyUI, Firebase, and Cloudflare R2.

## Features

- **Browse Unlockables**: View all available content with thumbnails
- **Search**: Find unlockables by title or description
- **Favorites**: Save favorite items for quick access
- **Ad Watching**: Watch Adsterra ads to progress toward unlocking content
- **Content Unlocking**: Unlock pictures or links after watching required ads
- **Admin Panel**: Full management dashboard for admins
- **Telegram Auth**: Seamless authentication via Telegram Mini App

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: DaisyUI + TailwindCSS
- **Backend**: Firebase (Firestore, Auth)
- **Storage**: Cloudflare R2 (via r2-worker)
- **Auth**: Telegram Mini App authentication
- **Ads**: Adsterra integration

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

# Adsterra (optional, can be set in admin settings)
VITE_ADSTERRA_URL=https://example.com/ad-link
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
│   └── UnlockableDetailModal.tsx
├── context/             # React context for global state
│   └── AppContext.tsx
├── firebase/            # Firebase configuration and services
│   ├── auth.ts
│   ├── config.ts
│   └── firestore.ts
├── helpers/             # Utility functions
│   └── upload.ts        # R2 file upload
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
│   ├── UnlockableDetailPage.tsx
│   └── UnlockedPage.tsx
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
| Adsterra URL              | Smartlink URL for ad viewing                 |
| Ad Detection Grace Period | Seconds before showing fallback claim option |
| Hide Timer UI             | Hide all timer-related UI from users         |

## Data Models

### Unlockable

- `title`, `description`, `type` (picture/link)
- `content[]` - Array of image URLs or single link
- `thumbnail`, `adsRequired`, `archived`

### User

- `telegramId`, `firstName`, `lastName`, `username`
- `photoUrl`, `role` (user/admin)

### UserUnlockable

- `userId`, `unlockableId`, `adsWatched`, `unlocked`

### AppSettings

- `adWatchThreshold`, `adsterraUrl`
- `adDetectionGracePeriod`, `hideTimerUI`

## License

Copyright (c) 2026 Maikalal. All rights reserved.

No part of this repository may be copied, modified, redistributed, published, sublicensed, or used in any form without prior written permission from the copyright holder. See [../LICENSE](../LICENSE) for details.
