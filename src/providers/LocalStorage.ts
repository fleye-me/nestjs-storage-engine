import { Inject, Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as destination from 'path';
import { STORAGE_CONFIG } from '../constants/providerNames';
import { DeleteFileDto } from '../dtos/deleteFile.dto';
import { StorageConfigDto } from '../dtos/storageConfig.dto';
import { UploadFileDto } from '../dtos/uploadFile.dto';
import { StorageInterface } from '../interfaces/storage.interface';

@Injectable()
export class LocalStorage implements StorageInterface {
  constructor(
    @Inject(STORAGE_CONFIG)
    private storageConfig: StorageConfigDto
  ) {
    fs.mkdirSync(storageConfig.disk.uploadsFolder, { recursive: true });
  }

  async uploadFile({ filename, path, buffer }: UploadFileDto) {
    const customPath = `${path}/${filename}`;

    const writeToPath = destination.resolve(this.storageConfig.disk.uploadsFolder, path);
    fs.mkdirSync(writeToPath, { recursive: true });
    fs.writeFileSync(`${writeToPath}/${filename}`, buffer);

    const fileUrl = `${this.storageConfig.disk.serverStaticFilesBaseUrl}/${encodeURIComponent(customPath)}`

    return {
      filename,
      url: fileUrl,
    };
  }

  async deleteFile({ path, filename }: DeleteFileDto) {
    const filePath = destination.resolve(
      this.storageConfig.disk.uploadsFolder,
      path,
      filename,
    );

    try {
      await fs.promises.stat(filePath);
    } catch {
      Logger.error(`File not exists in ${path}/${filename}`);
    }

    await fs.promises.unlink(filePath);
    return true;
  }
}
