import { NextResponse } from 'next/server';
import axios from 'axios';
import { headers } from 'next/headers';

export async function POST() {
  try {
    const headersList = await headers();
    const authorization = headersList?.get?.('Authorization') || '';
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '未授权访问' }, 
        { status: 401 }
      );
    }

    const accessToken = authorization.substring(7);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    console.log(`正在请求登出API: ${baseUrl}/auth/logout`);

    await axios.post(`${baseUrl}/auth/logout`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('登出成功');
    return NextResponse.json({ success: true, message: '成功登出' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('登出API错误:', error.message);
    } else {
      console.error('登出API错误:', error);
    }
    
    return NextResponse.json({ 
      success: true,
      message: '已登出'
    });
  }
}
