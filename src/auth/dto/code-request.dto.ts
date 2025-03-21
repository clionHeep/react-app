import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class EmailCodeRequestDto {
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email!: string;
}

export class PhoneCodeRequestDto {
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的手机号码' })
  phone!: string;
} 