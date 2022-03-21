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
exports.StorageEngineService = void 0;
const common_1 = require("@nestjs/common");
const providerNames_1 = require("./constants/providerNames");
const storage_interface_1 = require("./interfaces/storage.interface");
const crypto = require("crypto");
const sharp = require("sharp");
let StorageEngineService = class StorageEngineService {
    constructor(storageEngine) {
        this.storageEngine = storageEngine;
    }
    createUniqueFilename(originalFilename) {
        const hash = crypto.randomBytes(10).toString('hex');
        const arrayFileName = originalFilename.split('.');
        const ext = arrayFileName.pop();
        const restName = arrayFileName[0];
        const uniqueFilename = `${restName}${hash}.${ext}`;
        return uniqueFilename;
    }
    async resizeImage(buffer, options) {
        return sharp(buffer).resize(options.width, options.height).toBuffer();
    }
    async resizeImageAndUpload(file, sizes = []) {
        const pendingUploads = [];
        const imagesUrls = {};
        pendingUploads.push(this.uploadFile(file).then((results) => (imagesUrls['original'] = results)));
        for (const size of sizes) {
            try {
                const resizedImage = await this.resizeImage(file.buffer, size);
                pendingUploads.push(this.uploadFile(Object.assign(Object.assign({}, file), { buffer: resizedImage, filename: `w${size.width}h${size.height}${file.filename}` })).then((results) => (imagesUrls[`w${size.width}h${size.height}`] = results)));
            }
            catch (err) {
                console.error('Resize image error');
                console.error(err);
            }
        }
        await Promise.all(pendingUploads);
        return imagesUrls;
    }
    async uploadFile(data) {
        return this.storageEngine.uploadFile(Object.assign(Object.assign({}, data), { filename: this.createUniqueFilename(data.filename) }));
    }
    async deleteFile(data) {
        return this.storageEngine.deleteFile(data);
    }
};
StorageEngineService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(providerNames_1.PROVIDER_ENGINE_NAME)),
    __metadata("design:paramtypes", [storage_interface_1.StorageInterface])
], StorageEngineService);
exports.StorageEngineService = StorageEngineService;
