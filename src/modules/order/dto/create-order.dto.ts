import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from 'src/schemas/order.schema';
import { AddressDto } from 'src/schemas/user.schema';
import { ItemDto } from 'src/schemas/item.schema';

export class CreateOrderDto {
  @IsMongoId()
  user: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];

  @IsNumber()
  shippingFee: number;

  @IsNumber()
  totalPrice: number;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsMongoId()
  @IsOptional()
  paymentId?: string;

  @IsOptional()
  @Type(() => Date)
  deliveredAt?: Date;
}
