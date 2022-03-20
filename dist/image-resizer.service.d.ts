/// <reference types="node" />
import { GoogleCloudConfig } from './interfaces/google-cloud.interface';
import { SizeOptionsDto } from './interfaces/sizeOptions.dto';
import { FileOptionsDto } from './interfaces/fileOptions.dto';
import { RemoveFileOptionsDto } from './interfaces/removeFileOptions.dto';
export declare class ImageResizerService {
    private readonly googleCloudConfig;
    private storage;
    constructor(googleCloudConfig: GoogleCloudConfig);
    resizeImage(buffer: Buffer | string, options: SizeOptionsDto): Promise<Buffer>;
    sendToGCS({ buffer, filename, mimetype, path, }: FileOptionsDto): Promise<string>;
    removeFileFromGCS({ filename, path }: RemoveFileOptionsDto): Promise<[import("teeny-request").Response<any>]>;
    resizeImageAndUpload(file: FileOptionsDto, sizes?: SizeOptionsDto[]): Promise<Record<string, string>>;
}
