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
        { name: chalk.cyan('[1] 🖥️  Giao dien (GUI)') + chalk.gray(' - De dung, thich hop cho nguoi moi'), value: 'gui' },
        { name: chalk.green('[2] ⚡ CLI') + chalk.gray(' - Nhanh gon cho nguoi co kinh nghiem'), value: 'cli' },
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
  console.log(chalk.cyan.bold('\n🖥️  GIAO DIEN (GUI)\n'));
  console.log(chalk.gray('Giao dien do hoa se mo trong browser cua ban - de dung, thich hop cho nguoi moi.\n'));

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Ban co muon khoi dong Giao dien (GUI)?',
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
  console.log(chalk.gray('  npx game-saver --gui        ') + '# Start Giao dien (GUI) directly');
  console.log(chalk.gray('  npx game-saver --cli        ') + '# Start CLI directly');
  console.log(chalk.gray('  npx game-saver --help       ') + '# Show this help\n');
  console.log(chalk.cyan('Modes:'));
  console.log(chalk.gray('  Giao dien (GUI): ') + 'De dung, giao dien do hoa trong browser');
  console.log(chalk.gray('  CLI:             ') + 'Nhanh gon, chay ngay tren terminal\n');
  process.exit(0);
} else {
  // Show mode selection menu
  chooseModeMenu();
}
