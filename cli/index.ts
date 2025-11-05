import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { apiClient } from './services/api.js';
import { fileSystem } from './services/fileSystem.js';
import type { User, Game, SaveFileWithUser, GameWithLinks } from '../types/index.js';

let currentUser: User | null = null;

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

// Main menu
async function mainMenu() {
  showHeader();

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Chon hanh dong:',
      choices: [
        { name: '[1] Dang nhap', value: 'login' },
        { name: '[2] Dang ky', value: 'register' },
        { name: '[0] Thoat', value: 'exit' },
      ],
    },
  ]);

  switch (action) {
    case 'login':
      await loginMenu();
      break;
    case 'register':
      await registerMenu();
      break;
    case 'exit':
      console.log(chalk.yellow('\nTam biet!'));
      process.exit(0);
  }
}

// Login menu
async function loginMenu() {
  showHeader();
  console.log(chalk.green.bold('> DANG NHAP\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Email:',
      validate: (input) => (input ? true : 'Email khong duoc de trong'),
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password:',
      validate: (input) => (input ? true : 'Password khong duoc de trong'),
    },
  ]);

  const spinner = ora('Dang dang nhap...').start();

  try {
    const response = await apiClient.login(answers.email, answers.password);

    if (response.success) {
      currentUser = response.data.user;
      spinner.succeed(chalk.green('Dang nhap thanh cong!'));
      await gameListMenu();
    } else {
      spinner.fail(chalk.red(response.error || 'Dang nhap that bai'));
      await continueOrExit();
    }
  } catch (error: any) {
    spinner.fail(chalk.red(error.response?.data?.error || 'Dang nhap that bai'));
    await continueOrExit();
  }
}

// Register menu
async function registerMenu() {
  showHeader();
  console.log(chalk.green.bold('> DANG KY\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Email:',
      validate: (input) => (input ? true : 'Email khong duoc de trong'),
    },
    {
      type: 'input',
      name: 'username',
      message: 'Username:',
      validate: (input) => (input ? true : 'Username khong duoc de trong'),
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password:',
      validate: (input) => (input ? true : 'Password khong duoc de trong'),
    },
  ]);

  const spinner = ora('Dang dang ky...').start();

  try {
    const response = await apiClient.register(
      answers.email,
      answers.username,
      answers.password
    );

    if (response.success) {
      currentUser = response.data.user;
      spinner.succeed(chalk.green('Dang ky thanh cong!'));
      await gameListMenu();
    } else {
      spinner.fail(chalk.red(response.error || 'Dang ky that bai'));
      await continueOrExit();
    }
  } catch (error: any) {
    spinner.fail(chalk.red(error.response?.data?.error || 'Dang ky that bai'));
    await continueOrExit();
  }
}

// Game list menu
async function gameListMenu() {
  showHeader();
  console.log(chalk.green.bold(`> DANH SACH GAME`));
  console.log(chalk.gray(`User: ${currentUser?.username} (${currentUser?.role})\n`));

  const spinner = ora('Dang tai danh sach game...').start();

  try {
    const response = await apiClient.getGames();
    spinner.stop();

    if (!response.success || response.data.length === 0) {
      console.log(chalk.yellow('Khong co game nao.\n'));
      await logoutMenu();
      return;
    }

    const games: Game[] = response.data;

    const choices = [
      ...games.map((game, index) => ({
        name: `[${index + 1}] ${game.name}${game.description ? ` - ${game.description}` : ''}`,
        value: game.id,
      })),
      { name: chalk.gray('[0] Dang xuat'), value: 'logout' },
    ];

    const { gameId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'gameId',
        message: 'Chon game:',
        choices,
        pageSize: 15,
      },
    ]);

    if (gameId === 'logout') {
      await logoutMenu();
    } else {
      await gameDetailMenu(gameId);
    }
  } catch (error: any) {
    spinner.fail(chalk.red('Loi khi tai danh sach game'));
    await continueOrExit();
  }
}

// Game detail menu
async function gameDetailMenu(gameId: string) {
  showHeader();

  const spinner = ora('Dang tai thong tin game...').start();

  try {
    const response = await apiClient.getGame(gameId);
    spinner.stop();

    if (!response.success) {
      console.log(chalk.red('Khong tim thay game'));
      await gameListMenu();
      return;
    }

    const game: GameWithLinks = response.data;

    console.log(chalk.green.bold(`> ${game.name.toUpperCase()}\n`));
    if (game.description) {
      console.log(chalk.gray(game.description));
    }
    console.log(chalk.yellow(`\nSave path: ${game.save_file_path}\n`));

    if (game.download_links.length > 0) {
      console.log(chalk.green('DOWNLOAD LINKS:'));
      game.download_links.forEach((link, index) => {
        console.log(
          chalk.cyan(`[${index + 1}] ${link.platform}${link.version ? ` v${link.version}` : ''}`)
        );
        console.log(chalk.gray(`    ${link.url}`));
      });
      console.log();
    }

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Chon hanh dong:',
        choices: [
          { name: '[1] Quan ly Save Files', value: 'saves' },
          { name: '[0] Quay lai', value: 'back' },
        ],
      },
    ]);

    if (action === 'saves') {
      await saveManagerMenu(game);
    } else {
      await gameListMenu();
    }
  } catch (error: any) {
    spinner.fail(chalk.red('Loi khi tai thong tin game'));
    await gameListMenu();
  }
}

// Save manager menu
async function saveManagerMenu(game: GameWithLinks) {
  showHeader();
  console.log(chalk.green.bold(`> SAVE MANAGER - ${game.name.toUpperCase()}\n`));

  const spinner = ora('Dang tai danh sach save files...').start();

  try {
    const response = await apiClient.getSaveFiles(game.id);
    spinner.stop();

    if (!response.success) {
      console.log(chalk.red('Loi khi tai save files'));
      await gameDetailMenu(game.id);
      return;
    }

    const saves: SaveFileWithUser[] = response.data;

    if (saves.length > 0) {
      console.log(chalk.green('DANH SACH SAVE FILES:\n'));
      saves.forEach((save, index) => {
        const publicTag = save.is_public ? chalk.yellow(' [PUBLIC]') : '';
        console.log(
          chalk.cyan(`[${index + 1}] ${save.file_name}${publicTag}`)
        );
        console.log(
          chalk.gray(
            `    By: ${save.user.username} | Size: ${(save.file_size / 1024).toFixed(2)} KB`
          )
        );
        if (save.description) {
          console.log(chalk.gray(`    ${save.description}`));
        }
      });
      console.log();
    } else {
      console.log(chalk.yellow('Khong co save file nao.\n'));
    }

    const choices = [
      { name: '[1] Upload save tu game', value: 'upload' },
      ...saves.map((save, index) => ({
        name: `[${index + 2}] Download va inject: ${save.file_name}`,
        value: `download_${save.id}`,
      })),
      { name: chalk.gray('[0] Quay lai'), value: 'back' },
    ];

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Chon hanh dong:',
        choices,
        pageSize: 15,
      },
    ]);

    if (action === 'upload') {
      await uploadSaveMenu(game);
    } else if (action.startsWith('download_')) {
      const saveId = action.replace('download_', '');
      await downloadSaveMenu(game, saveId);
    } else {
      await gameDetailMenu(game.id);
    }
  } catch (error: any) {
    spinner.fail(chalk.red('Loi khi tai save files'));
    await gameDetailMenu(game.id);
  }
}

// Upload save menu
async function uploadSaveMenu(game: GameWithLinks) {
  const spinner = ora('Dang upload save file...').start();

  try {
    // Extract save from game folder
    const { buffer, fileName } = await fileSystem.extractSaveFile(
      game.save_file_path
    );

    spinner.text = 'Dang upload len server...';

    // Upload to server
    const response = await apiClient.uploadSaveFile(
      game.id,
      buffer,
      fileName,
      'Uploaded from CLI'
    );

    if (response.success) {
      spinner.succeed(chalk.green('Upload thanh cong!'));
    } else {
      spinner.fail(chalk.red(response.error || 'Upload that bai'));
    }
  } catch (error: any) {
    spinner.fail(chalk.red(error.message || 'Upload that bai'));
  }

  await continueToSaveManager(game);
}

// Download save menu
async function downloadSaveMenu(game: GameWithLinks, saveId: string) {
  const spinner = ora('Dang download save file...').start();

  try {
    // Get download URL
    const response = await apiClient.getSaveFileDownloadUrl(saveId);

    if (!response.success) {
      spinner.fail(chalk.red('Khong lay duoc download URL'));
      await continueToSaveManager(game);
      return;
    }

    spinner.text = 'Dang inject vao game...';

    // Download and inject
    await fileSystem.injectSaveFile(
      response.data.download_url,
      game.save_file_path
    );

    spinner.succeed(chalk.green('Download va inject thanh cong!'));
  } catch (error: any) {
    spinner.fail(chalk.red(error.message || 'Download that bai'));
  }

  await continueToSaveManager(game);
}

// Continue to save manager
async function continueToSaveManager(game: GameWithLinks) {
  const { cont } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'cont',
      message: 'Tiep tuc?',
      default: true,
    },
  ]);

  if (cont) {
    await saveManagerMenu(game);
  } else {
    await gameDetailMenu(game.id);
  }
}

// Logout menu
async function logoutMenu() {
  await apiClient.logout();
  currentUser = null;
  console.log(chalk.yellow('\nDa dang xuat!'));
  await continueOrExit();
}

// Continue or exit
async function continueOrExit() {
  const { cont } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'cont',
      message: 'Quay lai menu chinh?',
      default: true,
    },
  ]);

  if (cont) {
    await mainMenu();
  } else {
    console.log(chalk.yellow('\nTam biet!'));
    process.exit(0);
  }
}

// Start CLI
async function start() {
  try {
    // Check if already logged in
    const response = await apiClient.getMe();
    if (response.success) {
      currentUser = response.data;
      await gameListMenu();
    } else {
      await mainMenu();
    }
  } catch {
    await mainMenu();
  }
}

start().catch((error) => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
