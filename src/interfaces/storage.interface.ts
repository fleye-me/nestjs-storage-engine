import { DeleteFileDto } from "../dtos/deleteFile.dto";
import { UploadFileDto } from "../dtos/uploadFile.dto";
import { UploadFileResultsDto } from "../dtos/uploadFileResults.dto";

export abstract class StorageInterface {
  public uploadFile: (data: UploadFileDto) => Promise<UploadFileResultsDto>;
  public deleteFile: (data: DeleteFileDto) => Promise<boolean>;
}
