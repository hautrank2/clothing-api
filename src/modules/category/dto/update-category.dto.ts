import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsFile } from 'src/utils/validate';

export class UpdateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Code is required' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsFile(
    { mime: ['image/jpeg', 'image/png'] },
    { message: 'Only JPG and PNG are allowed' },
  )
  @IsOptional({ message: 'Title is required' })
  image: Express.Multer.File; // Thay imgUrl bằng image file

  @IsString()
  @IsNotEmpty({ message: 'ImgUrl is required' })
  imgUrl: string;

  @IsOptional()
  @IsMongoId({ message: 'Invalid parentId format' })
  parentId?: string | null;
}
