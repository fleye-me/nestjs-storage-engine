import { DynamicModule } from '@nestjs/common';
import { GoogleCloudConfig } from './interfaces/google-cloud.interface';
import { ImageResizerModuleAsyncOptions } from './interfaces/async-options.interface';
export declare class ImageResizerModule {
    static register(emailConfig: GoogleCloudConfig): DynamicModule;
    static registerAsync(options: ImageResizerModuleAsyncOptions): DynamicModule;
    private static createAsyncProviders;
    private static createAsyncOptionsProvider;
}
