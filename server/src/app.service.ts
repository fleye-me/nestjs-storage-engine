import { Injectable, UploadedFile } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import * as sharp from 'sharp';

const PROJECT_ID = process.env.PROJECT_ID;
const KEY_FILENAME = process.env.KEY_FILENAME;
const BUCKET = process.env.BUCKET_NAME;

@Injectable()
export class AppService {
  private storage: Storage;
  constructor() {
    this.storage = new Storage({
      projectId: PROJECT_ID,
      keyFilename: KEY_FILENAME
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
        const bucket = await this.storage.bucket(BUCKET);
        const remoteFile = bucket.file(_filename);

        const stream = remoteFile.createWriteStream({
          metadata: { contentType: mimetype },
          resumable: false
        });

        stream.on('error', reject);

        stream.on('finish', async () => {
          remoteFile.makePublic().then(() => {
            resolve(`https://storage.googleapis.com/${BUCKET}/${_filename}`);
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
