# nestjs-image-resizer-upload
Resize and upload images to google cloud storage

# install 
```bash
  npm install --save 'nest-image-resizer'
```

# setup

## async import 

YOUR_GOOGLE_CLOUD_CREDENTIALS = path to your google service account file that gives you permission to upload files to a bucket
```javascript
@Module({
  imports: [
    ImageResizerModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          projectId: config.get('YOUR_GOOGLE_CLOUD_PROJECT_ID'),
          keyFilename: config.get('YOUR_GOOGLE_CLOUD_CREDENTIALS'),
          bucket: config.get('YOUR_GOOGLE_CLOUD_BUCKET_NAME'),
        };
      },
    }),
  ],
})


## Using the service
import { ImageResizerService } from 'nest-image-resizer';

export class YourService {
  constructor(
    private readonly imageResizerService: ImageResizerService,
  ) {}
```
