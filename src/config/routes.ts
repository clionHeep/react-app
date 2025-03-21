// 定义免登录路由
export const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/404',
  '/500'
] as const;

// 检查是否是公开路由的辅助函数
export const isPublicRoute = (pathname: string) => {
  return PUBLIC_ROUTES.includes(pathname as (typeof PUBLIC_ROUTES)[number]);
};