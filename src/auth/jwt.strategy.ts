import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient, user } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

// 定义JWT payload类型
interface JwtPayload {
  sub: number;
  username: string;
  iat?: number;
  exp?: number;
  roles?: string[];
}

// 用户信息接口
interface UserInfo {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  roles: string[];
  permissions: string[];
  [key: string]: unknown;
}

// 扩展用户类型，包含关系
interface UserWithRelations extends user {
  userrole?: Array<{
    role: {
      name: string;
      rolepermission?: Array<{
        permission: {
          code: string;
        };
      }>;
    };
  }>;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private prisma: PrismaClient;

  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET环境变量未设置');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
    this.prisma = new PrismaClient();
  }

  async validate(payload: JwtPayload): Promise<UserInfo> {
    try {
      // 使用Prisma查询用户，注意使用userrole而非userroles
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          userrole: {
            include: {
              role: {
                include: {
                  rolepermission: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      }) as unknown as UserWithRelations;

      if (!user) {
        throw new UnauthorizedException('用户不存在或已被删除');
      }

      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedException('用户已被锁定或禁用');
      }

      // 提取用户权限和角色信息
      const roles = user.userrole
        ? user.userrole.map(ur => ur.role.name)
        : [user.roles];

      const permissions = user.userrole
        ? user.userrole.flatMap(ur =>
          ur.role.rolepermission?.map(rp => rp.permission.code) || []
        )
        : [];

      // 使用Object.entries和过滤创建不含password的对象
      const userInfo = Object.fromEntries(
        Object.entries(user).filter(([key]) => key !== 'password')
      ) as UserInfo;

      return {
        ...userInfo,
        roles,
        permissions,
      };
    } catch (error) {
      console.error('JWT验证错误:', error);
      throw new UnauthorizedException('认证失败');
    }
  }
}
