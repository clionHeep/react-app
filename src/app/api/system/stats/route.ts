import { NextResponse } from 'next/server';
import { db } from '@/db';

export async function GET() {
  try {
    // 获取用户总数
    const userCount = await db.user.count();
    
    // 获取角色总数
    const roleCount = await db.role.count();
    
    // 获取菜单总数
    const menuCount = await db.menu.count();

    return NextResponse.json({
      code: 0,
      data: {
        userCount,
        roleCount,
        menuCount,
      },
      message: '获取成功',
    });
  } catch (error) {
    console.error('获取系统统计数据失败:', error);
    return NextResponse.json(
      { code: 500, message: '获取系统统计数据失败' },
      { status: 500 }
    );
  }
}