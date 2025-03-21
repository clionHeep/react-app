import { IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  username!: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于6个字符' })
  password!: string;

  @IsOptional()
  @IsString({ message: '姓名必须是字符串' })
  name?: string;

  @IsOptional()
  @IsString({ message: '角色必须是字符串' })
  roles?: string;
}
