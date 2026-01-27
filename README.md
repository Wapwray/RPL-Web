# RPL SharePoint List Viewer

Vite + React + TypeScript app that reads a SharePoint Online list using Microsoft Graph and delegated Microsoft Entra ID auth.

## Prerequisites

- Node.js 18+
- Microsoft Entra ID app registration

## Entra app registration

1. Create a new app registration in Entra ID.
2. Under **Authentication**, add a **Single-page application (SPA)** platform and set redirect URI to `http://localhost:5173`.
3. Under **API permissions**, add **delegated** permissions:
   - `User.Read`
   - `Sites.Read.All`
4. If `Sites.Read.All` shows **Admin consent required**, an admin must grant consent.

## Environment configuration

Create a `.env` file from `.env.example` and fill in:

- `VITE_AAD_CLIENT_ID`
- `VITE_AAD_TENANT_ID`
- `VITE_REDIRECT_URI` (default: `http://localhost:5173`)

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production (optional)

```bash
npm run build
npm start
```

This serves the built app with a minimal Express server and a `/health` endpoint.
