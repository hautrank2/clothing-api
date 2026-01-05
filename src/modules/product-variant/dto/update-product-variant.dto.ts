import {
  IsArray,
  IsBoolean,
  IsEnum,
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

export class UpdateProductSizeVariantDto {
  @IsOptional()
  size?: ProductSizeType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/* ======================
   PRODUCT VARIANT DTO
====================== */

export class UpdateProductVariantDto {
  @IsOptional()
  @IsEnum(ProductColorEnum)
  color?: ProductColorEnum;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductSizeVariantDto)
  sizes?: UpdateProductSizeVariantDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imgUrls?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
