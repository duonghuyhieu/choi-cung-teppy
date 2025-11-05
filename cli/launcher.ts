#!/usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
import { startGUI } from './gui.js';

// Clear console and show header
function showHeader() {
  console.clear();
  console.log(chalk.green.bold(`
 ██████   █████  ███    ███ ███████     ███████  █████  ██    ██ ███████ ██████
██       ██   ██ ████  ████ ██          ██      ██   ██ ██    ██ ██      ██   ██
██   ███ ███████ ██ ████ ██ █████       ███████ ███████ ██    ██ █████   ██████
██    ██ ██   ██ ██  ██  ██ ██               ██ ██   ██  ██  ██  ██      ██   ██
 ██████  ██   ██ ██      ██ ███████     ███████ ██   ██   ████   ███████ ██   ██
`));
  console.log(chalk.gray('Quan ly va dong bo save game tren cloud\n'));
}

async function chooseModeMenu() {
  showHeader();

  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'Chon che do:',
      choices: [
        { name: chalk.cyan('[1] 🌐 GUI Mode') + chalk.gray(' - Giao dien do hoa (Web)'), value: 'gui' },
        { name: chalk.green('[2] ⌨️  CLI Mode') + chalk.gray(' - Giao dien dong lenh (Terminal)'), value: 'cli' },
        { name: chalk.red('[0] 🚪 Thoat'), value: 'exit' },
      ],
      pageSize: 10,
    },
  ]);

  switch (mode) {
    case 'gui':
      await startGUIMode();
      break;
    case 'cli':
      await startCLIMode();
      break;
    case 'exit':
      console.log(chalk.yellow('\nTam biet!'));
      process.exit(0);
  }
}

async function startGUIMode() {
  console.clear();
  console.log(chalk.cyan.bold('\n🌐 GUI MODE\n'));
  console.log(chalk.gray('GUI mode se mo giao dien web trong browser cua ban.\n'));

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Ban co muon khoi dong GUI mode?',
      default: true,
    },
  ]);

  if (confirm) {
    await startGUI();
  } else {
    await chooseModeMenu();
  }
}

async function startCLIMode() {
  // Import and run the original CLI
  // The index.ts file auto-starts when imported
  await import('./index.js');
}

// Check for command line arguments
const args = process.argv.slice(2);

if (args.includes('--gui')) {
  // Direct to GUI mode
  startGUIMode();
} else if (args.includes('--cli')) {
  // Direct to CLI mode
  startCLIMode();
} else if (args.includes('--help') || args.includes('-h')) {
  // Show help
  console.log(chalk.green.bold('\n📖 Game Saver - Help\n'));
  console.log(chalk.cyan('Usage:'));
  console.log(chalk.gray('  npx game-saver              ') + '# Show mode selection menu');
  console.log(chalk.gray('  npx game-saver --gui        ') + '# Start GUI mode directly');
  console.log(chalk.gray('  npx game-saver --cli        ') + '# Start CLI mode directly');
  console.log(chalk.gray('  npx game-saver --help       ') + '# Show this help\n');
  console.log(chalk.cyan('Modes:'));
  console.log(chalk.gray('  GUI Mode: ') + 'Web interface in browser (requires local server)');
  console.log(chalk.gray('  CLI Mode: ') + 'Terminal-based interface (works everywhere)\n');
  process.exit(0);
} else {
  // Show mode selection menu
  chooseModeMenu();
}
