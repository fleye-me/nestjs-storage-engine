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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const storage_1 = require("@google-cloud/storage");
const sharp = require("sharp");
const PROJECT_ID = 'image-upload-254517';
const KEY_FILENAME = './src/resources/keys/image-upload-254517-fdc92df44e9a.json';
const BUCKET = '7fd8d9003b12c804598e777200496dfc';
let AppService = class AppService {
    constructor() {
        this.storage = new storage_1.Storage({
            projectId: PROJECT_ID,
            keyFilename: KEY_FILENAME
        });
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
                    const _filename = `${Date.now()}${filename}`;
                    const bucket = yield this.storage.bucket(BUCKET);
                    const remoteFile = bucket.file(_filename);
                    const stream = remoteFile.createWriteStream({
                        metadata: { contentType: mimetype },
                        resumable: false
                    });
                    stream.on('error', reject);
                    stream.on('finish', () => __awaiter(this, void 0, void 0, function* () {
                        remoteFile.makePublic().then(() => {
                            resolve(`https://storage.googleapis.com/${BUCKET}/${_filename}`);
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
    upload(res, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const sizes = [50, 100, 200, 500];
            const pendingUploads = [];
            const imagesUrls = {};
            pendingUploads.push(this.sendToGCS(file.buffer, file.originalname, file.mimetype).then(url => imagesUrls['original'] = url));
            for (const size of sizes) {
                this.resize(file.buffer, { width: size, height: size }).then(smallImage => {
                    pendingUploads.push(this.sendToGCS(smallImage, `${size}_${size}_${file.originalname}`, file.mimetype).then(url => imagesUrls[size] = url));
                }).catch(err => {
                    console.error('Resize image error');
                    console.error(err);
                });
            }
            yield Promise.all(pendingUploads);
            res.end(JSON.stringify(imagesUrls));
        });
    }
};
AppService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [])
], AppService);
exports.AppService = AppService;
//# sourceMappingURL=app.service.js.map