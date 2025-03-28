import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdmin } from '@/utils/auth-utils';

// 获取单个菜单
export async function GET(request: NextRequest) {
  try {
    // 从URL路径中提取ID
    const pathParts = request.nextUrl.pathname.split('/');
    const idStr = pathParts[pathParts.length - 1];
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        message: '无效的菜单ID'
      }, { status: 400 });
    }

    const menu = await db.menu.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true
      }
    });

    if (!menu) {
      return NextResponse.json({
        success: false,
        message: '菜单不存在'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: menu
    }, { status: 200 });
  } catch (error) {
    console.error('获取菜单详情失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取菜单详情失败'
    }, { status: 500 });
  }
}

// 更新菜单
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

    // 从URL路径中提取ID
    const pathParts = request.nextUrl.pathname.split('/');
    const idStr = pathParts[pathParts.length - 1];
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        message: '无效的菜单ID'
      }, { status: 400 });
    }

    // 检查菜单是否存在
    const existingMenu = await db.menu.findUnique({
      where: { id }
    });

    if (!existingMenu) {
      return NextResponse.json({
        success: false,
        message: '菜单不存在'
      }, { status: 404 });
    }

    // 解析请求体
    const data = await request.json();

    // 验证必填字段
    if (!data.name || !data.path) {
      return NextResponse.json({
        success: false,
        message: '菜单名称和路径为必填项'
      }, { status: 400 });
    }

    // 更新菜单
    const updatedMenu = await db.menu.update({
      where: { id },
      data: {
        name: data.name,
        path: data.path,
        icon: data.icon !== undefined ? data.icon : existingMenu.icon,
        sort: data.order !== undefined ? data.order : existingMenu.sort,
        hidden: data.isVisible !== undefined ? !data.isVisible : existingMenu.hidden,
        updatedAt: new Date(),
        parent: data.parentId !== undefined ? {
          connect: data.parentId ? { id: data.parentId } : undefined
        } : undefined,
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedMenu,
      message: '菜单更新成功'
    }, { status: 200 });
  } catch (error) {
    console.error('更新菜单失败:', error);
    return NextResponse.json({
      success: false,
      message: '更新菜单失败'
    }, { status: 500 });
  }
}

// 删除菜单
export async function DELETE(request: NextRequest) {
  try {
    // 验证管理员权限
    const auth = await verifyAdmin(request);
    if (!auth.success) {
      return NextResponse.json({
        success: false,
        message: auth.message
      }, { status: auth.status });
    }

    // 从URL路径中提取ID
    const pathParts = request.nextUrl.pathname.split('/');
    const idStr = pathParts[pathParts.length - 1];
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        message: '无效的菜单ID'
      }, { status: 400 });
    }

    // 检查菜单是否存在
    const existingMenu = await db.menu.findUnique({
      where: { id },
      include: { children: true }
    });

    if (!existingMenu) {
      return NextResponse.json({
        success: false,
        message: '菜单不存在'
      }, { status: 404 });
    }

    // 检查是否有子菜单
    if (existingMenu.children && existingMenu.children.length > 0) {
      return NextResponse.json({
        success: false,
        message: '无法删除含有子菜单的菜单，请先删除所有子菜单'
      }, { status: 400 });
    }

    // 删除菜单
    await db.menu.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: '菜单删除成功'
    }, { status: 200 });
  } catch (error) {
    console.error('删除菜单失败:', error);
    return NextResponse.json({
      success: false,
      message: '删除菜单失败'
    }, { status: 500 });
  }
} 