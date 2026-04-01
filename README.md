# Maikalal - Telegram Mini App

A Telegram Mini App where users watch ads to unlock exclusive content (pictures or links).

## Overview

This project consists of two components:

| Component     | Description                        |
| ------------- | ---------------------------------- |
| **frontend**  | React-based Telegram Mini App UI   |
| **r2-worker** | Cloudflare Worker for file storage |

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Telegram      │     │   Frontend      │     │   Firebase      │
│   Mini App      │────>│   (React)       │────>│   (Firestore)   │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 │ Upload files
                                 ▼
                        ┌─────────────────┐
                        │   R2 Worker     │
                        │   (Cloudflare)  │
                        └─────────────────┘
```

## Features

- **Content Unlocking**: Users watch Monetag ads to unlock pictures/links
- **Progress Tracking**: Track ad watching progress per item
- **Favorites**: Save favorite items for quick access
- **Admin Panel**: Manage unlockables, users, and settings
- **Telegram Auth**: Seamless authentication via Telegram Mini App
- **Multi-language**: English and Bengali localization with auto-detection

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/maikalal/maikalal.github.io
cd maikalal.github.io
```

### 2. Setup R2 Worker

```bash
cd r2-worker
npm install
npx wrangler login
npx wrangler secret put API_TOKEN
npm run deploy
```

See [r2-worker/README.md](./r2-worker/README.md) for detailed setup.

### 3. Setup Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your Firebase and R2 worker config
npm run dev
```

See [frontend/README.md](./frontend/README.md) for detailed setup.

## Tech Stack

| Layer    | Technology                                       |
| -------- | ------------------------------------------------ |
| Frontend | React 18, TypeScript, Vite, DaisyUI, TailwindCSS |
| Backend  | Firebase Firestore, Firebase Auth                |
| Storage  | Cloudflare R2                                    |
| Runtime  | Cloudflare Workers (Hono)                        |
| Auth     | Telegram Mini App SDK                            |
| Ads      | Monetag SDK                                      |

## Project Structure

```
tap/
├── frontend/           # Telegram Mini App
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Page components
│   │   ├── firebase/   # Firebase integration
│   │   ├── helpers/    # Utilities
│   │   ├── i18n/       # Internationalization
│   │   ├── services/   # External service integrations
│   │   ├── css/        # Additional styles
│   │   └── types/      # TypeScript types
│   └── README.md
├── r2-worker/          # File storage service
│   ├── src/
│   │   └── index.ts    # Worker routes
│   └── README.md
└── README.md           # This file
```

## Deployment

### Frontend (GitHub Pages)

```bash
cd frontend
npm run deploy
```

### R2 Worker (Cloudflare)

```bash
cd r2-worker
npm run deploy
```

## Configuration

### Required Services

1. **Firebase Project**
   - Firestore Database
   - Anonymous Authentication

2. **Cloudflare Account**
   - R2 Bucket (`unlockables-bucket`)
   - Workers enabled

3. **Adsterra Account**
   - Smartlink URL for ads

### Environment Variables

See [frontend/.env.example](./frontend/.env.example) for all required variables.

## License

Copyright (c) 2026 Maikalal. All rights reserved.

No part of this repository may be copied, modified, redistributed, published, sublicensed, or used in any form without prior written permission from the copyright holder. See [LICENSE](./LICENSE) for details.
