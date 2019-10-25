import { AppService } from './app.service';
export declare class AppController {
    private readonly service;
    constructor(service: AppService);
    getHello(): string;
    upload(file: any, res: any): Promise<void>;
}
