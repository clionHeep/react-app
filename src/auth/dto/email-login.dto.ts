import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class EmailLoginDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email!: string;

  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString({ message: '验证码必须是字符串' })
  @Length(6, 6, { message: '验证码长度必须为6位' })
  code!: string;
} 