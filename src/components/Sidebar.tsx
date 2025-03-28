import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, MenuProps } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getMenuIcon } from '@/routes/constants';

const { Sider } = Layout;

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

// 定义菜单项类型（直接在这里定义，不依赖外部）
interface MenuItemType {
  id: number;
  name: string;
  path?: string;
  icon?: string;
  parentId?: number | null;
  children?: MenuItemType[];
  hidden?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed = false, 
  onCollapse = () => {} 
}) => {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const { menus } = useAuth();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([pathname]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState<MenuProps['items']>([]);

  // 当路径改变时，更新选中的菜单项
  useEffect(() => {
    setSelectedKeys([pathname]);
    
    // 设置默认展开的菜单
    const pathParts = pathname.split('/').filter(Boolean);
    const newOpenKeys: string[] = [];
    
    let currentPath = '';
    pathParts.forEach(part => {
      currentPath += `/${part}`;
      newOpenKeys.push(currentPath);
    });
    
    setOpenKeys(newOpenKeys);
  }, [pathname]);

  // 直接从菜单数据生成菜单项 - 使用useCallback包装
  const generateMenuItems = useCallback((menuItems: MenuItemType[]): MenuProps["items"] => {
    console.log('生成菜单项，菜单数据:', menuItems);
    
    if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
      console.warn('菜单数据为空或格式不正确');
      return [];
    }
    
    return menuItems
      .filter(item => !item.hidden) // 过滤掉隐藏的菜单项
      .map(item => {
        const hasChildren = item.children && item.children.length > 0;
        
        console.log(`处理菜单项: ${item.name}, 路径: ${item.path || '未指定'}`);
        
        if (hasChildren) {
          return {
            key: item.path || `menu-${item.id}`,
            icon: getMenuIcon(item.icon || ""),
            label: item.name,
            children: generateMenuItems(item.children),
          };
        }
        
        return {
          key: item.path || `menu-${item.id}`,
          icon: getMenuIcon(item.icon || ""),
          label: item.name,
        };
      });
  }, []); // 递归函数没有额外依赖

  // 当后端返回的菜单数据改变时，重新生成菜单项
  useEffect(() => {
    console.log('=== 菜单数据更新 ===');
    console.log('菜单数据原始值:', menus);
    
    if (menus && Array.isArray(menus) && menus.length > 0) {
      // 不做额外的类型转换，直接使用后端返回的数据
      const items = generateMenuItems(menus as unknown as MenuItemType[]);
      console.log('生成的菜单项:', items);
      setMenuItems(items);
    } else {
      console.warn('警告: 无菜单数据或格式不正确');
      console.log('menus类型:', typeof menus);
      console.log('是否为数组:', Array.isArray(menus));
      console.log('数组长度:', Array.isArray(menus) ? menus.length : '非数组');
      setMenuItems([]);
    }
  }, [menus, generateMenuItems]); // 添加generateMenuItems作为依赖

  // 处理菜单项点击
  const handleMenuClick = ({ key }: { key: string }) => {
    console.log('点击菜单项:', key);
    if (key.startsWith('http://') || key.startsWith('https://')) {
      // 外部链接，在新窗口打开
      window.open(key, '_blank');
    } else {
      // 内部链接，使用路由导航
      router.push(key);
    }
  };

  // 处理子菜单展开/收起
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={220}
      className="site-layout-background"
    >
      <div className="logo" style={{ 
        height: '64px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        color: 'white',
        fontSize: collapsed ? '16px' : '20px',
        fontWeight: 'bold',
        transition: 'all 0.2s'
      }}>
        {collapsed ? 'APP' : '管理系统'}
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        onClick={handleMenuClick}
        items={menuItems}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
};

export default Sidebar; 