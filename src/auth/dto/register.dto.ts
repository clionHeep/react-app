import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString, Matches } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  username!: string;

  @IsOptional()
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email?: string;

  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的手机号码' })
  phone?: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于6个字符' })
  password!: string;

  @IsString({ message: '姓名必须是字符串' })
  @IsOptional()
  name?: string;

  @IsOptional()
  roles?: string[] | string | null | undefined;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  birthday?: Date;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
