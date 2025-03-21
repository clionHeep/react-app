import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterDto } from './dto/register.dto';

interface UserRole {
  role: {
    name: string;
  };
}

interface User {
  id: number;
  username: string;
  password: string;
  status: string;
  userrole?: UserRole[];
  // 其他必要属性...
}

@Injectable()
export class AuthService {
  private prisma: PrismaClient;

  constructor(private jwtService: JwtService) {
    this.prisma = new PrismaClient();
  }

  /**
   * 账号密码登录
   * @param username 用户名
   * @param password 用户密码
   * @returns 登录成功返回用户信息和令牌
   */
  async login(username: string, password: string) {
    // 只支持通过用户名登录
    const user = await this.prisma.user.findFirst({
      where: { username },
      include: {
        userrole: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查用户状态
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('账户已被锁定或禁用');
    }

    // 处理登录成功
    return this.handleSuccessfulLogin(user);
  }

  /**
   * 处理登录成功的通用逻辑
   * @param user 用户对象
   * @returns 登录成功返回用户信息和令牌
   */
  private async handleSuccessfulLogin(user: User) {
    // 获取用户角色
    const roles = user.userrole?.map((ur: UserRole) => ur.role.name) || ['用户'];

    // 记录登录信息
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: 'IP地址获取暂未实现', // 在实际项目中，您需要从请求中获取IP地址
        updatedAt: new Date()
      }
    });

    // 生成访问令牌和刷新令牌
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.username,
      roles,
    );

    // 保存刷新令牌
    await this.saveRefreshToken(user.id, refreshToken);

    // 移除敏感信息
    const { password, ...userInfo } = user;

    return {
      user: userInfo,
      accessToken,
      refreshToken,
    };
  }

  /**
   * 发送邮箱重置密码验证码
   * @param email 邮箱
   * @returns 发送结果
   */
  async sendResetPasswordEmailCode(email: string) {
    // 验证邮箱是否注册
    const user = await this.prisma.user.findFirst({
      where: { email }
    });

    if (!user) {
      throw new BadRequestException('该邮箱未注册');
    }

    // 检查是否有未过期的验证码
    const existingCode = await this.prisma.verificationcode.findFirst({
      where: {
        type: 'reset_password_email',
        target: email,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    // 如果存在未过期的验证码且在1分钟内创建，则拒绝发送
    if (existingCode &&
      (new Date().getTime() - existingCode.createdAt.getTime()) < 60 * 1000) {
      throw new BadRequestException('请求过于频繁，请稍后再试');
    }

    // 生成验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 验证码有效期为10分钟
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 保存验证码记录到数据库
    await this.prisma.verificationcode.create({
      data: {
        type: 'reset_password_email',
        target: email,
        code,
        expiresAt,
        used: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // TODO: 发送邮件逻辑
    console.log('向邮箱', email, '发送重置密码验证码:', code);

    return {
      success: true,
      message: '验证码已发送到您的邮箱'
    };
  }

  /**
   * 发送短信重置密码验证码
   * @param phone 手机号
   * @returns 发送结果
   */
  async sendResetPasswordSmsCode(phone: string) {
    // 验证手机号是否注册
    const user = await this.prisma.user.findFirst({
      where: { phone }
    });

    if (!user) {
      throw new BadRequestException('该手机号未注册');
    }

    // 检查是否有未过期的验证码
    const existingCode = await this.prisma.verificationcode.findFirst({
      where: {
        type: 'reset_password_phone',
        target: phone,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    // 如果存在未过期的验证码且在1分钟内创建，则拒绝发送
    if (existingCode &&
      (new Date().getTime() - existingCode.createdAt.getTime()) < 60 * 1000) {
      throw new BadRequestException('请求过于频繁，请稍后再试');
    }

    // 生成验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 验证码有效期为10分钟
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 保存验证码记录到数据库
    await this.prisma.verificationcode.create({
      data: {
        type: 'reset_password_phone',
        target: phone,
        code,
        expiresAt,
        used: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // TODO: 发送短信逻辑
    console.log('向手机号', phone, '发送重置密码验证码:', code);

    return {
      success: true,
      message: '验证码已发送到您的手机'
    };
  }

  /**
   * 重置密码
   * @param resetPasswordDto 重置密码数据
   * @returns 操作结果
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, phone, code, newPassword } = resetPasswordDto;

    // 必须提供邮箱或手机号其中一个
    if (!email && !phone) {
      throw new BadRequestException('请提供邮箱或手机号');
    }

    // 查找用户
    const user = await this.prisma.user.findFirst({
      where: email ? { email } : { phone }
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 验证码验证
    const isCodeValid = await this.verifyResetPasswordCode(
      email || phone!,
      code,
      email ? 'reset_password_email' : 'reset_password_phone'
    );

    if (!isCodeValid) {
      throw new BadRequestException('验证码无效或已过期');
    }

    // 加密新密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 更新密码
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      message: '密码重置成功'
    };
  }

  /**
   * 验证重置密码验证码
   * @param target 目标(邮箱或手机号)
   * @param code 验证码
   * @param type 类型(reset_password_email或reset_password_phone)
   * @returns 验证是否成功
   */
  private async verifyResetPasswordCode(target: string, code: string, type: string): Promise<boolean> {
    // 查询最近的未使用的验证码记录
    const codeRecord = await this.prisma.verificationcode.findFirst({
      where: {
        type,
        target,
        code,
        used: false,
        expiresAt: {
          gt: new Date() // 未过期
        }
      },
      orderBy: {
        createdAt: 'desc' // 最新创建的
      }
    });

    if (!codeRecord) {
      return false;
    }

    // 标记验证码为已使用
    await this.prisma.verificationcode.update({
      where: { id: codeRecord.id },
      data: { used: true }
    });

    return true;
  }

  /**
   * 生成访问令牌和刷新令牌
   * @param userId 用户ID
   * @param username 用户名
   * @param roles 用户角色
   * @returns 访问令牌和刷新令牌
   */
  private async generateTokens(userId: number, username: string, roles: string[]) {
    const payload = { sub: userId, username, roles };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h', // 访问令牌有效期1小时
    });

    const refreshToken = randomBytes(40).toString('hex');

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * 保存刷新令牌
   * @param userId 用户ID
   * @param refreshToken 刷新令牌
   */
  private async saveRefreshToken(userId: number, refreshToken: string) {
    // 检查用户是否已有刷新令牌
    const existingToken = await this.prisma.refreshtoken.findUnique({
      where: { userId },
    });

    // 设置过期时间为7天
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (existingToken) {
      // 更新现有刷新令牌
      await this.prisma.refreshtoken.update({
        where: { id: existingToken.id },
        data: {
          token: refreshToken,
          expiresAt,
          updatedAt: new Date(),
        },
      });
    } else {
      // 创建新的刷新令牌
      await this.prisma.refreshtoken.create({
        data: {
          userId,
          token: refreshToken,
          expiresAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  }

  /**
   * 用户登出
   * @param userId 用户ID
   */
  async logout(userId: number) {
    // 删除刷新令牌
    await this.prisma.refreshtoken.deleteMany({
      where: { userId },
    });

    return { success: true };
  }

  /**
   * 刷新访问令牌
   * @param refreshToken 刷新令牌
   * @returns 新的访问令牌和刷新令牌
   */
  async refreshToken(refreshToken: string) {
    // 查找刷新令牌
    const tokenRecord = await this.prisma.refreshtoken.findFirst({
      where: {
        token: refreshToken,
        expiresAt: { gt: new Date() } // 未过期
      },
      include: { user: true }
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }

    const user = tokenRecord.user;

    // 检查用户状态
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('账户已被锁定或禁用');
    }

    // 获取用户角色
    const userRoles = await this.prisma.userrole.findMany({
      where: { userId: user.id },
      include: { role: true }
    });

    const roles = userRoles.map(ur => ur.role.name);

    // 生成新的令牌
    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(user.id, user.username, roles);

    // 更新刷新令牌
    await this.prisma.refreshtoken.update({
      where: { id: tokenRecord.id },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    });

    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  }

  /**
   * 用户注册
   * @param registerDto 注册数据
   * @returns 注册成功返回用户信息和令牌
   */
  async register(registerDto: RegisterDto) {
    const { username, email, phone, password, name, ...otherData } = registerDto;

    // 验证用户名是否存在
    const existingUsername = await this.prisma.user.findFirst({
      where: { username }
    });

    if (existingUsername) {
      throw new BadRequestException('用户名已被注册');
    }

    // 验证邮箱是否存在
    if (email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: { email }
      });

      if (existingEmail) {
        throw new BadRequestException('邮箱已被注册');
      }
    }

    // 验证手机号是否存在
    if (phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone }
      });

      if (existingPhone) {
        throw new BadRequestException('手机号已被注册');
      }
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        phone,
        password: hashedPassword,
        name: name || username,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: Array.isArray(otherData.roles) ? otherData.roles.join(',') : otherData.roles || undefined,
        ...otherData
      }
    });

    // 分配默认角色
    await this.prisma.userrole.create({
      data: {
        userId: user.id,
        roleId: 2, // 假设2是普通用户角色ID
        createdAt: new Date(),
      }
    });

    // 处理登录
    return this.handleSuccessfulLogin(user);
  }
}
