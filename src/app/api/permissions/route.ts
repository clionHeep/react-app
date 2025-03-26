import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdmin } from '@/utils/auth-utils';

// 获取所有权限
export async function GET(request: Request) {
  try {
    const permissions = await db.permission.findMany({
      orderBy: { id: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: permissions
    }, { status: 200 });
  } catch (error) {
    console.error('获取权限列表失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取权限列表失败'
    }, { status: 500 });
  }
}

// 创建新权限
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
    if (!data.name || !data.code) {
      return NextResponse.json({
        success: false,
        message: '权限名称和权限编码为必填项'
      }, { status: 400 });
    }

    // 检查权限编码是否已存在
    const existingPermission = await db.permission.findUnique({
      where: { code: data.code }
    });

    if (existingPermission) {
      return NextResponse.json({
        success: false,
        message: '权限编码已存在'
      }, { status: 409 });
    }

    // 创建权限
    const permission = await db.permission.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description || null
      }
    });

    return NextResponse.json({
      success: true,
      data: permission,
      message: '权限创建成功'
    }, { status: 201 });
  } catch (error) {
    console.error('创建权限失败:', error);
    return NextResponse.json({
      success: false,
      message: '创建权限失败'
    }, { status: 500 });
  }
} 