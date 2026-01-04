import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Code must be a string' })
  code: string;

  @IsString({ message: 'Title must be a string' })
  title: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  @IsString({ message: 'Category ID must be a string' })
  categoryId: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;
}
