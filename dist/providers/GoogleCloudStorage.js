"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCloudStorage = void 0;
const common_1 = require("@nestjs/common");
const providerNames_1 = require("../constants/providerNames");
const storage_1 = require("@google-cloud/storage");
const storageConfig_dto_1 = require("../dtos/storageConfig.dto");
let GoogleCloudStorage = class GoogleCloudStorage {
    constructor(storageConfig) {
        this.storageConfig = storageConfig;
        this.googleCloudConfig = this.storageConfig.gcp;
        if (this.googleCloudConfig.credentialsKeyPath) {
            this.storage = new storage_1.Storage({
                projectId: this.googleCloudConfig.projectId,
                keyFilename: this.googleCloudConfig.credentialsKeyPath,
            });
        }
        else {
            this.storage = new storage_1.Storage();
        }
    }
    async sendToGCS({ buffer, filename, mimeType, path, }) {
        return new Promise(async (resolve, reject) => {
            try {
                const _filename = path ? `${path}/${filename}` : filename;
                const bucket = this.storage.bucket(this.googleCloudConfig.bucket);
                const remoteFile = bucket.file(_filename);
                const stream = remoteFile.createWriteStream({
                    metadata: mimeType ? { contentType: mimeType } : undefined,
                    resumable: false,
                });
                stream.on('error', reject);
                stream.on('finish', async () => {
                    remoteFile.makePublic().then(() => {
                        resolve(`https://storage.googleapis.com/${this.googleCloudConfig.bucket}/${_filename}`);
                    });
                });
                stream.end(buffer);
            }
            catch (err) {
                console.error('Error trying to upload a file');
                console.error(err);
            }
        });
    }
    async uploadFile({ buffer, filename, path, mimeType }) {
        try {
            const fileUrl = await this.sendToGCS({
                buffer,
                filename,
                mimeType,
                path,
            });
            return { url: fileUrl, filename: filename };
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async deleteFile({ path, filename }) {
        try {
            const _filename = path ? `${path}/${filename}` : filename;
            await this.storage
                .bucket(this.googleCloudConfig.bucket)
                .file(_filename)
                .delete();
            return true;
        }
        catch (error) {
            throw new Error(error);
        }
    }
};
GoogleCloudStorage = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(providerNames_1.STORAGE_CONFIG)),
    __metadata("design:paramtypes", [storageConfig_dto_1.StorageConfigDto])
], GoogleCloudStorage);
exports.GoogleCloudStorage = GoogleCloudStorage;
