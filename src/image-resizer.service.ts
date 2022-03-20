import { GOOGLE_CLOUD_CONFIG } from './image-resizer.constants';
import { GoogleCloudConfig } from './interfaces/google-cloud.interface';
import { SizeOptionsDto } from './interfaces/sizeOptions.dto';
import { FileOptionsDto } from './interfaces/fileOptions.dto';

import { Injectable, Inject } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import * as sharp from 'sharp';
import { RemoveFileOptionsDto } from './interfaces/removeFileOptions.dto';

@Injectable()
export class ImageResizerService {
  private storage: Storage;
  constructor(
    @Inject(GOOGLE_CLOUD_CONFIG)
    private readonly googleCloudConfig: GoogleCloudConfig
  ) {
    if (this.googleCloudConfig.keyFilename) {
      this.storage = new Storage({
        projectId: this.googleCloudConfig.projectId,
        keyFilename: this.googleCloudConfig.keyFilename,
      });
    } else {
      this.storage = new Storage();
    }
  }

  async resizeImage(buffer: Buffer | string, options: SizeOptionsDto) {
    return sharp(buffer).resize(options.width, options.height).toBuffer();
  }

  // https://cloud.google.com/nodejs/getting-started/using-cloud-storage
  async sendToGCS({
    buffer,
    filename,
    mimetype,
    path,
  }: FileOptionsDto): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const _filename = path ? `${path}/${filename}` : filename;
        const bucket = this.storage.bucket(this.googleCloudConfig.bucket);
        const remoteFile = bucket.file(_filename);

        const stream = remoteFile.createWriteStream({
          metadata: mimetype ? { contentType: mimetype } : undefined,
          resumable: false,
        });

        stream.on('error', reject);

        stream.on('finish', async () => {
          remoteFile.makePublic().then(() => {
            resolve(
              `https://storage.googleapis.com/${this.googleCloudConfig.bucket}/${_filename}`
            );
          });
        });

        stream.end(buffer);
      } catch (err) {
        console.error('Error trying to upload a file');
        console.error(err);
      }
    });
  }

  async removeFileFromGCS({ filename, path }: RemoveFileOptionsDto) {
    const _filename = path ? `${path}/${filename}` : filename;
    return this.storage
      .bucket(this.googleCloudConfig.bucket)
      .file(_filename)
      .delete();
  }

  async resizeImageAndUpload(
    file: FileOptionsDto,
    sizes: SizeOptionsDto[] = []
  ): Promise<Record<string, string>> {
    const pendingUploads = [];
    const imagesUrls: Record<string, string> = {};

    // Upload original image
    pendingUploads.push(
      this.sendToGCS(file).then((url) => (imagesUrls['original'] = url))
    );

    // Upload small images
    for (const size of sizes) {
      try {
        const resizedImage = await this.resizeImage(file.buffer, size);

        pendingUploads.push(
          this.sendToGCS({
            ...file,
            buffer: resizedImage,
            filename: `${size.width}_${size.height}_${file.filename}`,
          }).then((url) => (imagesUrls[`w${size.width}h${size.height}`] = url))
        );
      } catch (err) {
        console.error('Resize image error');
        console.error(err);
      }
    }

    await Promise.all(pendingUploads);
    return imagesUrls;
  }
}
