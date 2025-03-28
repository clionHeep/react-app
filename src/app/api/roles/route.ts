import { NextResponse } from 'next/server';
import { db } from '@/db';
import type { Role, RoleCreate, RoleUpdate, ApiResponse, PageResponse } from '@/types/api';

/**
 * 获取角色列表
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const name = searchParams.get('name');
    const status = searchParams.get('status');

    // 构建查询条件
    const where = {
      ...(name && { name: { contains: name } }),
      ...(status && { status: parseInt(status) }),
    };

    // 查询角色列表
    const [roles, total] = await Promise.all([
      db.role.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          menus: true
        }
      }),
      db.role.count({ where }),
    ]);

    // 转换数据库模型为API类型
    const apiRoles: Role[] = roles.map(role => ({
      id: role.id,
      name: role.name,
      code: role.name, // 使用角色名称作为代码
      description: role.description || '',
      status: role.status,
      createTime: role.createdAt.toISOString(),
      updateTime: role.updatedAt.toISOString(),
      menus: role.menus.map(menu => ({
        id: menu.id,
        name: menu.name,
        path: menu.path || '',
        icon: menu.icon || '',
        parentId: menu.parentId,
        order: menu.sort,
        status: menu.hidden ? 0 : 1,
        createTime: menu.createdAt.toISOString(),
        updateTime: menu.updatedAt.toISOString(),
      }))
    }));

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: {
        total,
        list: apiRoles,
      },
    } as ApiResponse<PageResponse<Role>>);
  } catch (err) {
    console.error('获取角色列表失败:', err);
    return NextResponse.json(
      {
        code: 500,
        message: 'Internal Server Error',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * 创建角色
 */
export async function POST(request: Request) {
  try {
    const body: RoleCreate = await request.json();
    
    // 检查角色名是否已存在
    const existingRole = await db.role.findUnique({
      where: { name: body.name }
    });

    if (existingRole) {
      return NextResponse.json(
        {
          code: 400,
          message: '角色名称已存在',
        },
        { status: 400 }
      );
    }

    // 创建角色
    const role = await db.role.create({
      data: {
        name: body.name,
        description: body.description,
        status: body.status,
        menus: {
          connect: body.menuIds.map(id => ({ id }))
        }
      },
      include: {
        menus: true
      }
    });

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: role,
    });
  } catch (err) {
    console.error('创建角色失败:', err);
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
 * 更新角色
 */
export async function PUT(request: Request) {
  try {
    const body: RoleUpdate & { id: number } = await request.json();
    
    // 检查角色是否存在
    const existingRole = await db.role.findUnique({
      where: { id: body.id }
    });

    if (!existingRole) {
      return NextResponse.json(
        {
          code: 404,
          message: '角色不存在',
        },
        { status: 404 }
      );
    }

    // 检查是否为系统角色
    if (existingRole.isSystem) {
      return NextResponse.json(
        {
          code: 403,
          message: '系统角色不可修改',
        },
        { status: 403 }
      );
    }

    // 如果修改了角色名，检查新名称是否已存在
    if (body.name && body.name !== existingRole.name) {
      const nameExists = await db.role.findFirst({
        where: {
          name: body.name,
          id: { not: body.id }
        }
      });

      if (nameExists) {
        return NextResponse.json(
          {
            code: 400,
            message: '角色名称已存在',
          },
          { status: 400 }
        );
      }
    }

    // 更新角色
    const role = await db.role.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        status: body.status,
        ...(body.menuIds && {
          menus: {
            set: [],
            connect: body.menuIds.map(id => ({ id }))
          }
        })
      },
      include: {
        menus: true
      }
    });

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: role,
    });
  } catch (err) {
    console.error('更新角色失败:', err);
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
 * 删除角色
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        {
          code: 400,
          message: 'Missing role ID',
        },
        { status: 400 }
      );
    }

    // 检查角色是否存在
    const role = await db.role.findUnique({
      where: { id: parseInt(id) },
      include: {
        userrole: true
      }
    });

    if (!role) {
      return NextResponse.json(
        {
          code: 404,
          message: '角色不存在',
        },
        { status: 404 }
      );
    }

    // 检查是否为系统角色
    if (role.isSystem) {
      return NextResponse.json(
        {
          code: 403,
          message: '系统角色不可删除',
        },
        { status: 403 }
      );
    }

    // 检查是否有用户关联此角色
    if (role.userrole && role.userrole.length > 0) {
      return NextResponse.json(
        {
          code: 400,
          message: '此角色已分配给用户，请先移除关联用户',
        },
        { status: 400 }
      );
    }

    // 删除角色
    await db.role.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      code: 0,
      message: 'success',
      data: null,
    });
  } catch (err) {
    console.error('删除角色失败:', err);
    return NextResponse.json(
      {
        code: 500,
        message: 'Internal Server Error',
      },
      { status: 500 }
    );
  }
} 