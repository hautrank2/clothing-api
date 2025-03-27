import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  IsString,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AtLeastOne } from 'src/utils/validate';

export type UserDocument = User & Document;

export enum RoleType {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export enum AddressType {
  HOME = 'home',
  OFFICE = 'office',
}

export class Address {
  @Prop({ required: true })
  @IsNotEmpty({ message: 'Country is required' })
  @IsString({ message: 'Country must be a string' })
  country: string;

  @Prop({ required: true })
  @IsNotEmpty({ message: 'City is required' })
  @IsString({ message: 'City must be a string' })
  city: string;

  @Prop({ required: true })
  @IsNotEmpty({ message: 'District is required' })
  @IsString({ message: 'District must be a string' })
  district: string;

  @Prop({ required: true })
  @IsNotEmpty({ message: 'Street is required' })
  @IsString({ message: 'Street must be a string' })
  street: string;

  @Prop()
  @IsOptional()
  @IsString({ message: 'Zip code must be a string' })
  zipCode?: string;

  @Prop({ required: true, enum: AddressType })
  @IsNotEmpty({ message: 'Address type is required' })
  @IsEnum(AddressType, {
    message: 'Address type must be either "home" or "office"',
  })
  type: AddressType;
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  @IsNotEmpty()
  @MaxLength(20, { message: 'Username is too long' })
  username: string;

  @Prop({ default: '' })
  @IsOptional()
  @IsEmail()
  email: string;

  @Prop()
  @IsOptional({ message: 'Password is required' })
  @MinLength(6, { message: 'Password is too short' })
  @MaxLength(50, { message: 'Password is too long' })
  password: string;

  @Prop({ default: '' })
  @IsOptional()
  @MaxLength(11, { message: 'Phone number is too long' })
  phone: string;

  @Prop({ required: true, default: false })
  @IsOptional()
  isValidPhone: boolean;

  @Prop({ required: true })
  @IsOptional()
  @MaxLength(50, { message: 'Full name is too long' })
  name: string;

  @Prop({ required: true, enum: RoleType, default: RoleType.CUSTOMER })
  @IsNotEmpty()
  role: RoleType;

  @Prop({ required: true, default: true })
  @IsNotEmpty()
  isActive: boolean;

  @Prop({ type: [Address], default: [] })
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

export const UserSchema = SchemaFactory.createForClass(User);
