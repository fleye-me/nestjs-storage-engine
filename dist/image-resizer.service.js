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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageResizerService = void 0;
const image_resizer_constants_1 = require("./image-resizer.constants");
const common_1 = require("@nestjs/common");
const storage_1 = require("@google-cloud/storage");
const sharp = require("sharp");
let ImageResizerService = class ImageResizerService {
    constructor(googleCloudConfig) {
        this.googleCloudConfig = googleCloudConfig;
        if (this.googleCloudConfig.keyFilename) {
            this.storage = new storage_1.Storage({
                projectId: this.googleCloudConfig.projectId,
                keyFilename: this.googleCloudConfig.keyFilename,
            });
        }
        else {
            this.storage = new storage_1.Storage();
        }
    }
    resizeImage(buffer, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return sharp(buffer).resize(options.width, options.height).toBuffer();
        });
    }
    sendToGCS({ buffer, filename, mimetype, path, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const _filename = path ? `${path}/${filename}` : filename;
                    const bucket = this.storage.bucket(this.googleCloudConfig.bucket);
                    const remoteFile = bucket.file(_filename);
                    const stream = remoteFile.createWriteStream({
                        metadata: mimetype ? { contentType: mimetype } : undefined,
                        resumable: false,
                    });
                    stream.on('error', reject);
                    stream.on('finish', () => __awaiter(this, void 0, void 0, function* () {
                        remoteFile.makePublic().then(() => {
                            resolve(`https://storage.googleapis.com/${this.googleCloudConfig.bucket}/${_filename}`);
                        });
                    }));
                    stream.end(buffer);
                }
                catch (err) {
                    console.error('Error trying to upload a file');
                    console.error(err);
                }
            }));
        });
    }
    removeFileFromGCS({ filename, path }) {
        return __awaiter(this, void 0, void 0, function* () {
            const _filename = path ? `${path}/${filename}` : filename;
            return this.storage
                .bucket(this.googleCloudConfig.bucket)
                .file(_filename)
                .delete();
        });
    }
    resizeImageAndUpload(file, sizes = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const pendingUploads = [];
            const imagesUrls = {};
            pendingUploads.push(this.sendToGCS(file).then((url) => (imagesUrls['original'] = url)));
            for (const size of sizes) {
                try {
                    const resizedImage = yield this.resizeImage(file.buffer, size);
                    pendingUploads.push(this.sendToGCS(Object.assign(Object.assign({}, file), { buffer: resizedImage, filename: `${size.width}_${size.height}_${file.filename}` })).then((url) => (imagesUrls[`w${size.width}h${size.height}`] = url)));
                }
                catch (err) {
                    console.error('Resize image error');
                    console.error(err);
                }
            }
            yield Promise.all(pendingUploads);
            return imagesUrls;
        });
    }
};
ImageResizerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(image_resizer_constants_1.GOOGLE_CLOUD_CONFIG)),
    __metadata("design:paramtypes", [Object])
], ImageResizerService);
exports.ImageResizerService = ImageResizerService;
