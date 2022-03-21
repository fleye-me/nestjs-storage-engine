import { StorageInterface } from '../interfaces/storage.interface';
import { UploadFileDto } from '../dtos/uploadFile.dto';
import { DeleteFileDto } from '../dtos/deleteFile.dto';
import { StorageConfigDto } from '../dtos/storageConfig.dto';
export declare class GoogleCloudStorage implements StorageInterface {
    private readonly storageConfig;
    private storage;
    private googleCloudConfig;
    constructor(storageConfig: StorageConfigDto);
    sendToGCS({ buffer, filename, mimeType, path, }: UploadFileDto): Promise<string>;
    uploadFile({ buffer, filename, path, mimeType }: UploadFileDto): Promise<{
        url: string;
        filename: string;
    }>;
    deleteFile({ path, filename }: DeleteFileDto): Promise<boolean>;
}
