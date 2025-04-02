import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdmin } from '@/utils/auth-utils';
import type { Menu } from '@/types/api';
import { getErrorResponse } from "@/utils/utils";
import { MenuType as PrismaMenuType } from '@prisma/client';

// 类型转换函数
const convertPrismaMenuType = (type: PrismaMenuType): Menu['type'] => {
  return type as Menu['type'];
};

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
      path: menu.path || '',
      icon: menu.icon || '',
      type: convertPrismaMenuType(menu.type),
      permission: menu.permission || '',
      parentId: menu.parentId,
      sort: menu.sort,
      status: menu.status,
      component: menu.component || '',
      children: []
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
      include: {
        children: true
      }
    });

    // 转换数据库模型为API类型
    const apiMenus: Menu[] = menus.map(menu => {
      // 处理路径格式
      let path = menu.path || '';
      let component = menu.component || '';
      
      // 确保所有菜单路径以 / 开头
      if (!path.startsWith('/')) {
        path = '/' + path;
      }

      // 如果是父级菜单（有子菜单）
      const hasChildren = menu.children && menu.children.length > 0;
      if (hasChildren) {
        // 如果没有设置 component，则使用 path
        if (!component) {
          component = path;
        }
      }

      // 处理子菜单
      const children = menu.children?.map(child => ({
        id: child.id,
        name: child.name,
        path: child.path || '',
        icon: child.icon || '',
        type: convertPrismaMenuType(child.type),
        permission: child.permission || '',
        parentId: child.parentId,
        sort: child.sort,
        status: child.status,
        component: child.component || '',
        children: []
      })) || [];

      // 创建父级菜单项
      return {
        id: menu.id,
        name: menu.name,
        path: path,
        icon: menu.icon || '',
        type: convertPrismaMenuType(menu.type),
        permission: menu.permission || '',
        parentId: menu.parentId,
        sort: menu.sort,
        status: menu.status,
        component: component,
        children: children
      };
    });

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
    const data = await request.json();
    const { type, parentId, permission } = data;

    // 验证按钮类型必须有父级菜单
    if (type === PrismaMenuType.BUTTON && !parentId) {
      return getErrorResponse(400, '按钮必须指定父级菜单');
    }

    // 验证按钮类型必须有权限标识
    if (type === PrismaMenuType.BUTTON && !permission) {
      return getErrorResponse(400, '按钮必须指定权限标识');
    }

    // 验证父级菜单存在且类型正确
    if (parentId) {
      const parent = await db.menu.findUnique({
        where: { id: parentId }
      });
      if (!parent) {
        return getErrorResponse(400, '父级菜单不存在');
      }
      if (type === PrismaMenuType.BUTTON && parent.type !== PrismaMenuType.MENU) {
        return getErrorResponse(400, '按钮只能添加在菜单下');
      }
    }

    const menu = await db.menu.create({
      data
    });

    return NextResponse.json({
      code: 0,
      message: '创建成功',
      data: menu
    });
  } catch (error: unknown) {
    console.error('创建菜单失败:', error);
    return getErrorResponse(500, '创建菜单失败');
  }
}

/**
 * 更新菜单
 */
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, type, parentId, permission } = data;

    if (!id) {
      return getErrorResponse(400, '缺少菜单ID');
    }

    // 验证菜单是否存在
    const existingMenu = await db.menu.findUnique({
      where: { id }
    });
    if (!existingMenu) {
      return getErrorResponse(404, '菜单不存在');
    }

    // 验证按钮类型必须有父级菜单
    if (type === PrismaMenuType.BUTTON && !parentId) {
      return getErrorResponse(400, '按钮必须指定父级菜单');
    }

    // 验证按钮类型必须有权限标识
    if (type === PrismaMenuType.BUTTON && !permission) {
      return getErrorResponse(400, '按钮必须指定权限标识');
    }

    // 验证父级菜单存在且类型正确
    if (parentId) {
      const parent = await db.menu.findUnique({
        where: { id: parentId }
      });
      if (!parent) {
        return getErrorResponse(400, '父级菜单不存在');
      }
      if (type === PrismaMenuType.BUTTON && parent.type !== PrismaMenuType.MENU) {
        return getErrorResponse(400, '按钮只能添加在菜单下');
      }
    }

    const menu = await db.menu.update({
      where: { id },
      data
    });

    return NextResponse.json({
      code: 0,
      message: '更新成功',
      data: menu
    });
  } catch (error: unknown) {
    console.error('更新菜单失败:', error);
    return getErrorResponse(500, '更新菜单失败');
  }
}

/**
 * 删除菜单
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    if (!id) {
      return getErrorResponse(400, '缺少菜单ID');
    }

    // 检查是否有子菜单或按钮
    const children = await db.menu.findMany({
      where: { parentId: id }
    });
    if (children.length > 0) {
      return getErrorResponse(400, '请先删除子菜单或按钮');
    }

    await db.menu.delete({
      where: { id }
    });

    return NextResponse.json({
      code: 0,
      message: '删除成功'
    });
  } catch (error: unknown) {
    console.error('删除菜单失败:', error);
    return getErrorResponse(500, '删除菜单失败');
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