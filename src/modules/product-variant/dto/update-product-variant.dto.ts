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
  size: ProductSizeType;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  sku: string;

  @IsBoolean()
  isActive: boolean;
}

/* ======================
   PRODUCT VARIANT DTO
====================== */

export class UpdateProductVariantDto {
  @IsEnum(ProductColorEnum)
  color: ProductColorEnum;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductSizeVariantDto)
  sizes?: UpdateProductSizeVariantDto[];

  @IsArray()
  @IsString({ each: true })
  imgUrls: string[];

  @IsBoolean()
  isActive: boolean;
}
