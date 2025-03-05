import { Injectable } from '@nestjs/common';
import { catchError, from, map, Observable, throwError } from 'rxjs';
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

  uploadFile(file: Express.Multer.File, folder: string[]): Observable<string> {
    return from(
      cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          public_id: `${Date.now()}-${file.originalname}`,
          folder: folder.join('/'),
        },
      ),
    ).pipe(
      catchError(() => throwError('Upload failed')),
      map((res: UploadApiResponse) => {
        return res.url;
      }),
    );
  }

  removeFile(path: string): Observable<string> {
    return from(cloudinary.uploader.destroy(path)).pipe(
      map((res: UploadApiResponse) => {
        console.log('remove d', res);
        return res.url;
      }),
    );
  }
}
