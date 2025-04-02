import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdmin } from '@/utils/auth-utils';
import type { Menu } from '@/types/api';

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
      order: menu.sort,
      status: menu.status,
      parentId: menu.parentId,
      createTime: menu.createdAt.toISOString(),
      updateTime: menu.updatedAt.toISOString(),
      type: menu.type,
      component: menu.component || '',
      permission: menu.permission || '',
      routeName: menu.routeName || '',
      layout: menu.layout || 'DEFAULT',
      redirect: menu.redirect || '',
      i18nKey: menu.i18nKey || '',
      params: menu.params || {},
      query: menu.query || {},
      hidden: menu.hidden,
      hideTab: menu.hideTab,
      hideMenu: menu.hideMenu,
      hideBreadcrumb: menu.hideBreadcrumb,
      hideChildren: menu.hideChildren,
      isExternal: menu.isExternal,
      keepAlive: menu.keepAlive,
      constant: menu.constant,
      affix: menu.affix,
      remark: menu.remark || ''
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
      const children = menu.children?.map(child => {
        let childPath = child.path || '';
        let childComponent = child.component || '';
        
        if (!childPath.startsWith('/')) {
          childPath = '/' + childPath;
        }

        // 如果没有设置 component，则使用 path
        if (!childComponent) {
          childComponent = childPath;
        }
        
        return {
          id: child.id,
          name: child.name,
          path: childPath,
          icon: child.icon || '',
          order: child.sort,
          status: child.status,
          parentId: child.parentId,
          createTime: child.createdAt.toISOString(),
          updateTime: child.updatedAt.toISOString(),
          type: child.type,
          component: childComponent,
          permission: child.permission || '',
          routeName: child.routeName || '',
          layout: child.layout || 'DEFAULT',
          redirect: child.redirect || '',
          i18nKey: child.i18nKey || '',
          params: child.params || {},
          query: child.query || {},
          hidden: child.hidden,
          hideTab: child.hideTab,
          hideMenu: child.hideMenu,
          hideBreadcrumb: child.hideBreadcrumb,
          hideChildren: child.hideChildren,
          isExternal: child.isExternal,
          keepAlive: child.keepAlive,
          constant: child.constant,
          affix: child.affix,
          remark: child.remark || '',
          children: []
        };
      }) || [];

      // 创建父级菜单项
      const parentMenuItem = {
        id: menu.id,
        name: menu.name,
        path: path,
        icon: menu.icon || '',
        order: menu.sort,
        status: menu.status,
        parentId: menu.parentId,
        createTime: menu.createdAt.toISOString(),
        updateTime: menu.updatedAt.toISOString(),
        type: menu.type,
        component: component,
        permission: menu.permission || '',
        routeName: menu.routeName || '',
        layout: menu.layout || 'DEFAULT',
        redirect: menu.redirect || '',
        i18nKey: menu.i18nKey || '',
        params: menu.params || {},
        query: menu.query || {},
        hidden: menu.hidden,
        hideTab: menu.hideTab,
        hideMenu: menu.hideMenu,
        hideBreadcrumb: menu.hideBreadcrumb,
        hideChildren: menu.hideChildren,
        isExternal: menu.isExternal,
        keepAlive: menu.keepAlive,
        constant: menu.constant,
        affix: menu.affix,
        remark: menu.remark || '',
        children: children
      };

      return parentMenuItem;
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
    const body = await request.json();
    console.log('创建菜单请求数据:', body);
    
    // 验证必填字段
    if (!body.name || !body.type) {
      return NextResponse.json(
        {
          code: 400,
          message: '菜单名称和类型为必填项',
        },
        { status: 400 }
      );
    }

    const menu = await db.menu.create({
      data: {
        name: body.name,
        routeName: body.routeName,
        path: body.path,
        component: body.component,
        layout: body.layout,
        redirect: body.redirect,
        icon: body.icon,
        i18nKey: body.i18nKey,
        type: body.type,
        permission: body.permission,
        params: body.params,
        query: body.query,
        sort: body.sort || 0,
        hidden: body.hidden || false,
        hideTab: body.hideTab || false,
        hideMenu: body.hideMenu || false,
        hideBreadcrumb: body.hideBreadcrumb || false,
        hideChildren: body.hideChildren || false,
        status: body.status || 1,
        isExternal: body.isExternal || false,
        keepAlive: body.keepAlive || true,
        constant: body.constant || false,
        affix: body.affix || false,
        parentId: body.parentId,
        remark: body.remark,
      },
    });

    console.log('菜单创建成功:', menu);

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: menu,
    });
  } catch (error) {
    console.error('创建菜单失败，详细错误:', error);
    if (error instanceof Error) {
      console.error('错误堆栈:', error.stack);
    }
    return NextResponse.json(
      {
        code: 500,
        message: error instanceof Error ? error.message : 'Internal Server Error',
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

    const body = await request.json();
    console.log('更新菜单请求数据:', { id, body });
    
    // 验证必填字段
    if (!body.name || !body.type) {
      return NextResponse.json(
        {
          code: 400,
          message: '菜单名称和类型为必填项',
        },
        { status: 400 }
      );
    }
    
    const menu = await db.menu.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        routeName: body.routeName,
        path: body.path,
        component: body.component,
        layout: body.layout,
        redirect: body.redirect,
        icon: body.icon,
        i18nKey: body.i18nKey,
        type: body.type,
        permission: body.permission,
        params: body.params,
        query: body.query,
        sort: body.sort,
        hidden: body.hidden,
        hideTab: body.hideTab,
        hideMenu: body.hideMenu,
        hideBreadcrumb: body.hideBreadcrumb,
        hideChildren: body.hideChildren,
        status: body.status,
        isExternal: body.isExternal,
        keepAlive: body.keepAlive,
        constant: body.constant,
        affix: body.affix,
        parentId: body.parentId,
        remark: body.remark,
      },
    });

    console.log('菜单更新成功:', menu);

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: menu,
    });
  } catch (error) {
    console.error('更新菜单失败，详细错误:', error);
    if (error instanceof Error) {
      console.error('错误堆栈:', error.stack);
    }
    return NextResponse.json(
      {
        code: 500,
        message: error instanceof Error ? error.message : 'Internal Server Error',
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