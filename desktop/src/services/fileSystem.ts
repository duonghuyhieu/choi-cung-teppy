import fs from 'fs/promises';
import path from 'path';
import { apiClient } from './api.js';

/**
 * File System Service for CLI
 */
export class FileSystemService {
  /**
   * Resolve path template with environment variables
   * Example: %APPDATA%/Game/saves/*.sav -> C:/Users/User/AppData/Roaming/Game/saves/save1.sav
   */
  async resolvePath(pathTemplate: string): Promise<string> {
    // Replace Windows environment variables
    let resolvedPath = pathTemplate
      .replace(/%APPDATA%/g, process.env.APPDATA || '')
      .replace(/%LOCALAPPDATA%/g, process.env.LOCALAPPDATA || '')
      .replace(/%USERPROFILE%/g, process.env.USERPROFILE || '')
      .replace(/%PROGRAMFILES%/g, process.env.PROGRAMFILES || '')
      .replace(/%PROGRAMFILES\(X86\)%/g, process.env['PROGRAMFILES(X86)'] || '');

    // Handle wildcards - find first matching file
    if (resolvedPath.includes('*')) {
      const dirPath = path.dirname(resolvedPath);
      const pattern = path.basename(resolvedPath);

      try {
        const files = await fs.readdir(dirPath);
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        const matchedFile = files.find((file) => regex.test(file));

        if (matchedFile) {
          resolvedPath = path.join(dirPath, matchedFile);
        }
      } catch (error) {
        console.error('Error resolving path:', error);
      }
    }

    return resolvedPath;
  }

  /**
   * Read file as Buffer
   */
  async readFile(filePath: string): Promise<Buffer> {
    return fs.readFile(filePath);
  }

  /**
   * Write Buffer to file
   */
  async writeFile(filePath: string, data: Buffer): Promise<void> {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(filePath, data);
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get directory contents
   */
  async readDir(dirPath: string): Promise<string[]> {
    return fs.readdir(dirPath);
  }

  /**
   * Download save file from API and inject to game directory
   */
  async injectSaveFile(
    downloadUrl: string,
    gamePathTemplate: string
  ): Promise<void> {
    try {
      // 1. Download file from API
      const fileData = await apiClient.downloadFile(downloadUrl);

      // 2. Resolve game path
      const resolvedPath = await this.resolvePath(gamePathTemplate);

      // 3. Write file
      await this.writeFile(resolvedPath, fileData);

      console.log(`✓ Save file injected successfully to: ${resolvedPath}`);
    } catch (error: any) {
      console.error('Failed to inject save file:', error);
      throw new Error(`Failed to inject save file: ${error.message}`);
    }
  }

  /**
   * Extract save file from game directory and return Buffer
   */
  async extractSaveFile(gamePathTemplate: string): Promise<{
    buffer: Buffer;
    fileName: string;
  }> {
    try {
      // 1. Resolve game path
      const resolvedPath = await this.resolvePath(gamePathTemplate);

      // 2. Check if file exists
      const exists = await this.fileExists(resolvedPath);
      if (!exists) {
        throw new Error(`Save file not found at: ${resolvedPath}`);
      }

      // 3. Read file
      const buffer = await this.readFile(resolvedPath);

      // 4. Get filename from path
      const fileName = path.basename(resolvedPath);

      console.log(`✓ Save file extracted successfully from: ${resolvedPath}`);
      return { buffer, fileName };
    } catch (error: any) {
      console.error('Failed to extract save file:', error);
      throw new Error(`Failed to extract save file: ${error.message}`);
    }
  }
}

export const fileSystem = new FileSystemService();
