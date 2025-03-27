import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdmin } from '@/utils/auth-utils';
import { Prisma } from '@prisma/client';

// 获取单个用户
export async function GET(request: NextRequest) {
  try {
    // 从URL路径中提取ID
    const pathParts = request.nextUrl.pathname.split('/');
    const idStr = pathParts[pathParts.length - 1];
    const id = parseInt(idStr);
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        message: '无效的用户ID'
      }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id },
      include: {
        userrole: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '用户不存在'
      }, { status: 404 });
    }

    // 格式化返回数据，提取角色信息
    const formattedUser = {
      ...user,
      roles: user.userrole?.map(ur => ur.role) || [],
      password: undefined // 移除密码字段
    };

    return NextResponse.json({
      success: true,
      data: formattedUser
    }, { status: 200 });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取用户详情失败'
    }, { status: 500 });
  }
}

// 更新用户
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
        message: '无效的用户ID'
      }, { status: 400 });
    }

    // 检查用户是否存在
    const existingUser = await db.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        message: '用户不存在'
      }, { status: 404 });
    }

    // 解析请求体
    const data = await request.json();
    
    // 检查用户名或邮箱是否被其他用户占用
    if ((data.username && data.username !== existingUser.username) || 
        (data.email && data.email !== existingUser.email)) {
      
      const where: Prisma.userWhereInput = {
        id: { not: id },
        OR: []
      };
      
      if (data.username && data.username !== existingUser.username) {
        where.OR?.push({ username: data.username });
      }
      
      if (data.email && data.email !== existingUser.email) {
        where.OR?.push({ email: data.email });
      }
      
      const userExists = await db.user.findFirst({ where });
      
      if (userExists) {
        return NextResponse.json({
          success: false,
          message: userExists.username === data.username ? '用户名已存在' : '邮箱已存在'
        }, { status: 409 });
      }
    }

    // 构建更新数据
    const updateData: Prisma.userUpdateInput = {};
    
    // 只更新提供的字段
    if (data.username !== undefined) updateData.username = data.username;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.birthday !== undefined) updateData.birthday = data.birthday ? new Date(data.birthday) : null;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.bio !== undefined) updateData.bio = data.bio;
    
    // 处理角色关联更新
    if (data.roleIds) {
      await db.userrole.deleteMany({
        where: { userId: id }
      });
      
      for (const roleId of data.roleIds) {
        await db.userrole.create({
          data: {
            userId: id,
            roleId: roleId
          }
        });
      }
    }

    // 更新用户基本信息
    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      include: {
        userrole: {
          include: {
            role: true
          }
        }
      }
    });

    // 格式化返回数据，提取角色信息
    const formattedUser = {
      ...updatedUser,
      roles: updatedUser.userrole?.map(ur => ur.role) || [],
      password: undefined // 移除密码字段
    };

    return NextResponse.json({
      success: true,
      data: formattedUser,
      message: '用户更新成功'
    }, { status: 200 });
  } catch (error) {
    console.error('更新用户失败:', error);
    return NextResponse.json({
      success: false,
      message: '更新用户失败'
    }, { status: 500 });
  }
}

// 删除用户
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
        message: '无效的用户ID'
      }, { status: 400 });
    }

    // 检查用户是否存在
    const existingUser = await db.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        message: '用户不存在'
      }, { status: 404 });
    }

    // 检查是否为admin用户
    if (existingUser.username === 'admin') {
      return NextResponse.json({
        success: false,
        message: '无法删除管理员用户'
      }, { status: 403 });
    }

    // 先删除用户与角色的关联
    await db.userrole.deleteMany({
      where: { userId: id }
    });

    // 删除用户
    await db.user.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: '用户删除成功'
    }, { status: 200 });
  } catch (error) {
    console.error('删除用户失败:', error);
    return NextResponse.json({
      success: false,
      message: '删除用户失败'
    }, { status: 500 });
  }
} 