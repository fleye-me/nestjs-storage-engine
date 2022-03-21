import { Provider } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { StorageConfigDto } from '../dtos/storageConfig.dto';

export interface StorageConfigAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (
    ...args: any[]
  ) => Promise<StorageConfigDto> | StorageConfigDto;
  inject?: any[];
  extraProviders?: Provider[];
}
