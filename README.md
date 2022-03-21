# @fleye-me/storage-engine
- Upload files to Google Cloud Storage or save in to local disk
- Delete files uploaded
- Resize and upload images
- Upload files in different sizes

# Install 
```bash
  npm i '@fleye-me/storage-engine'
```
or
```bash
  yarn add '@fleye-me/storage-engine'
```

# Setup

## Async import 

YOUR_GOOGLE_CLOUD_CREDENTIALS = path to your google service account file that gives you permission to upload files to a bucket
```javascript
@Module({
  imports: [
    StorageEngineModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          providerEngineName: 'gcp', // gcp or disk
          disk: { // if you use local disk
            uploadsFolder: path.resolve(__dirname, '..', 'uploads'),
            serverStaticFilesBaseUrl: config.get('SERVER_STATIC_FILES_BASE_URL'),
          },
          gcp: {  // if you use google cloud storage
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

## Using the service
```javascript
import { StorageEngineService } from '@fleye-me/storage-engine';

export class YourService {
  constructor(
    private storageService: StorageEngineService,
  ) {}
}
```
