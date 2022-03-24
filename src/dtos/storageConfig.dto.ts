import { GoogleCloudConfigDto } from "./googleCloudConfig.dto";

export class StorageConfigDto {
  providerEngineName: "disk" | "gcp";
  disk?: {
    uploadsFolder: string;
    serverStaticFilesBaseUrl: string;
  };
  gcp?: GoogleCloudConfigDto
}
