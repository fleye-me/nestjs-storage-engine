import { UploadFileResultsDto } from "./uploadFileResults.dto";

export class UploadedFileDto extends UploadFileResultsDto {
  originalFilename: string;
  path?: string;
}
