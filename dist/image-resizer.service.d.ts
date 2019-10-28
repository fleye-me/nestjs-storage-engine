import { GoogleCloudConfig } from './interfaces/google-cloud.interface';
export declare class ImageResizerService {
    private readonly googleCloudConfig;
    private storage;
    constructor(googleCloudConfig: GoogleCloudConfig);
    getHello(): string;
    resize(buffer: any, options?: {
        width: number;
        height: number;
    }): Promise<any>;
    sendToGCS(buffer: any, filename: string, mimetype: string): Promise<{}>;
    upload(res: any, file: any): Promise<void>;
}
