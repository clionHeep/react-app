import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Req, UnauthorizedException, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { EmailCodeRequestDto, PhoneCodeRequestDto } from './dto/code-request.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Request } from 'express';
import type { UserInfo } from '../types/types';
import { Roles } from '../lib/services/decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  @Post('forgot-password/email')
  @HttpCode(HttpStatus.OK)
  async forgotPasswordEmail(@Body() emailCodeRequestDto: EmailCodeRequestDto) {
    return this.authService.sendResetPasswordEmailCode(emailCodeRequestDto.email);
  }

  @Post('forgot-password/phone')
  @HttpCode(HttpStatus.OK)
  async forgotPasswordPhone(@Body() phoneCodeRequestDto: PhoneCodeRequestDto) {
    return this.authService.sendResetPasswordSmsCode(phoneCodeRequestDto.phone);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new UnauthorizedException('刷新令牌不能为空');
    }
    return this.authService.refreshToken(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    const user = req.user as UserInfo;
    return this.authService.logout(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  /**
   * 管理员查询Redis中的Token (仅限管理员)
   * @param userId 可选的用户ID，如果提供则查询特定用户的token
   * @returns token信息
   */
  @Get('tokens')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('管理员')
  async getTokens(@Query('userId') userId?: string) {
    return this.authService.findTokensInRedis(userId ? parseInt(userId, 10) : undefined);
  }
}
