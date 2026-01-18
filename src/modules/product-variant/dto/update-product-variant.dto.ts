import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsString,
  ValidateNested,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  ProductColorEnum,
  ProductSizeType,
} from 'src/schemas/product-variant.schema';
import { parseJsonArray } from 'src/utils/json';
import { CreateProductSizeVariantDto } from './create-product-variant.dto';

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

  @Transform(
    ({ value }) => {
      const raw = (
        typeof value === 'string'
          ? parseJsonArray<CreateProductSizeVariantDto>(value)
          : value
      ) as CreateProductSizeVariantDto[];
      return plainToInstance(CreateProductSizeVariantDto, raw);
    },
    { toClassOnly: true },
  )
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductSizeVariantDto)
  sizes: CreateProductSizeVariantDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imgUrls: string[];

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
