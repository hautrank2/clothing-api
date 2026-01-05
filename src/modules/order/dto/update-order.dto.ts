import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from 'src/schemas/order.schema';

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
