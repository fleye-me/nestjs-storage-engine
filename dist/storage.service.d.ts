/// <reference types="node" />
import { DeleteFileDto } from './dtos/deleteFile.dto';
import { UploadFileDto } from './dtos/uploadFile.dto';
import { StorageInterface } from './interfaces/storage.interface';
import { SizeOptionsDto } from './dtos/sizeOptions.dto';
import { UploadFileResultsDto } from './dtos/uploadFileResults.dto';
export declare class StorageEngineService {
    private storageEngine;
    constructor(storageEngine: StorageInterface);
    createUniqueFilename(originalFilename: string): string;
    resizeImage(buffer: Buffer | string, options: SizeOptionsDto): Promise<Buffer>;
    resizeImageAndUpload(file: UploadFileDto, sizes?: SizeOptionsDto[]): Promise<Record<string, UploadFileResultsDto>>;
    uploadFile(data: UploadFileDto): Promise<UploadFileResultsDto>;
    deleteFile(data: DeleteFileDto): Promise<boolean>;
}
