import { GoogleCloudConfigDto } from "./googleCloudConfig.dto";
export declare class StorageConfigDto {
    providerEngineName: "disk" | "gcp";
    disk?: {
        uploadsFolder: string;
        serverStaticFilesBaseUrl: string;
    };
    gcp?: GoogleCloudConfigDto;
}
