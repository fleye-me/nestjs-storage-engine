import { GoogleCloudConfig } from './interfaces/google-cloud.interface';
import { IUploadOptions } from './interfaces/uploadOptions.interface';
export declare class ImageResizerService {
    private readonly googleCloudConfig;
    private storage;
    constructor(googleCloudConfig: GoogleCloudConfig);
    getHello(): string;
    resize(buffer: any, options?: {
        width?: number;
        height?: number;
    }): Promise<any>;
    sendToGCS(buffer: any, filename: string, mimetype: string): Promise<{}>;
    removeFromGCS(filename: string): Promise<[import("teeny-request").Response<any>]>;
    upload(file: any, { path, filename, sizes }: IUploadOptions): Promise<{}>;
}
