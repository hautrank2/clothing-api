import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Product } from './product.schema';

export interface Item {
  product: string | Product;
  size: string;
  color: string;
  quantity: number;
}

export class ItemDto {
  @IsMongoId()
  product: string;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber()
  quantity: number;
}
