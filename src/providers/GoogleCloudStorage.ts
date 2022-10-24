import { Inject, Injectable } from "@nestjs/common";
import { STORAGE_CONFIG } from "../constants/providerNames";
import { GoogleCloudConfigDto } from "../dtos/googleCloudConfig.dto";
import { StorageInterface } from "../interfaces/storage.interface";
import { Storage } from "@google-cloud/storage";
import { UploadFileDto } from "../dtos/uploadFile.dto";
import { DeleteFileDto } from "../dtos/deleteFile.dto";
import { StorageConfigDto } from "../dtos/storageConfig.dto";

@Injectable()
export class GoogleCloudStorage implements StorageInterface {
  private storage: Storage;
  private googleCloudConfig: GoogleCloudConfigDto;
  constructor(
    @Inject(STORAGE_CONFIG)
    private readonly storageConfig: StorageConfigDto
  ) {
    this.googleCloudConfig = this.storageConfig.gcp;

    if (this.googleCloudConfig.credentialsKeyPath) {
      this.storage = new Storage({
        projectId: this.googleCloudConfig.projectId,
        keyFilename: this.googleCloudConfig.credentialsKeyPath,
      });
    } else {
      this.storage = new Storage();
    }
  }

  async sendToGCS({
    buffer,
    filename,
    mimeType,
    path,
  }: UploadFileDto): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const encodedFilename = encodeURIComponent(filename);
        const _filename = path ? `${path}/${encodedFilename}` : encodedFilename;
        const bucket = this.storage.bucket(this.googleCloudConfig.bucket);
        const remoteFile = bucket.file(_filename);

        const stream = remoteFile.createWriteStream({
          metadata: mimeType ? { contentType: mimeType } : undefined,
          resumable: false,
        });

        stream.on("error", reject);

        stream.on("finish", async () => {
          remoteFile.makePublic().then(() => {
            resolve(
              `https://storage.googleapis.com/${this.googleCloudConfig.bucket}/${_filename}`
            );
          });
        });

        stream.end(buffer);
      } catch (err) {
        console.error("Error trying to upload a file");
        console.error(err);
      }
    });
  }

  async uploadFile({ buffer, filename, path, mimeType }: UploadFileDto) {
    try {
      const fileUrl = await this.sendToGCS({
        buffer,
        filename,
        mimeType,
        path,
      });

      return { url: fileUrl, filename: filename };
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteFile({ path, filename }: DeleteFileDto) {
    try {
      const _filename = path ? `${path}/${filename}` : filename;
      await this.storage
        .bucket(this.googleCloudConfig.bucket)
        .file(_filename)
        .delete();

      return true;
    } catch (error) {
      throw new Error(error);
    }
  }
}
