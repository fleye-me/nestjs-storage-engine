# @fleye-me/nestjs-storage-engine
- Upload files to Google Cloud Storage or save in to local disk
- Delete files uploaded
- Resize and upload images
- Upload files in different sizes

# Install 
```bash
npm i @fleye-me/nestjs-storage-engine
```
or
```bash
yarn add @fleye-me/nestjs-storage-engine
```

# Setup

## Async import using Google Cloud Storage config

`Update app.module.ts with:`
```javascript
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
```javascript
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
@Module({
  imports: [
    StorageEngineModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          providerEngineName: 'disk',
          disk: {
            uploadsFolder: path.resolve(__dirname, '..', 'uploads'), // path to save files
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
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(path.join(__dirname, '..', 'uploads'), {
    prefix: '/static/',
  });
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
