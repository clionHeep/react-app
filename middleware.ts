import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要登录才能访问的路由前缀
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/admin',
];

// 公开路由，不需要登录也能访问
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/api',
  '/auth',
  '/_next',
  '/static',
  '/favicon.ico',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查是否是公开路由，直接通过
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // 检查是否是受保护的路由
  const requiresAuth = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  
  if (!requiresAuth) {
    // 不在保护列表中的路由直接放行
    return NextResponse.next();
  }
  
  // 从cookie或请求头中获取token
  const token = request.cookies.get('token')?.value;
  
  // 如果没有token且是受保护的路由，重定向到登录页面
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  
  // 有token，继续请求
  return NextResponse.next();
}

// 配置匹配规则，确保中间件在特定路径触发
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了:
     * - api路由 (/api/*)
     * - 静态文件 (如图片、JS、CSS等)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 