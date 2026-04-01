# R2 Worker - File Storage Service

A Cloudflare Worker for storing and serving unlockable content files (images) using Cloudflare R2.

## Overview

This worker provides a simple API for uploading, retrieving, and deleting files from an R2 bucket. It's designed to work with the Unlockables Telegram Mini App frontend.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Storage**: Cloudflare R2

## Endpoints

| Method   | Endpoint     | Description     | Auth     |
| -------- | ------------ | --------------- | -------- |
| `POST`   | `/upload`    | Upload a file   | Required |
| `GET`    | `/file/:key` | Retrieve a file | Public   |
| `DELETE` | `/file/:key` | Delete a file   | Required |
| `GET`    | `/`          | Health check    | Public   |

### Upload File

```bash
curl -X POST https://your-worker.workers.dev/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.jpg"
```

Response:

```json
{
  "success": true,
  "url": "https://your-worker.workers.dev/file/1234567890-abc123.jpg",
  "key": "1234567890-abc123.jpg"
}
```

### Retrieve File

Files are served with `Cache-Control: public, max-age=31536000` for optimal caching.

```bash
curl https://your-worker.workers.dev/file/1234567890-abc123.jpg
```

## Setup

### 1. Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to R2 Object Storage
3. Create a bucket named `unlockables-bucket`

### 2. Configure Worker

1. Install dependencies:

   ```bash
   npm install
   ```

2. Login to Cloudflare:

   ```bash
   npx wrangler login
   ```

3. Set the API token secret:
   ```bash
   npx wrangler secret put API_TOKEN
   ```

### 3. Deploy

```bash
npm run deploy
```

## Development

```bash
npm run dev
```

The worker will be available at `http://localhost:8787`.

## Configuration

### Environment Variables

| Variable    | Description                               | Required |
| ----------- | ----------------------------------------- | -------- |
| `API_TOKEN` | Bearer token for upload/delete operations | Yes      |

### wrangler.jsonc

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "r2-worker",
  "main": "src/index.ts",
  "compatibility_date": "2026-03-17",
  "observability": {
    "enabled": true
  },
  "compatibility_flags": [
    "nodejs_compat"
  ],
  "r2_buckets": [
    {
      "binding": "BUCKET",
      "bucket_name": "unlockables-bucket"
    }
  ]
}
```

## Project Structure

```
src/
├── index.ts      # Main worker code with routes
├── types.ts      # TypeScript type definitions
└── endpoints/    # Unused chanfana template endpoints (can be removed)
```

## Security

- Upload and delete operations require Bearer token authentication
- File retrieval is public (no auth required)
- CORS is enabled for all routes
