import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdmin } from '@/utils/auth-utils';

// 获取所有角色
export async function GET(request: NextRequest) {
  try {
    const roles = await db.role.findMany({
      include: {
        permissions: true,
        menus: true
      }
    });

    return NextResponse.json({
      success: true,
      data: roles
    }, { status: 200 });
  } catch (error) {
    console.error('获取角色列表失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取角色列表失败'
    }, { status: 500 });
  }
}

// 创建新角色
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
    if (!data.name) {
      return NextResponse.json({
        success: false,
        message: '角色名称为必填项'
      }, { status: 400 });
    }

    // 检查角色名是否已存在
    const existingRole = await db.role.findUnique({
      where: { name: data.name }
    });

    if (existingRole) {
      return NextResponse.json({
        success: false,
        message: '角色名称已存在'
      }, { status: 409 });
    }

    // 创建角色
    const role = await db.role.create({
      data: {
        name: data.name,
        description: data.description || null,
        // 如果提供了权限ID列表，建立关联
        permissions: data.permissionIds && data.permissionIds.length > 0 ? {
          connect: data.permissionIds.map((id: number) => ({ id }))
        } : undefined,
        // 如果提供了菜单ID列表，建立关联
        menus: data.menuIds && data.menuIds.length > 0 ? {
          connect: data.menuIds.map((id: number) => ({ id }))
        } : undefined
      },
      include: {
        permissions: true,
        menus: true
      }
    });

    return NextResponse.json({
      success: true,
      data: role,
      message: '角色创建成功'
    }, { status: 201 });
  } catch (error) {
    console.error('创建角色失败:', error);
    return NextResponse.json({
      success: false,
      message: '创建角色失败'
    }, { status: 500 });
  }
} 