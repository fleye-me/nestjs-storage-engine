import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ImageResizerService } from './image-resizer.service';
import { GoogleCloudConfig } from './interfaces/google-cloud.interface';
import { ImageResizerModuleAsyncOptions } from './interfaces/async-options.interface';
import { GOOGLE_CLOUD_CONFIG, IMAGE_RESIZER_MODULE_OPTIONS } from './image-resizer.constants';

@Module({
  providers: [ImageResizerService],
  exports: [ImageResizerService],
})
export class ImageResizerModule {
  static register(emailConfig: GoogleCloudConfig): DynamicModule {
    return {
      module: ImageResizerModule,
      providers: [
        {
          provide: GOOGLE_CLOUD_CONFIG,
          useValue: emailConfig,
        },
      ],
    };
  }

  static registerAsync(options: ImageResizerModuleAsyncOptions): DynamicModule {
    return {
      module: ImageResizerModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: GOOGLE_CLOUD_CONFIG,
          useFactory: (emailConfig: GoogleCloudConfig) => emailConfig,
          inject: [IMAGE_RESIZER_MODULE_OPTIONS],
        },
        ...(options.extraProviders || []),
      ],
    };
  }

  private static createAsyncProviders(
    options: ImageResizerModuleAsyncOptions,
  ): Provider[] {
    if (options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [ ];
  }

  private static createAsyncOptionsProvider(
    options: ImageResizerModuleAsyncOptions,
  ): Provider {
    return {
      provide: IMAGE_RESIZER_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }
}
