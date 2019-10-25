import { Controller, Get, Post, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly service: AppService) { }

  @Get()
  getHello(): string {
    return this.service.getHello();
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file, @Res() res) {
    this.service.upload(res, file);
  }
}
