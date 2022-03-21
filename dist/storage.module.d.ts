import { DynamicModule } from "@nestjs/common";
import { StorageConfigDto } from "./dtos/storageConfig.dto";
import { StorageConfigAsyncOptions } from "./interfaces/storageConfigAsyncOptions.interface";
export declare class StorageEngineModule {
    private static createAsyncOptionsProvider;
    private static createAsyncProviders;
    static register(config: StorageConfigDto): DynamicModule;
    static registerAsync(options: StorageConfigAsyncOptions): DynamicModule;
}
