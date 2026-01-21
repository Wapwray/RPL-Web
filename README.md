# SharePoint List Web App

Static HTML/JavaScript frontend with a Node.js server that reads a SharePoint List via Power Automate.

## Prerequisites

- Node.js 18+
- Power Automate flow with an HTTP trigger that returns list data

## Setup

1. Create a `.env` file from `.env.example` and fill in values.
2. Install dependencies:
   - `npm install`
3. Start the server:
   - `npm start`
4. Open `http://localhost:3000`.

## Local Mock Mode

To test locally without SharePoint credentials:

1. Set `SP_MOCK=true` in `.env`.
2. Start the server with `npm start`.
3. The API will return sample data from `data/sample-items.json`.

## Power Automate Output Shape

The flow should return JSON in one of these shapes:

- `{ "items": [ ... ] }`
- `[ ... ]`
