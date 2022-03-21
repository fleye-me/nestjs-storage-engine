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
exports.LocalStorage = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const destination = require("path");
const providerNames_1 = require("../constants/providerNames");
const storageConfig_dto_1 = require("../dtos/storageConfig.dto");
let LocalStorage = class LocalStorage {
    constructor(storageConfig) {
        this.storageConfig = storageConfig;
    }
    async uploadFile({ filename, path, buffer }) {
        const encodeURIFileName = encodeURIComponent(filename);
        const writeToPath = destination.resolve(this.storageConfig.disk.uploadsFolder, path);
        fs.mkdirSync(writeToPath, { recursive: true });
        fs.writeFileSync(`${writeToPath}/${filename}`, buffer);
        const fileUrl = `${this.storageConfig.disk.serverStaticFilesBaseUrl}/${path}/${encodeURIFileName}`;
        return {
            filename,
            url: fileUrl,
        };
    }
    async deleteFile({ path, filename }) {
        const filePath = destination.resolve(this.storageConfig.disk.uploadsFolder, path, filename);
        try {
            await fs.promises.stat(filePath);
        }
        catch (_a) {
            common_1.Logger.error(`File not exists in ${path}/${filename}`);
        }
        await fs.promises.unlink(filePath);
        return true;
    }
};
LocalStorage = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(providerNames_1.STORAGE_CONFIG)),
    __metadata("design:paramtypes", [storageConfig_dto_1.StorageConfigDto])
], LocalStorage);
exports.LocalStorage = LocalStorage;
