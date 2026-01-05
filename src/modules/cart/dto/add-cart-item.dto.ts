import { IsMongoId, IsNumber, Min } from 'class-validator';

export class AddCartItemDto {
  @IsMongoId()
  variantId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
