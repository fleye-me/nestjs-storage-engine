export class UploadFileDto {
  filename: string;
  buffer: Buffer | string;
  mimeType?: string = '';
  path?: string;
}
