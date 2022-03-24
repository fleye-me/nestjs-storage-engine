import { DynamicModule, Global, Module, Provider } from "@nestjs/common";
import { PROVIDER_ENGINE_NAME, STORAGE_CONFIG, STORAGE_CONFIG_MODULE_OPTIONS } from "./constants/providerNames";
import { StorageConfigDto } from "./dtos/storageConfig.dto";
import { StorageConfigAsyncOptions } from "./interfaces/storageConfigAsyncOptions.interface";
import { StorageEngineTypes } from "./interfaces/storageEngine.types";
import { GoogleCloudStorage } from "./providers/GoogleCloudStorage";
import { LocalStorage } from "./providers/LocalStorage";
import { StorageEngineService } from "./storage.service";

@Global()
@Module({
  providers: [StorageEngineService,
    {
      provide: PROVIDER_ENGINE_NAME,
      useFactory: (config: StorageConfigDto) => {
        switch (config.providerEngineName) {
          case StorageEngineTypes.CGP:
            return new GoogleCloudStorage(config)
          default:
            return new LocalStorage(config)
        }
      },
      inject: [STORAGE_CONFIG],
    }
  ],
  exports: [StorageEngineService],
})
export class StorageEngineModule {
  private static createAsyncOptionsProvider(
    options: StorageConfigAsyncOptions,
  ): Provider {
    return {
      provide: STORAGE_CONFIG_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }

  private static createAsyncProviders(
    options: StorageConfigAsyncOptions,
  ): Provider[] {
    if (options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [];
  }

  static register(config: StorageConfigDto): DynamicModule {
    return {
      module: StorageEngineModule,
      providers: [
        {
          provide: STORAGE_CONFIG,
          useValue: config,
        },
      ],
    };
  }

  static registerAsync(options: StorageConfigAsyncOptions): DynamicModule {
    return {
      module: StorageEngineModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: STORAGE_CONFIG,
          useFactory: (config: StorageConfigDto) => config,
          inject: [STORAGE_CONFIG_MODULE_OPTIONS],
        },
        ...(options.extraProviders || []),
      ],
    };
  }
}