import React, { useEffect, useState } from 'react';
import { Layout, theme, Drawer, Button } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import DynamicMenu from './DynamicMenu';
import { MenuItemType } from '../../routes/constants';
import { useRouter } from 'next/router';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * 应用主布局组件
 */
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuData, setMenuData] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(false);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 监听窗口大小变化，设置是否为移动视图
  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    
    // 初始化
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 从登录数据中获取菜单
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);
        
        // 从本地存储获取用户信息
        const authData = localStorage.getItem('auth_data');
        if (!authData) {
          // 未登录，跳转到登录页
          router.push('/login');
          return;
        }
        
        const userData = JSON.parse(authData);
        
        // 如果有菜单数据，使用它
        if (userData.data?.menus) {
          setMenuData(userData.data.menus);
        } else {
          // 否则尝试通过API重新获取
          const response = await fetch('/api/auth/user/menu');
          const result = await response.json();
          
          if (result.status === 200 && result.data) {
            setMenuData(result.data);
          }
        }
      } catch (error) {
        console.error('加载菜单数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMenuData();
  }, [router]);

  // 切换侧边栏折叠状态
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // 切换移动菜单显示状态
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {mobileView ? (
        // 移动视图下的侧边栏（使用抽屉组件）
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={200}
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ height: '100%', backgroundColor: '#001529' }}>
            <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <h1 style={{ color: 'white', margin: 0, fontSize: '18px' }}>管理系统</h1>
            </div>
            <DynamicMenu menuData={menuData} loading={loading} />
          </div>
        </Drawer>
      ) : (
        // 桌面视图下的侧边栏
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          style={{ 
            overflow: 'auto',
            height: '100vh',
            position: 'sticky',
            top: 0,
            left: 0
          }}
        >
          <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ color: 'white', margin: 0, fontSize: collapsed ? '14px' : '18px' }}>
              {collapsed ? 'MS' : '管理系统'}
            </h1>
          </div>
          <DynamicMenu menuData={menuData} loading={loading} />
        </Sider>
      )}
      
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingInline: 16 }}>
            {mobileView ? (
              <Button type="text" onClick={toggleMobileMenu} icon={<MenuUnfoldOutlined />} />
            ) : (
              <Button 
                type="text" 
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
                onClick={toggleCollapsed} 
              />
            )}
            <div>
              {/* 可以添加用户头像、通知等UI元素 */}
            </div>
          </div>
        </Header>
        
        <Content style={{ margin: '16px', padding: 24, background: colorBgContainer, borderRadius: borderRadiusLG }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout; 