import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdmin } from '@/utils/auth-utils';

// 获取用户关联的角色
export async function GET(request: NextRequest) {
  try {
    // 从URL中提取ID
    const id = request.url.split('/').pop();
    if (!id) {
      return NextResponse.json({
        success: false,
        message: '未提供用户ID'
      }, { status: 400 });
    }
    
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json({
        success: false,
        message: '无效的用户ID'
      }, { status: 400 });
    }

    // 检查用户是否存在
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        userrole: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '用户不存在'
      }, { status: 404 });
    }

    // 提取角色信息
    const roles = user.userrole.map(ur => ur.role);

    return NextResponse.json({
      success: true,
      data: roles
    }, { status: 200 });
  } catch (error) {
    console.error('获取用户角色失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取用户角色失败'
    }, { status: 500 });
  }
}

// 更新用户关联的角色
export async function PUT(request: NextRequest) {
  try {
    // 验证管理员权限
    const auth = await verifyAdmin(request);
    if (!auth.success) {
      return NextResponse.json({
        success: false,
        message: auth.message
      }, { status: auth.status });
    }

    // 从URL中提取ID
    const id = request.url.split('/').pop();
    if (!id) {
      return NextResponse.json({
        success: false,
        message: '未提供用户ID'
      }, { status: 400 });
    }
    
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json({
        success: false,
        message: '无效的用户ID'
      }, { status: 400 });
    }

    // 检查用户是否存在
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '用户不存在'
      }, { status: 404 });
    }

    // 解析请求体
    const data = await request.json();
    
    if (!data.roleIds || !Array.isArray(data.roleIds)) {
      return NextResponse.json({
        success: false,
        message: '缺少角色ID数组'
      }, { status: 400 });
    }

    // 检查所有角色ID是否有效
    if (data.roleIds.length > 0) {
      const roleCount = await db.role.count({
        where: {
          id: {
            in: data.roleIds
          }
        }
      });

      if (roleCount !== data.roleIds.length) {
        return NextResponse.json({
          success: false,
          message: '包含无效的角色ID'
        }, { status: 400 });
      }
    }

    // 先删除用户现有的所有角色关联
    await db.userrole.deleteMany({
      where: { userId }
    });

    // 为用户创建新的角色关联
    if (data.roleIds.length > 0) {
      await Promise.all(
        data.roleIds.map((roleId: number) =>
          db.userrole.create({
            data: {
              userId,
              roleId
            }
          })
        )
      );
    }

    // 获取更新后的用户角色信息
    const updatedUser = await db.user.findUnique({
      where: { id: userId },
      include: {
        userrole: {
          include: {
            role: true
          }
        }
      }
    });

    // 提取角色信息
    const roles = updatedUser?.userrole.map(ur => ur.role) || [];

    return NextResponse.json({
      success: true,
      data: roles,
      message: '用户角色更新成功'
    }, { status: 200 });
  } catch (error) {
    console.error('更新用户角色失败:', error);
    return NextResponse.json({
      success: false,
      message: '更新用户角色失败'
    }, { status: 500 });
  }
} 