import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class PhoneLoginDto {
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的手机号码' })
  phone!: string;

  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString({ message: '验证码必须是字符串' })
  @Length(6, 6, { message: '验证码长度必须为6位' })
  code!: string;
} 