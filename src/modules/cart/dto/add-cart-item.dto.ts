import { IsMongoId, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ProductSizeType } from 'src/schemas/product-variant.schema';

export class AddCartItemDto {
  @IsMongoId()
  variantId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNotEmpty()
  size: ProductSizeType;
}
