import { Transform, Type } from 'class-transformer';
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
import { AtLeastOne } from 'src/utils/validate';

export class CreateUserDto {
  @IsNotEmpty()
  @MaxLength(20, { message: 'Username is too long' })
  username: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }): string => value ?? '')
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password is too short' })
  @MaxLength(50, { message: 'Password is too long' })
  password: string;

  @IsOptional()
  @MaxLength(11, { message: 'Phone number is too long' })
  @Transform(({ value }): string => value ?? '')
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

  @AtLeastOne(['email', 'phone'], {
    message: 'Email or phone number is required',
  })
  emailOrPhone: string;
}

export class UserWithEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
