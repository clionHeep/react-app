import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdmin } from '@/utils/auth-utils';

interface Params {
  params: {
    id: string;
  };
}

// 获取单个角色
export async function GET({ params }: Params) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        message: '无效的角色ID'
      }, { status: 400 });
    }

    const role = await db.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        menus: true,
        userrole: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!role) {
      return NextResponse.json({
        success: false,
        message: '角色不存在'
      }, { status: 404 });
    }

    // 格式化返回数据，提取用户信息
    const formattedRole = {
      ...role,
      users: role.userrole?.map(ur => ur.user) || []
    };

    return NextResponse.json({
      success: true,
      data: formattedRole
    }, { status: 200 });
  } catch (error) {
    console.error('获取角色详情失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取角色详情失败'
    }, { status: 500 });
  }
}

// 更新角色
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

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        message: '无效的角色ID'
      }, { status: 400 });
    }

    // 检查角色是否存在
    const existingRole = await db.role.findUnique({
      where: { id }
    });

    if (!existingRole) {
      return NextResponse.json({
        success: false,
        message: '角色不存在'
      }, { status: 404 });
    }

    // 解析请求体
    const data = await request.json();
    
    // 检查角色名是否重复
    if (data.name && data.name !== existingRole.name) {
      const nameExists = await db.role.findFirst({
        where: {
          name: data.name,
          id: { not: id }
        }
      });
      
      if (nameExists) {
        return NextResponse.json({
          success: false,
          message: '角色名称已存在'
        }, { status: 409 });
      }
    }

    // 构建更新数据
    const updateData = {
      name: data.name || existingRole.name,
      description: data.description !== undefined ? data.description : existingRole.description,
    };

    // 处理权限关联更新
    if (data.permissionIds) {
      await db.role.update({
        where: { id },
        data: {
          permissions: {
            // 先清除所有现有权限关联
            set: [],
            // 再添加新的权限关联
            connect: data.permissionIds.map((permId: number) => ({ id: permId }))
          }
        }
      });
    }

    // 处理菜单关联更新
    if (data.menuIds) {
      await db.role.update({
        where: { id },
        data: {
          menus: {
            // 先清除所有现有菜单关联
            set: [],
            // 再添加新的菜单关联
            connect: data.menuIds.map((menuId: number) => ({ id: menuId }))
          }
        }
      });
    }

    // 更新角色基本信息
    const updatedRole = await db.role.update({
      where: { id },
      data: updateData,
      include: {
        permissions: true,
        menus: true,
        userrole: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                status: true
              }
            }
          }
        }
      }
    });

    // 格式化返回数据，提取用户信息
    const formattedRole = {
      ...updatedRole,
      users: updatedRole.userrole?.map(ur => ur.user) || []
    };

    return NextResponse.json({
      success: true,
      data: formattedRole,
      message: '角色更新成功'
    }, { status: 200 });
  } catch (error) {
    console.error('更新角色失败:', error);
    return NextResponse.json({
      success: false,
      message: '更新角色失败'
    }, { status: 500 });
  }
}

// 删除角色
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    // 验证管理员权限
    const auth = await verifyAdmin(request);
    if (!auth.success) {
      return NextResponse.json({
        success: false,
        message: auth.message
      }, { status: auth.status });
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        message: '无效的角色ID'
      }, { status: 400 });
    }

    // 检查角色是否存在
    const existingRole = await db.role.findUnique({
      where: { id },
      include: {
        userrole: true
      }
    });

    if (!existingRole) {
      return NextResponse.json({
        success: false,
        message: '角色不存在'
      }, { status: 404 });
    }

    // 检查是否为管理员角色
    if (existingRole.name === 'admin') {
      return NextResponse.json({
        success: false,
        message: '无法删除管理员角色'
      }, { status: 403 });
    }

    // 检查是否有用户关联此角色
    if (existingRole.userrole && existingRole.userrole.length > 0) {
      return NextResponse.json({
        success: false,
        message: '此角色已分配给用户，请先移除关联用户'
      }, { status: 400 });
    }

    // 删除角色前，先移除与权限和菜单的关联
    await db.role.update({
      where: { id },
      data: {
        permissions: {
          set: []
        },
        menus: {
          set: []
        }
      }
    });

    // 删除角色
    await db.role.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: '角色删除成功'
    }, { status: 200 });
  } catch (error) {
    console.error('删除角色失败:', error);
    return NextResponse.json({
      success: false,
      message: '删除角色失败'
    }, { status: 500 });
  }
} 