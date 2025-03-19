import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  MaxLength,
  IsEmail,
  MinLength,
  IsOptional,
  ValidateNested,
  IsArray,
  IsEnum,
} from 'class-validator';
import { RoleType, Address } from 'src/schemas/user.schema';

export class CreateUserDto {
  @IsNotEmpty()
  @MaxLength(20, { message: 'Username is too long' })
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password is too short' })
  @MaxLength(50, { message: 'Password is too long' })
  password: string;

  @IsOptional()
  @MaxLength(11, { message: 'Phone number is too long' })
  phone: string;

  @IsOptional()
  isValidPhone: boolean = false;

  @IsOptional()
  @MaxLength(50, { message: 'Full name is too long' })
  name: string;

  @IsOptional()
  isActive: boolean = true;

  @IsNotEmpty()
  @IsEnum(RoleType)
  role: RoleType;

  @ValidateNested({ each: true })
  @Type(() => Address)
  @IsOptional()
  @IsArray({ message: 'Address must be an array' })
  address: Address[];
}
