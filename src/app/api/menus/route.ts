import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdmin } from '@/utils/auth-utils';
import type { Menu, MenuCreate, MenuUpdate } from '@/types/api';

/**
 * 获取菜单列表
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const name = searchParams.get('name');
    const path = searchParams.get('path');
    const status = searchParams.get('status');

    // 构建查询条件
    const where = {
      ...(name && { name: { contains: name } }),
      ...(path && { path: { contains: path } }),
      ...(status && { status: parseInt(status) }),
    };

    // 查询菜单列表
    const [menus, total] = await Promise.all([
      db.menu.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { sort: 'asc' },
      }),
      db.menu.count({ where }),
    ]);

    // 转换数据库模型为API类型
    const apiMenus: Menu[] = menus.map(menu => ({
      id: menu.id,
      name: menu.name,
      path: menu.path,
      icon: menu.icon || '',
      order: menu.sort,
      status: menu.hidden ? 0 : 1,
      parentId: menu.parentId,
      createTime: menu.createdAt.toISOString(),
      updateTime: menu.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: {
        total,
        list: apiMenus,
      },
    });
  } catch (error) {
    console.error('获取菜单列表失败:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

/**
 * 获取菜单树形结构
 */
export async function GET_TREE() {
  try {
    const menus = await db.menu.findMany({
      orderBy: { sort: 'asc' },
    });

    // 转换数据库模型为API类型
    const apiMenus: Menu[] = menus.map(menu => ({
      id: menu.id,
      name: menu.name,
      path: menu.path,
      icon: menu.icon || '',
      order: menu.sort,
      status: menu.hidden ? 0 : 1,
      parentId: menu.parentId,
      createTime: menu.createdAt.toISOString(),
      updateTime: menu.updatedAt.toISOString(),
    }));

    // 构建树形结构
    const buildTree = (items: Menu[], parentId: number | null = null): Menu[] => {
      return items
        .filter(item => item.parentId === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id),
        }));
    };

    const menuTree = buildTree(apiMenus);

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: menuTree,
    });
  } catch (error) {
    console.error('获取菜单树失败:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

/**
 * 创建菜单
 */
export async function POST(request: Request) {
  try {
    const body: MenuCreate = await request.json();
    
    const menu = await db.menu.create({
      data: {
        name: body.name,
        path: body.path,
        icon: body.icon,
        sort: body.order,
        hidden: body.status === 0,
        parentId: body.parentId,
      },
    });

    // 转换数据库模型为API类型
    const apiMenu: Menu = {
      id: menu.id,
      name: menu.name,
      path: menu.path,
      icon: menu.icon || '',
      order: menu.sort,
      status: menu.hidden ? 0 : 1,
      parentId: menu.parentId,
      createTime: menu.createdAt.toISOString(),
      updateTime: menu.updatedAt.toISOString(),
    };

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: apiMenu,
    });
  } catch (error) {
    console.error('创建菜单失败:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

/**
 * 更新菜单
 */
export async function PUT(request: Request) {
  try {
    const body: MenuUpdate & { id: number } = await request.json();
    
    const menu = await db.menu.update({
      where: { id: body.id },
      data: {
        name: body.name,
        path: body.path,
        icon: body.icon,
        sort: body.order,
        hidden: body.status === 0,
        parentId: body.parentId,
      },
    });

    // 转换数据库模型为API类型
    const apiMenu: Menu = {
      id: menu.id,
      name: menu.name,
      path: menu.path,
      icon: menu.icon || '',
      order: menu.sort,
      status: menu.hidden ? 0 : 1,
      parentId: menu.parentId,
      createTime: menu.createdAt.toISOString(),
      updateTime: menu.updatedAt.toISOString(),
    };

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: apiMenu,
    });
  } catch (error) {
    console.error('更新菜单失败:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

/**
 * 删除菜单
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        {
          code: 400,
          message: 'Missing menu ID',
        },
        { status: 400 }
      );
    }

    await db.menu.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: null,
    });
  } catch (error) {
    console.error('删除菜单失败:', error);
    return NextResponse.json(
      {
        code: 500,
        message: 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

// 获取所有菜单
export async function GET_ALL() {
  try {
    // 查询所有菜单，按排序字段排序
    const menus = await db.menu.findMany({
      orderBy: { sort: 'asc' },
      include: {
        children: true,
        menuPermissions: true
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
export async function POST_NEW(request: NextRequest) {
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
        sort: data.order || 0,
        hidden: data.status === 0,
        updatedAt: new Date(),
        parent: data.parentId ? {
          connect: { id: data.parentId }
        } : undefined,
        menuPermissions: data.permissionId ? {
          connect: [{ id: data.permissionId }]
        } : undefined
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