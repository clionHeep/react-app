import React, { useState } from 'react';
import { Layout, theme } from 'antd';
import Sidebar from '../Sidebar';
import { useAuth } from '@/context/AuthContext';

const { Header, Content, Footer } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const { isAuthenticated, user } = useAuth();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: token.colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h1 style={{ margin: 0 }}>管理系统</h1>
          </div>
          <div>
            {isAuthenticated && user ? (
              <span>欢迎, {user.name || user.username}</span>
            ) : (
              <span>未登录</span>
            )}
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: token.colorBgContainer }}>
          {children}
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          管理系统 ©{new Date().getFullYear()} 版权所有
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 