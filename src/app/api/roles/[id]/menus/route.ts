import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdmin } from '@/utils/auth-utils';

interface Params {
  params: {
    id: string;
  };
}

// 获取角色关联的菜单
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
        menus: true
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
      data: role.menus
    }, { status: 200 });
  } catch (error) {
    console.error('获取角色菜单失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取角色菜单失败'
    }, { status: 500 });
  }
}

// 更新角色关联的菜单
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
    
    if (!data.menuIds || !Array.isArray(data.menuIds)) {
      return NextResponse.json({
        success: false,
        message: '缺少菜单ID数组'
      }, { status: 400 });
    }

    // 检查所有菜单ID是否有效
    if (data.menuIds.length > 0) {
      const menuCount = await db.menu.count({
        where: {
          id: {
            in: data.menuIds
          }
        }
      });

      if (menuCount !== data.menuIds.length) {
        return NextResponse.json({
          success: false,
          message: '包含无效的菜单ID'
        }, { status: 400 });
      }
    }

    // 更新角色的菜单关联
    const updatedRole = await db.role.update({
      where: { id: roleId },
      data: {
        menus: {
          // 先清除所有现有菜单关联
          set: [],
          // 再添加新的菜单关联
          connect: data.menuIds.map((menuId: number) => ({ id: menuId }))
        }
      },
      include: {
        menus: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedRole.menus,
      message: '角色菜单更新成功'
    }, { status: 200 });
  } catch (error) {
    console.error('更新角色菜单失败:', error);
    return NextResponse.json({
      success: false,
      message: '更新角色菜单失败'
    }, { status: 500 });
  }
} 