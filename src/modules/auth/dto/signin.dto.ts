import { IsNotEmpty, IsOptional } from 'class-validator';

export class SigninDto {
  @IsOptional()
  username: string;

  @IsOptional()
  email: string;

  @IsOptional()
  phone: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
