import { DeleteFileDto } from '../dtos/deleteFile.dto';
import { StorageConfigDto } from '../dtos/storageConfig.dto';
import { UploadFileDto } from '../dtos/uploadFile.dto';
import { StorageInterface } from '../interfaces/storage.interface';
export declare class LocalStorage implements StorageInterface {
    private storageConfig;
    constructor(storageConfig: StorageConfigDto);
    uploadFile({ filename, path, buffer }: UploadFileDto): Promise<{
        filename: string;
        url: string;
    }>;
    deleteFile({ path, filename }: DeleteFileDto): Promise<boolean>;
}
