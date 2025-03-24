import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// JWT负载类型
interface JwtPayload {
  sub: number;
  username?: string;
  iat?: number;
  exp?: number;
}

export async function POST(request: Request) {
  try {
    // 获取请求头中的授权信息
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ message: '未提供授权信息' }, { status: 401 });
    }
    
    // 从授权头中提取令牌
    const token = authHeader.replace('Bearer ', '');
    
    try {
      // 验证令牌
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as unknown as JwtPayload;
      
      // 这里可以添加令牌黑名单逻辑，例如将令牌添加到Redis黑名单中
      // 由于JWT是无状态的，服务器端无法直接使其失效，通常的做法是：
      // 1. 使用较短的令牌过期时间
      // 2. 维护一个黑名单存储已登出但尚未过期的令牌
      
      console.log(`用户 ${decoded.username || decoded.sub} 已登出`);
      
      // 创建响应并清除cookies
      const resp = NextResponse.json({ success: true, message: '登出成功' });
      resp.cookies.delete('accessToken');
      resp.cookies.delete('refreshToken');
      
      return resp;
    } catch (jwtError) {
      console.error('JWT验证失败:', jwtError);
      
      // 即使令牌验证失败，我们仍然清除cookies
      const resp = NextResponse.json({ success: true, message: '登出成功' });
      resp.cookies.delete('accessToken');
      resp.cookies.delete('refreshToken');
      
      return resp;
    }
  } catch (error) {
    console.error('登出处理错误:', error);
    
    // 即使处理出错，我们仍然清除cookies
    const resp = NextResponse.json({ 
      success: true, 
      message: '登出成功',
      detail: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
    resp.cookies.delete('accessToken');
    resp.cookies.delete('refreshToken');
    
    return resp;
  }
}
