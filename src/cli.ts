#!/usr/bin/env node
// cli.ts
// Directly run index.js, no dotenv needed

import("./index.js").catch((err) => {
  console.error("Failed to start 1492.Vision MCP Server:", err);
  process.exit(1);
});