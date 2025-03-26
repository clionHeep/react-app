import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdmin } from '@/utils/auth-utils';

interface Params {
  params: {
    id: string;
  };
}

// 获取单个权限
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        message: '无效的权限ID'
      }, { status: 400 });
    }

    const permission = await db.permission.findUnique({
      where: { id },
      include: {
        roles: true,
        menu: true
      }
    });

    if (!permission) {
      return NextResponse.json({
        success: false,
        message: '权限不存在'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: permission
    }, { status: 200 });
  } catch (error) {
    console.error('获取权限详情失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取权限详情失败'
    }, { status: 500 });
  }
}

// 更新权限
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
        message: '无效的权限ID'
      }, { status: 400 });
    }

    // 检查权限是否存在
    const existingPermission = await db.permission.findUnique({
      where: { id }
    });

    if (!existingPermission) {
      return NextResponse.json({
        success: false,
        message: '权限不存在'
      }, { status: 404 });
    }

    // 解析请求体
    const data = await request.json();
    
    // 检查权限编码是否重复
    if (data.code && data.code !== existingPermission.code) {
      const codeExists = await db.permission.findFirst({
        where: {
          code: data.code,
          id: { not: id }
        }
      });
      
      if (codeExists) {
        return NextResponse.json({
          success: false,
          message: '权限编码已存在'
        }, { status: 409 });
      }
    }

    // 更新权限
    const updatedPermission = await db.permission.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : existingPermission.name,
        code: data.code !== undefined ? data.code : existingPermission.code,
        description: data.description !== undefined ? data.description : existingPermission.description
      },
      include: {
        roles: true,
        menu: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedPermission,
      message: '权限更新成功'
    }, { status: 200 });
  } catch (error) {
    console.error('更新权限失败:', error);
    return NextResponse.json({
      success: false,
      message: '更新权限失败'
    }, { status: 500 });
  }
}

// 删除权限
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
        message: '无效的权限ID'
      }, { status: 400 });
    }

    // 检查权限是否存在
    const existingPermission = await db.permission.findUnique({
      where: { id },
      include: {
        roles: true,
        menu: true
      }
    });

    if (!existingPermission) {
      return NextResponse.json({
        success: false,
        message: '权限不存在'
      }, { status: 404 });
    }

    // 检查是否有角色关联此权限
    if (existingPermission.roles && existingPermission.roles.length > 0) {
      return NextResponse.json({
        success: false,
        message: '此权限已分配给角色，请先移除关联角色'
      }, { status: 400 });
    }

    // 检查是否有菜单关联此权限
    if (existingPermission.menu && existingPermission.menu.length > 0) {
      return NextResponse.json({
        success: false,
        message: '此权限已关联菜单，请先移除关联菜单'
      }, { status: 400 });
    }

    // 删除权限
    await db.permission.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: '权限删除成功'
    }, { status: 200 });
  } catch (error) {
    console.error('删除权限失败:', error);
    return NextResponse.json({
      success: false,
      message: '删除权限失败'
    }, { status: 500 });
  }
} 