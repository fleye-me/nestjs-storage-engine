import { Inject, Injectable } from '@nestjs/common';
import { PROVIDER_ENGINE_NAME } from './constants/providerNames';
import { DeleteFileDto } from './dtos/deleteFile.dto';
import { UploadFileDto } from './dtos/uploadFile.dto';
import { StorageInterface } from './interfaces/storage.interface';
import * as crypto from 'crypto';
import { SizeOptionsDto } from './dtos/sizeOptions.dto';
import * as sharp from 'sharp';
import { UploadedFileDto } from './dtos/uploadedFile.dto';

@Injectable()
export class StorageEngineService {
  constructor(
    @Inject(PROVIDER_ENGINE_NAME)
    private storageEngine: StorageInterface
  ) {}

  private createUniqueFilename(originalFilename: string) {
    const hash = crypto.randomBytes(10).toString('hex');
    const arrayFileName = originalFilename.split('.');
    const ext = arrayFileName.pop();
    const restName = arrayFileName[0]

    const uniqueFilename = `${restName}${hash}.${ext}`;

    return uniqueFilename;
  }

  async resizeImage(buffer: Buffer | string, options: SizeOptionsDto) {
    return sharp(buffer).resize(options.width, options.height).toBuffer();
  }

  async resizeImageAndUpload(
    file: UploadFileDto,
    sizes: SizeOptionsDto[] = []
  ): Promise<Record<string, UploadedFileDto>> {
    const pendingUploads = [];
    const imagesUrls: Record<string, UploadedFileDto> = {};

    // Upload original image
    pendingUploads.push(
      this.uploadFile(file).then((results) => (imagesUrls['original'] = results))
    );

    // Upload small images
    for (const size of sizes) {
      try {
        const resizedImage = await this.resizeImage(file.buffer, size);

        pendingUploads.push(
          this.uploadFile({
            ...file,
            buffer: resizedImage,
            filename: `w${size.width}h${size.height}${file.filename}`,
          }).then(
            (results) => (imagesUrls[`w${size.width}h${size.height}`] = results)
          )
        );
      } catch (err) {
        console.error('Resize image error');
        console.error(err);
      }
    }

    await Promise.all(pendingUploads);
    return imagesUrls;
  }

  async uploadFile(data: UploadFileDto): Promise<UploadedFileDto> {
    const results = await this.storageEngine.uploadFile({
      ...data,
      filename: this.createUniqueFilename(data.filename)
    });

    return {
      ...results,
      originalFilename: data.filename,
      path: data.path
    }
  }

  async deleteFile(data: DeleteFileDto) {
    return this.storageEngine.deleteFile(data);
  }
}
