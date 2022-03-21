import { DeleteFileDto } from "../dtos/deleteFile.dto";
import { UploadFileDto } from "../dtos/uploadFile.dto";
import { UploadFileResultsDto } from "../dtos/uploadFileResults.dto";
export declare abstract class StorageInterface {
    uploadFile: (data: UploadFileDto) => Promise<UploadFileResultsDto>;
    deleteFile: (data: DeleteFileDto) => Promise<boolean>;
}
