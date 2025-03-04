import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './modules/category/category.module';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { ConfigModule } from '@nestjs/config';
import { UploadService } from './services/upload.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRoot(process.env.MONGO_CONNECTION_STRING || ''),
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService, UploadService],
  exports: [UploadService],
})
export class AppModule {}
