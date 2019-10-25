export declare class AppService {
    private storage;
    constructor();
    getHello(): string;
    resize(buffer: any, options?: {
        width: number;
        height: number;
    }): Promise<any>;
    sendToGCS(buffer: any, filename: string, mimetype: string): Promise<{}>;
    upload(res: any, file: any): Promise<void>;
}
