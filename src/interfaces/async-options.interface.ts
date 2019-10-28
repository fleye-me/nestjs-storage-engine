import { Provider } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { GoogleCloudConfig } from './google-cloud.interface';

export interface ImageResizerModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (
    ...args: any[]
  ) => Promise<GoogleCloudConfig> | GoogleCloudConfig;
  inject?: any[];
  extraProviders?: Provider[];
}
