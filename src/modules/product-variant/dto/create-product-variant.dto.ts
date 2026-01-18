import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  ValidateNested,
  IsArray,
  ValidateIf,
} from 'class-validator';
import {
  ProductColorEnum,
  ProductSizeEnum,
  ProductSizeType,
} from 'src/schemas/product-variant.schema';
import { parseJsonArray } from 'src/utils/json';

/* ======================
   SIZE DTO
====================== */

export class CreateProductSizeVariantDto {
  @Transform(({ value }) => {
    if (
      typeof value === 'string' &&
      value.trim() !== '' &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }
    return value as number | string;
  })
  @IsNotEmpty()
  @ValidateIf(o => typeof o === 'string')
  @IsEnum(ProductSizeEnum)
  @ValidateIf(o => typeof o === 'number')
  @IsNumber()
  @Min(0)
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
  @IsBoolean()
  isActive?: boolean;
}
