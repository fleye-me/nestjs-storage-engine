import { Inject, Injectable } from '@nestjs/common';
import { PROVIDER_ENGINE_NAME } from './constants/providerNames';
import { DeleteFileDto } from './dtos/deleteFile.dto';
import { UploadFileDto } from './dtos/uploadFile.dto';
import { StorageInterface } from './interfaces/storage.interface';
import * as crypto from 'crypto';
import { SizeOptionsDto } from './dtos/sizeOptions.dto';
import * as sharp from 'sharp';
import { UploadFileResultsDto } from './dtos/uploadFileResults.dto';

@Injectable()
export class StorageEngineService {
  constructor(
    @Inject(PROVIDER_ENGINE_NAME)
    private storageEngine: StorageInterface
  ) {}

  createUniqueFilename(originalFilename: string) {
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
  ): Promise<Record<string, UploadFileResultsDto>> {
    const pendingUploads = [];
    const imagesUrls: Record<string, UploadFileResultsDto> = {};

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

  async uploadFile(data: UploadFileDto) {
    return this.storageEngine.uploadFile({
      ...data,
      filename: this.createUniqueFilename(data.filename)
    });
  }

  async deleteFile(data: DeleteFileDto) {
    return this.storageEngine.deleteFile(data);
  }
}
