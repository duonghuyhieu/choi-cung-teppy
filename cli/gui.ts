import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Start local web server and open browser for GUI mode
 */
export async function startGUI() {
  console.clear();
  console.log(chalk.green.bold(`
 ██████   █████  ███    ███ ███████     ███████  █████  ██    ██ ███████ ██████
██       ██   ██ ████  ████ ██          ██      ██   ██ ██    ██ ██      ██   ██
██   ███ ███████ ██ ████ ██ █████       ███████ ███████ ██    ██ █████   ██████
██    ██ ██   ██ ██  ██  ██ ██               ██ ██   ██  ██  ██  ██      ██   ██
 ██████  ██   ██ ██      ██ ███████     ███████ ██   ██   ████   ███████ ██   ██
`));
  console.log(chalk.cyan('🌐 GUI MODE - Khoi dong web server...\n'));

  const spinner = ora('Dang khoi dong server...').start();

  try {
    // Find project root (where package.json is)
    const projectRoot = join(__dirname, '..');

    // Check if we're in development or production
    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev) {
      spinner.text = 'Khoi dong Next.js development server...';

      // Start Next.js dev server
      const server = spawn('npm', ['run', 'dev'], {
        cwd: projectRoot,
        shell: true,
        stdio: 'pipe'
      });

      // Wait for server to be ready
      await new Promise<void>((resolve, reject) => {
        let output = '';

        const timeout = setTimeout(() => {
          reject(new Error('Server timeout'));
        }, 30000); // 30 second timeout

        server.stdout?.on('data', (data) => {
          output += data.toString();

          // Check if server is ready
          if (output.includes('Local:') || output.includes('localhost:3000')) {
            clearTimeout(timeout);
            resolve();
          }
        });

        server.stderr?.on('data', (data) => {
          const error = data.toString();
          if (error.includes('Error')) {
            clearTimeout(timeout);
            reject(new Error(error));
          }
        });

        server.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      spinner.succeed(chalk.green('Server da san sang!'));

      console.log(chalk.cyan('\n✨ GUI dang chay tai: ') + chalk.yellow.bold('http://localhost:3000'));
      console.log(chalk.gray('\n📝 Mo browser va truy cap URL tren'));
      console.log(chalk.gray('⌨️  Nhan Ctrl+C de dung server\n'));

      // Try to open browser
      await openBrowser('http://localhost:3000');

      // Keep process alive
      process.stdin.resume();

    } else {
      // Production mode - user should deploy to Vercel
      spinner.fail(chalk.red('GUI mode chi ho tro trong development'));
      console.log(chalk.yellow('\n💡 De chay GUI:'));
      console.log(chalk.cyan('1. Clone repository: ') + chalk.gray('git clone https://github.com/duonghuyhieu/choi-cung-teppy.git'));
      console.log(chalk.cyan('2. Cai dat: ') + chalk.gray('npm install'));
      console.log(chalk.cyan('3. Chay dev server: ') + chalk.gray('npm run dev'));
      console.log(chalk.cyan('4. Mo browser: ') + chalk.gray('http://localhost:3000'));
      console.log(chalk.yellow('\n🚀 Hoac truy cap web app da deploy:'));
      console.log(chalk.gray('   https://your-app.vercel.app\n'));
    }

  } catch (error: any) {
    spinner.fail(chalk.red('Loi khi khoi dong server'));
    console.error(chalk.red(error.message));

    console.log(chalk.yellow('\n💡 De su dung GUI, ban can:'));
    console.log(chalk.cyan('1. Clone repository: ') + chalk.gray('git clone https://github.com/duonghuyhieu/choi-cung-teppy.git'));
    console.log(chalk.cyan('2. Cai dat dependencies: ') + chalk.gray('cd choi-cung-teppy && npm install'));
    console.log(chalk.cyan('3. Chay dev server: ') + chalk.gray('npm run dev'));
    console.log(chalk.cyan('4. Mo browser tai: ') + chalk.gray('http://localhost:3000\n'));

    process.exit(1);
  }
}

/**
 * Open browser at specified URL
 */
async function openBrowser(url: string) {
  const { default: open } = await import('open');

  try {
    await open(url);
    console.log(chalk.green('✓ Browser da duoc mo tu dong!\n'));
  } catch (error) {
    console.log(chalk.yellow('⚠ Khong the mo browser tu dong. Vui long mo thu cong.\n'));
  }
}
