import { IsEmail, IsNotEmpty, IsString, Length, Matches, ValidateIf } from 'class-validator';

export class ResetPasswordDto {
  @ValidateIf(o => !o.phone)
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email?: string;

  @ValidateIf(o => !o.email)
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的手机号码' })
  phone?: string;

  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString({ message: '验证码必须是字符串' })
  @Length(6, 6, { message: '验证码长度必须为6位' })
  code!: string;

  @IsNotEmpty({ message: '新密码不能为空' })
  @IsString({ message: '新密码必须是字符串' })
  @Length(6, 20, { message: '新密码长度必须在6-20个字符之间' })
  newPassword!: string;
} 