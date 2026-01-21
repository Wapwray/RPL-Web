const path = require("path");
const fs = require("fs/promises");
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const useMock = process.env.SP_MOCK === "true";

const requiredEnv = [
  "POWER_AUTOMATE_URL"
];

const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length && !useMock) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
}

async function fetchListItems() {
  if (useMock) {
    const filePath = path.join(__dirname, "data", "sample-items.json");
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  }
  const url = process.env.POWER_AUTOMATE_URL;
  const response = await axios.get(url);
  return response.data.items || response.data;
}

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/list-items", async (_req, res) => {
  try {
    const items = await fetchListItems();
    res.json({ items });
  } catch (error) {
    const status = error.response?.status || 500;
    const detail = error.response?.data || error.message;
    res.status(status).json({
      error: "Failed to fetch SharePoint list items",
      detail
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
