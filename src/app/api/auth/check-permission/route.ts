import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/db';

// JWT负载类型
interface JwtPayload {
  sub: number | string;
  username?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 获取token
    let token: string | undefined;

    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else {
      const tokenFromCookie = request.cookies.get('token')?.value;
      if (tokenFromCookie) {
        token = tokenFromCookie;
      }
    }

    if (!token) {
      return NextResponse.json({
        success: false,
        hasPermission: false,
        message: '未认证'
      }, { status: 401 });
    }

    // 验证token
    let userInfo: JwtPayload;
    try {
      userInfo = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JwtPayload;
    } catch {
      return NextResponse.json({
        success: false,
        hasPermission: false,
        message: '无效的令牌'
      }, { status: 401 });
    }

    // 获取用户ID
    const userId = Number(userInfo.sub);

    // 解析请求体获取要检查的权限编码
    const { permissionCode } = await request.json();

    if (!permissionCode) {
      return NextResponse.json({
        success: false,
        hasPermission: false,
        message: '缺少权限编码参数'
      }, { status: 400 });
    }

    // 查询用户角色及相关的权限
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        userrole: {
          include: {
            role: {
              include: {
                permissions: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        hasPermission: false,
        message: '用户不存在'
      }, { status: 404 });
    }

    // 检查用户状态
    if (user.status !== 'ACTIVE') {
      return NextResponse.json({
        success: false,
        hasPermission: false,
        message: '账户已被禁用'
      }, { status: 403 });
    }

    // 收集用户所有的权限
    const userPermissions = new Set<string>();

    // 查找所有角色关联的权限
    user.userrole.forEach(userRole => {
      userRole.role.permissions.forEach(permission => {
        userPermissions.add(permission.code);
      });
    });

    // 检查是否是管理员角色（管理员拥有所有权限）
    const isAdmin = user.userrole.some(ur => ur.role.name === 'admin');

    // 判断用户是否有请求的权限
    const hasPermission = isAdmin || userPermissions.has(permissionCode);

    return NextResponse.json({
      success: true,
      hasPermission,
      message: hasPermission ? '用户有权限' : '用户无权限'
    }, { status: 200 });
  } catch (error) {
    console.error('检查权限失败:', error);
    return NextResponse.json({
      success: false,
      hasPermission: false,
      message: '服务器错误'
    }, { status: 500 });
  }
} 