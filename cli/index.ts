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

  if (currentUser) {
    console.log(chalk.green(`Xin chao, ${currentUser.username}!\n`));
  }

  const choices = currentUser
    ? [
      { name: '[1] Chon game', value: 'games' },
      { name: '[2] Dang xuat', value: 'logout' },
      { name: '[0] Thoat', value: 'exit' },
    ]
    : [
      { name: '[1] Chon game', value: 'games' },
      { name: '[2] Dang nhap', value: 'login' },
      { name: '[3] Dang ky', value: 'register' },
      { name: '[0] Thoat', value: 'exit' },
    ];

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Chon hanh dong:',
      choices,
    },
  ]);

  switch (action) {
    case 'games':
      await gameListMenu();
      break;
    case 'login':
      await loginMenu();
      break;
    case 'register':
      await registerMenu();
      break;
    case 'logout':
      await apiClient.logout();
      currentUser = null;
      console.log(chalk.green('\nDa dang xuat!'));
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await mainMenu();
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
      message: 'Username or Email:',
      validate: (input) => (input ? true : 'Username or Email khong duoc de trong'),
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
  if (currentUser) {
    console.log(chalk.gray(`User: ${currentUser?.username}\n`));
  } else {
    console.log(chalk.yellow(`Chua dang nhap\n`));
  }

  const spinner = ora('Dang tai danh sach game...').start();

  try {
    const response = await apiClient.getGames();
    spinner.stop();

    if (!response.success || response.data.length === 0) {
      console.log(chalk.yellow('Khong co game nao.\n'));
      await mainMenu();
      return;
    }

    const games: Game[] = response.data;

    const choices = [
      ...games.map((game, index) => ({
        name: `[${index + 1}] ${game.name}`,
        value: game.id,
      })),
      { name: chalk.gray('[0] Quay lai'), value: 'back' },
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

    if (gameId === 'back') {
      await mainMenu();
    } else {
      await gameActionMenu(gameId);
    }
  } catch (error: any) {
    spinner.fail(chalk.red('Loi khi tai danh sach game'));
    await continueOrExit();
  }
}

// Game action menu
async function gameActionMenu(gameId: string) {
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
    console.log(chalk.yellow(`Save path: ${game.save_file_path}\n`));

    const choices = [
      { name: '[1] Lay file save', value: 'download-save' },
      { name: '[2] Tai len file save', value: 'upload-save' },
      { name: '[0] Quay lai', value: 'back' },
    ];

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Chon hanh dong:',
        choices,
      },
    ]);

    switch (action) {
      case 'download-save':
        // Check login
        if (!currentUser) {
          console.log(chalk.yellow('\nBan can dang nhap de lay file save!\n'));
          await loginMenu();
          // After login, return to game action menu
          await gameActionMenu(gameId);
        } else {
          await downloadSaveMenuSimple(game);
        }
        break;
      case 'upload-save':
        // Check login
        if (!currentUser) {
          console.log(chalk.yellow('\nBan can dang nhap de tai len file save!\n'));
          await loginMenu();
          // After login, return to game action menu
          await gameActionMenu(gameId);
        } else {
          await uploadSaveMenu(game);
        }
        break;
      case 'back':
        await gameListMenu();
        break;
    }
  } catch (error: any) {
    spinner.fail(chalk.red('Loi khi tai thong tin game'));
    await gameListMenu();
  }
}

// Download save menu (simple version - shows list and downloads)
async function downloadSaveMenuSimple(game: GameWithLinks) {
  showHeader();
  console.log(chalk.green.bold(`> LAY FILE SAVE - ${game.name.toUpperCase()}\n`));

  // Check if game has save_file_path
  if (!game.save_file_path) {
    console.log(chalk.red('Game nay khong ho tro dong bo save file tu dong.\n'));
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await gameActionMenu(game.id);
    return;
  }

  const spinner = ora('Dang tai danh sach save files...').start();

  try {
    const response = await apiClient.getSaveFiles(game.id);
    spinner.stop();

    if (!response.success) {
      console.log(chalk.red('Loi khi tai save files'));
      await gameActionMenu(game.id);
      return;
    }

    const saves: SaveFileWithUser[] = response.data;

    if (saves.length === 0) {
      console.log(chalk.yellow('Khong co save file nao.\n'));
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await gameActionMenu(game.id);
      return;
    }

    console.log(chalk.green('DANH SACH SAVE FILES:\n'));
    saves.forEach((save, index) => {
      const publicTag = save.is_public ? chalk.yellow(' [PUBLIC]') : '';
      const ownerTag = save.user_id === currentUser?.id ? chalk.cyan(' [YOUR SAVE]') : '';
      console.log(
        chalk.cyan(`[${index + 1}] ${save.file_name}${publicTag}${ownerTag}`)
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

    const choices = [
      ...saves.map((save, index) => ({
        name: `[${index + 1}] ${save.file_name}`,
        value: save.id,
      })),
      { name: chalk.gray('[0] Quay lai'), value: 'back' },
    ];

    const { saveId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'saveId',
        message: 'Chon save de tai:',
        choices,
        pageSize: 15,
      },
    ]);

    if (saveId === 'back') {
      await gameActionMenu(game.id);
      return;
    }

    // Find selected save
    const selectedSave = saves.find((s) => s.id === saveId);

    // Download and inject the selected save
    const downloadSpinner = ora('Dang download save file...').start();

    try {
      // Get download URL
      const downloadResponse = await apiClient.getSaveFileDownloadUrl(saveId);

      if (!downloadResponse.success) {
        downloadSpinner.fail(chalk.red('Khong lay duoc download URL'));
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await gameActionMenu(game.id);
        return;
      }

      downloadSpinner.text = 'Dang inject vao game...';

      // Download and inject
      await fileSystem.injectSaveFile(
        downloadResponse.data.download_url,
        game.save_file_path,
        selectedSave?.file_name
      );

      downloadSpinner.succeed(chalk.green('Download va inject thanh cong!'));
    } catch (error: any) {
      downloadSpinner.fail(chalk.red('Download that bai'));
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
    await gameActionMenu(game.id);
  } catch (error: any) {
    spinner.fail(chalk.red('Loi khi tai save files'));
    await gameActionMenu(game.id);
  }
}

// Upload save menu
async function uploadSaveMenu(game: GameWithLinks) {
  showHeader();
  console.log(chalk.green.bold(`> TAI LEN FILE SAVE - ${game.name.toUpperCase()}\n`));

  // Check if game has save_file_path
  if (!game.save_file_path) {
    console.log(chalk.red('Game nay khong ho tro dong bo save file tu dong.\n'));
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await gameActionMenu(game.id);
    return;
  }

  // Ask for description and public/private
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Mo ta save file (optional):',
      default: '',
    },
    {
      type: 'confirm',
      name: 'isPublic',
      message: 'Chia se cong khai?',
      default: false,
    },
  ]);

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
      answers.description || undefined,
      answers.isPublic
    );

    if (response.success) {
      spinner.succeed(chalk.green('Upload thanh cong!'));
    } else {
      spinner.fail(chalk.red(response.error || 'Upload that bai'));
    }
  } catch (error: any) {
    if (error.message === 'SAVE_NOT_FOUND') {
      spinner.fail(chalk.red('Khong tim thay file save. Vui long kiem tra game da duoc cai dat va choi chua.'));
    } else {
      console.error(chalk.red('Error details:'), error.response?.data || error.message);
      spinner.fail(chalk.red('Upload that bai'));
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 1500));
  await gameActionMenu(game.id);
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
    }
  } catch {
    // Not logged in, that's fine
  }

  await mainMenu();
}

start().catch((error) => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
