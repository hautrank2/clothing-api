import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
  Min,
  MaxLength,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum Color {
  BLACK = 'black',
  WHITE = 'white',
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  ORANGE = 'orange',
  BROWN = 'brown',
  GRAY = 'gray',
}

export class ProductColorDto {
  @IsEnum(Color, { message: 'Invalid color value' })
  color: Color;

  @IsString()
  @MaxLength(7, { message: 'HEX code must be at most 7 characters long' })
  hexCode: string;

  @IsArray()
  @ArrayMinSize(2, { message: 'Each color must have at least 2imgUrls' })
  @IsString({
    each: true,
    message: 'Images must be an array of strings (URLs)',
  })
  imgUrls: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSizeStockDto)
  sizes: ProductSizeStockDto[];
}

export class ProductSizeStockDto {
  @IsString({ message: 'Size must be a string or number' })
  size: string | number;

  @IsNumber()
  @Min(0, { message: 'Stock quantity cannot be negative' })
  stock: number;
}

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

  @IsArray({ message: 'Colors must be an array' })
  @ArrayMinSize(1, {
    message: 'The product must have at least one color option',
  })
  @ValidateNested({ each: true })
  @Type(() => ProductColorDto)
  colors: ProductColorDto[];
}
