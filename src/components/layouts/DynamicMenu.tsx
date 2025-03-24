import React, { useEffect, useState } from 'react';
import { Menu, Spin } from 'antd';
import { useRouter } from 'next/router';
import { buildMenuTree, generateMenuItems, defaultMenuItems, MenuItemType } from '../../routes/constants';

interface DynamicMenuProps {
  menuData?: MenuItemType[];
  loading?: boolean;
}

/**
 * 动态菜单组件，根据后端返回的菜单数据渲染菜单
 */
const DynamicMenu: React.FC<DynamicMenuProps> = ({ menuData, loading = false }) => {
  const router = useRouter();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState(defaultMenuItems);

  // 根据当前路由路径设置选中的菜单项
  useEffect(() => {
    const path = router.pathname;
    setSelectedKeys([path]);

    // 设置展开的子菜单
    const pathParts = path.split('/').filter(Boolean);
    const newOpenKeys = pathParts.map((_, index) => {
      return '/' + pathParts.slice(0, index + 1).join('/');
    });
    setOpenKeys(newOpenKeys);
  }, [router.pathname]);

  // 当菜单数据变化时，生成新的菜单项
  useEffect(() => {
    if (menuData && menuData.length > 0) {
      const menuTree = buildMenuTree(menuData);
      const items = generateMenuItems(menuTree);
      setMenuItems(items);
    }
  }, [menuData]);

  // 处理菜单项点击
  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.startsWith('/')) {
      router.push(key);
    }
  };

  // 处理子菜单展开/收起
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <Spin spinning={loading} tip="加载菜单中...">
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        onClick={handleMenuClick}
        items={menuItems}
      />
    </Spin>
  );
};

export default DynamicMenu; 