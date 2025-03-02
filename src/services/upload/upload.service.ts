import { Injectable } from '@nestjs/common';
import { from, Observable, switchMap } from 'rxjs';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: configService.get<string>('cloudinary.name'),
      api_key: configService.get<string>('cloudinary.apiKey'),
      api_secret: configService.get<string>('cloudinary.apiSecret'),
    });
  }

  uploadFile(file: Express.Multer.File): Observable<string> {
    return from(
      cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          public_id: `${Date.now()}-${file.originalname}`,
          folder: 'testing',
        },
      ),
    ).pipe(
      switchMap((res: UploadApiResponse) => {
        return res.url;
      }),
    );
  }
}
