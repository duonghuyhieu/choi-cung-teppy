#!/usr/bin/env node

import('../cli/launcher.js').catch((err) => {
  console.error('Failed to start game-saver:', err);
  process.exit(1);
});
