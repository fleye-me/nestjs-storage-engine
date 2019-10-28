import { GOOGLE_CLOUD_CONFIG } from './image-resizer.constants';
import { GoogleCloudConfig } from './interfaces/google-cloud.interface';

import { Injectable, Inject, UploadedFile } from '@nestjs/common';
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

  async resize(buffer, options = { width: 50, height: 50 }) {
    return sharp(buffer).resize(options.width, options.height).toBuffer();
  }

  // https://cloud.google.com/nodejs/getting-started/using-cloud-storage
  async sendToGCS(buffer: any, filename: string, mimetype: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const _filename = `${Date.now()}${filename}`
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

  async upload(res: any, file: any) {
    const sizes = [50, 100, 200, 500];
    const pendingUploads = [];
    const imagesUrls = {};

    // Upload original image
    pendingUploads.push(this.sendToGCS(
      file.buffer,
      file.originalname,
      file.mimetype
    ).then(url => imagesUrls['original'] = url));

    // Upload small images
    for (const size of sizes) {
      this.resize(
        file.buffer,
        { width: size, height: size }
      ).then(smallImage => {
        pendingUploads.push(this.sendToGCS(
          smallImage,
          `${size}_${size}_${file.originalname}`,
          file.mimetype
        ).then(url => imagesUrls[size] = url));
      }).catch(err => {
        console.error('Resize image error');
        console.error(err);
      })
    }

    await Promise.all(pendingUploads);
    res.end(JSON.stringify(imagesUrls));
  }

}
