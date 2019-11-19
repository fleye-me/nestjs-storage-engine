import { GOOGLE_CLOUD_CONFIG } from './image-resizer.constants';
import { GoogleCloudConfig } from './interfaces/google-cloud.interface';
import { IUploadOptions } from './interfaces/uploadOptions.interface';

import { Injectable, Inject } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import * as sharp from 'sharp';

@Injectable()
export class ImageResizerService {
  private storage: Storage;
  constructor(
    @Inject(GOOGLE_CLOUD_CONFIG) private readonly googleCloudConfig: GoogleCloudConfig,
  ) {
    this.storage = new Storage({
      projectId: this.googleCloudConfig.projectId,
      keyFilename: this.googleCloudConfig.keyFilename,
    })
  }

  getHello(): string {
    return 'Hello World!';
  }

  async resize(buffer, options: {width?: number, height?: number} = { width: 50, height: 50 }) {
    return sharp(buffer).resize(options.width, options.height).toBuffer();
  }

  // https://cloud.google.com/nodejs/getting-started/using-cloud-storage
  async sendToGCS(buffer: any, filename: string, mimetype: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const _filename = `${filename}`
        const bucket = await this.storage.bucket(this.googleCloudConfig.bucket);
        const remoteFile = bucket.file(_filename);

        const stream = remoteFile.createWriteStream({
          metadata: { contentType: mimetype },
          resumable: false
        });

        stream.on('error', reject);

        stream.on('finish', async () => {
          remoteFile.makePublic().then(() => {
            resolve(`https://storage.googleapis.com/${this.googleCloudConfig.bucket}/${_filename}`);
          });
        });

        stream.end(buffer);

      } catch (err) {
        console.error('Error trying to upload a file');
        console.error(err);
      }
    });
  }

  async upload(file: any, {path, filename, sizes}: IUploadOptions) {
    const pendingUploads = [];
    const imagesUrls = {};

    sizes = sizes ? sizes : [];
    filename = filename ? filename : file.originalname;
    // Upload original image
    pendingUploads.push(this.sendToGCS(
      file.buffer,
      filename,
      file.mimetype
    ).then(url => imagesUrls['original'] = url));


    // Upload small images
    for (const size of sizes) {
      this.resize(
        file.buffer,
        size
      ).then(resizedImage => {
        pendingUploads.push(this.sendToGCS(
          resizedImage,
          `${path ? `${path}/` : ''}${size.width}_${size.height}_${filename}`,
          file.mimetype
        ).then(url => imagesUrls[`${size.width || size.height}x${size.height || size.width}`] = url));
      }).catch(err => {
        console.error('Resize image error');
        console.error(err);
      })
    }

    await Promise.all(pendingUploads);
    return imagesUrls;
  }

}
