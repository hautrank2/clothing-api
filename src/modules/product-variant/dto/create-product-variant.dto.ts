import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ProductColorEnum,
  ProductSizeType,
} from 'src/schemas/product-variant.schema';

/* ======================
   SIZE DTO
====================== */

export class CreateProductSizeVariantDto {
  @IsNotEmpty()
  size: ProductSizeType;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/* ======================
   PRODUCT VARIANT DTO
====================== */

export class CreateProductVariantDto {
  @IsMongoId()
  productId: string;

  @IsEnum(ProductColorEnum)
  color: ProductColorEnum;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductSizeVariantDto)
  sizes: CreateProductSizeVariantDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imgUrls?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
