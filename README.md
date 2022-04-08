<h1 align="center">
@fleye-me/nestjs-storage-engine
</h1>

<h2 align="center">
Provides file uploads with the Google Cloud Store or conveniently locally to NestJs.
</h2>

# Features

- Upload files
- Delete files uploaded
- Resize Image
- Resize and upload images
- Upload files in different sizes

# Indice

- [Installation](#Installation)
- [Getting Started](#Getting-Started)
- [Upload Files](#Upload-Files)
- [Delete Files Uploaded](#Delete-Files-Uploaded)
- [Resize Image](#Resize-Image)
- [Resize And Upload Images](#Resize-And-Upload-Images)

# Installation

```bash
npm i @fleye-me/nestjs-storage-engine
```

or

```bash
yarn add @fleye-me/nestjs-storage-engine
```

# Getting Started

## Async import using Google Cloud Storage config

`Update app.module.ts with:`

```javascript
import { StorageEngineModule } from '@fleye-me/nestjs-storage-engine';

@Module({
  imports: [
    StorageEngineModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          providerEngineName: 'gcp',
          gcp: {
            projectId: config.get('GOOGLE_CLOUD_PROJECT_ID'),
            credentialsKeyPath: config.get('GOOGLE_CLOUD_CREDENTIALS'),
            bucket: config.get('GOOGLE_CLOUD_BUCKET'),
          },
        };
      },
    }),
  ],
})
```

YOUR_GOOGLE_CLOUD_CREDENTIALS = path to your google service account file that gives you permission to upload files to a bucket

`Update .env with:`

```env
# Storage engine
STORAGE_ENGINE=gcp # disk or gcp

# Google Cloud
GOOGLE_CLOUD_BUCKET=
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_CREDENTIALS=
```

## Async import using Local Disk config

`Update app.module.ts with:`

```javascript
import { StorageEngineModule } from '@fleye-me/nestjs-storage-engine';
import * as path from 'path'

@Module({
  imports: [
    StorageEngineModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          providerEngineName: 'disk',
          disk: {
            // below is path to save files
            uploadsFolder: path.resolve(__dirname, '..', 'uploads'),
            serverStaticFilesBaseUrl: config.get('SERVER_STATIC_FILES_BASE_URL'),
          }
        };
      },
    }),
  ],
})
```

`Update main.ts with:`

```javascript
import { NestFactory } from "@nestjs/core"
import * as path from "path"

const app = (await NestFactory.create) < NestExpressApplication > AppModule

app.useStaticAssets(path.join(__dirname, "..", "uploads"), {
  prefix: "/static/",
})
```

`Update .env with:`

```javascript
# Storage engine
STORAGE_ENGINE=disk # disk or gcp
SERVER_STATIC_FILES_BASE_URL=http://localhost:8080/static
```

## Using the service

```javascript
import { StorageEngineService } from '@fleye-me/nestjs-storage-engine';

export class YourService {
  constructor(
    private storageService: StorageEngineService,
  ) {}
}
```

# Upload files

```Typescript
async uploadFile(buffer: Buffer | string) {
    const fileResult = await this.storageService.uploadFile({
        filename: 'example',
        path: 'upload-example',
        buffer,
        mimeType: 'application/pdf',
      });

    return fileResult;
  }
```

**Output**

```json
{
  "url": "https://storage.googleapis.com/example/upload-example/example.pdf",
  "filename": "example.pdf",
  "originalFilename": "example.pdf",
  "path": "upload-example"
}
```

# Delete Files Uploaded

```Typescript

async deleteFile() {
    const deleteFile = await this.storageService.deleteFile({
        path: 'upload-example',
        filename: 'example.pdf',
      });

    return deleteFile;
  }
```

**Output**

```json
true
```

# Resize Image

```Typescript
async resizeImage(
  buffer: Buffer | string,
  ) {

    const fileResults = await this.storageService.resizeImage(resizeImage(
        {
          buffer: image,
        },
        {
          width: 600,
          height: 600,
        },
      ));

    return fileResults;
  }

```

# Resize Image And Upload

```Typescript
import { SizeOptionsDto } from '@fleye-me/nestjs-storage-engine';

async resizeImageAndUpload(
  buffer: Buffer | string,
  sizes?: SizeOptionsDto[]
  ) {

    const fileResults = await this.storageService.resizeImageAndUpload({
        buffer,
        filename: 'example',
        mimeType: 'application/pdf',
        path: 'invoice',
      },
      [
        {
        width: sizes.width,
        height: sizes.height,
        }
      ]
      );

    return fileResults;
  }

```
