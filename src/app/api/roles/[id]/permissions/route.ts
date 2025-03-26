import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdmin } from '@/utils/auth-utils';

interface Params {
  params: {
    id: string;
  };
}

// 获取角色关联的权限
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const roleId = parseInt(params.id);
    
    if (isNaN(roleId)) {
      return NextResponse.json({
        success: false,
        message: '无效的角色ID'
      }, { status: 400 });
    }

    // 检查角色是否存在
    const role = await db.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: true
      }
    });

    if (!role) {
      return NextResponse.json({
        success: false,
        message: '角色不存在'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: role.permissions
    }, { status: 200 });
  } catch (error) {
    console.error('获取角色权限失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取角色权限失败'
    }, { status: 500 });
  }
}

// 更新角色关联的权限
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    // 验证管理员权限
    const auth = await verifyAdmin(request);
    if (!auth.success) {
      return NextResponse.json({
        success: false,
        message: auth.message
      }, { status: auth.status });
    }

    const roleId = parseInt(params.id);
    
    if (isNaN(roleId)) {
      return NextResponse.json({
        success: false,
        message: '无效的角色ID'
      }, { status: 400 });
    }

    // 检查角色是否存在
    const role = await db.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      return NextResponse.json({
        success: false,
        message: '角色不存在'
      }, { status: 404 });
    }

    // 解析请求体
    const data = await request.json();
    
    if (!data.permissionIds || !Array.isArray(data.permissionIds)) {
      return NextResponse.json({
        success: false,
        message: '缺少权限ID数组'
      }, { status: 400 });
    }

    // 检查所有权限ID是否有效
    if (data.permissionIds.length > 0) {
      const permissionCount = await db.permission.count({
        where: {
          id: {
            in: data.permissionIds
          }
        }
      });

      if (permissionCount !== data.permissionIds.length) {
        return NextResponse.json({
          success: false,
          message: '包含无效的权限ID'
        }, { status: 400 });
      }
    }

    // 更新角色的权限关联
    const updatedRole = await db.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          // 先清除所有现有权限关联
          set: [],
          // 再添加新的权限关联
          connect: data.permissionIds.map((permId: number) => ({ id: permId }))
        }
      },
      include: {
        permissions: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedRole.permissions,
      message: '角色权限更新成功'
    }, { status: 200 });
  } catch (error) {
    console.error('更新角色权限失败:', error);
    return NextResponse.json({
      success: false,
      message: '更新角色权限失败'
    }, { status: 500 });
  }
} 