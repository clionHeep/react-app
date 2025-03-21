import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 检查是否已登录
    const accessToken = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    if (accessToken && user) {
      // 已登录，重定向到仪表盘
      router.push('/dashboard');
    } else {
      // 未登录，重定向到登录页
      router.push('/login');
    }
  }, [router]);

  return (
    <div style={{       display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      background: '#f0f2f5' 
    }}>
      正在跳转，请稍候...
    </div>
  );
} 