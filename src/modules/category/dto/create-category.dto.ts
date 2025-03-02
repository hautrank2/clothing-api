import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Code is required' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'ImgUrl is required' })
  imgUrl: string;

  @IsOptional()
  @IsMongoId({ message: 'Invalid parentId format' })
  parentId?: string | null;
}
