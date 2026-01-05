import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { PaymentMethod } from 'src/schemas/payment.schema';
import { AddressDto } from 'src/schemas/user.schema';

export class CreateOrderDto {
  @IsMongoId()
  userId: string;

  // Thanh toán lúc nhận / chuyển khoản
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  address: AddressDto;

  @IsString()
  @IsNotEmpty()
  phone: string;
}
