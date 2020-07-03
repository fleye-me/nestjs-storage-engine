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
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
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
    getHello() {
        return 'Hello World!';
    }
    resize(buffer, options = { width: 50, height: 50 }) {
        return __awaiter(this, void 0, void 0, function* () {
            return sharp(buffer).resize(options.width, options.height).toBuffer();
        });
    }
    sendToGCS(buffer, filename, mimetype) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const _filename = `${filename}`;
                    const bucket = yield this.storage.bucket(this.googleCloudConfig.bucket);
                    const remoteFile = bucket.file(_filename);
                    const stream = remoteFile.createWriteStream({
                        metadata: { contentType: mimetype },
                        resumable: false
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
    removeFromGCS(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storage
                .bucket(this.googleCloudConfig.bucket)
                .file(filename)
                .delete();
        });
    }
    upload(file, { path, filename, sizes }) {
        return __awaiter(this, void 0, void 0, function* () {
            const pendingUploads = [];
            const imagesUrls = {};
            sizes = sizes ? sizes : [];
            filename = filename ? filename : file.originalname;
            pendingUploads.push(this.sendToGCS(file.buffer, `${path ? `${path}/` : ''}${filename}`, file.mimetype).then(url => imagesUrls['original'] = url));
            for (const size of sizes) {
                this.resize(file.buffer, size).then(resizedImage => {
                    pendingUploads.push(this.sendToGCS(resizedImage, `${path ? `${path}/` : ''}${size.width}_${size.height}_${filename}`, file.mimetype).then(url => imagesUrls[`${size.width || size.height}x${size.height || size.width}`] = url));
                }).catch(err => {
                    console.error('Resize image error');
                    console.error(err);
                });
            }
            yield Promise.all(pendingUploads);
            return imagesUrls;
        });
    }
};
ImageResizerService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject(image_resizer_constants_1.GOOGLE_CLOUD_CONFIG)),
    __metadata("design:paramtypes", [Object])
], ImageResizerService);
exports.ImageResizerService = ImageResizerService;
