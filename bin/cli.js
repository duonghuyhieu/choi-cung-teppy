#!/usr/bin/env node

import('../dist/cli/index.js').catch((err) => {
  console.error('Failed to start game-saver:', err);
  process.exit(1);
});
