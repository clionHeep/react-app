import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdmin } from '@/utils/auth-utils';

// 获取所有菜单
export async function GET(request: NextRequest) {
  try {
    // 查询所有菜单，按排序字段排序
    const menus = await db.menu.findMany({
      orderBy: { order: 'asc' },
      include: {
        children: true,
        permission: true
      }
    });

    // 构建菜单树结构
    const menuTree = menus.filter(menu => !menu.parentId).map(menu => ({
      ...menu,
      children: menus.filter(child => child.parentId === menu.id)
    }));

    return NextResponse.json({
      success: true,
      data: menuTree
    }, { status: 200 });
  } catch (error) {
    console.error('获取菜单失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取菜单失败'
    }, { status: 500 });
  }
}

// 创建新菜单
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const auth = await verifyAdmin(request);
    if (!auth.success) {
      return NextResponse.json({
        success: false,
        message: auth.message
      }, { status: auth.status });
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

    // 创建菜单
    const menu = await db.menu.create({
      data: {
        name: data.name,
        path: data.path,
        icon: data.icon || null,
        order: data.order || 0,
        parentId: data.parentId || null,
        permissionId: data.permissionId || null,
        isVisible: data.isVisible ?? true,
        isExternal: data.isExternal ?? false,
        description: data.description || null
      }
    });

    return NextResponse.json({
      success: true,
      data: menu,
      message: '菜单创建成功'
    }, { status: 201 });
  } catch (error) {
    console.error('创建菜单失败:', error);
    return NextResponse.json({
      success: false,
      message: '创建菜单失败'
    }, { status: 500 });
  }
} 