import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('开始填充数据库初始数据...');
  
  // 先清空所有相关表并重置自增ID
  console.log('清空现有数据...');
  
  try {
    // 清空关联表（必须先清空关联表，然后才能清空主表）
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;
    
    // 清空菜单权限关联表
    await prisma.$executeRaw`TRUNCATE TABLE MenuPermission;`;
    console.log('已清空菜单权限关联表');
    
    // 清空角色权限关联表
    await prisma.$executeRaw`TRUNCATE TABLE RolePermission;`;
    console.log('已清空角色权限关联表');
    
    // 清空用户角色关联表
    await prisma.$executeRaw`TRUNCATE TABLE UserRole;`;
    console.log('已清空用户角色关联表');
    
    // 清空权限表
    await prisma.$executeRaw`TRUNCATE TABLE Permission;`;
    console.log('已清空权限表');
    
    // 清空角色表
    await prisma.$executeRaw`TRUNCATE TABLE Role;`;
    console.log('已清空角色表');
    
    // 清空菜单表
    await prisma.$executeRaw`TRUNCATE TABLE Menu;`;
    console.log('已清空菜单表');
    
    // 清空用户表
    await prisma.$executeRaw`TRUNCATE TABLE User;`;
    console.log('已清空用户表');
    
    // 重新开启外键检查
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;
    console.log('所有表已清空，自增ID已重置');
    
  } catch (error) {
    console.error('清空数据失败:', error);
    throw error;
  }

  // 1. 创建基础角色
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: '系统管理员',
      isSystem: true
    }
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: '普通用户',
      isSystem: true
    }
  });

  console.log('已创建角色:', { adminRole, userRole });

  // 2. 创建基础权限 - 使用三段式格式 module:resource:action
  const permissions = await Promise.all([
    // 仪表盘权限
    prisma.permission.upsert({
      where: { code: 'dashboard:index:view' },
      update: {},
      create: { code: 'dashboard:index:view', name: '查看仪表盘' }
    }),
    prisma.permission.upsert({
      where: { code: 'dashboard:analytics:view' },
      update: {},
      create: { code: 'dashboard:analytics:view', name: '查看分析数据' }
    }),
    prisma.permission.upsert({
      where: { code: 'dashboard:workspace:view' },
      update: {},
      create: { code: 'dashboard:workspace:view', name: '查看工作区' }
    }),
    
    // 系统管理权限
    prisma.permission.upsert({
      where: { code: 'system:index:view' },
      update: {},
      create: { code: 'system:index:view', name: '访问系统管理' }
    }),
    
    // 用户管理权限
    prisma.permission.upsert({
      where: { code: 'system:users:manage' },
      update: {},
      create: { code: 'system:users:manage', name: '用户管理' }
    }),
    prisma.permission.upsert({
      where: { code: 'system:users:view' },
      update: {},
      create: { code: 'system:users:view', name: '查看用户' }
    }),
    prisma.permission.upsert({
      where: { code: 'system:users:add' },
      update: {},
      create: { code: 'system:users:add', name: '添加用户' }
    }),
    prisma.permission.upsert({
      where: { code: 'system:users:edit' },
      update: {},
      create: { code: 'system:users:edit', name: '编辑用户' }
    }),
    prisma.permission.upsert({
      where: { code: 'system:users:delete' },
      update: {},
      create: { code: 'system:users:delete', name: '删除用户' }
    }),
    
    // 角色管理权限
    prisma.permission.upsert({
      where: { code: 'system:roles:manage' },
      update: {},
      create: { code: 'system:roles:manage', name: '角色管理' }
    }),
    prisma.permission.upsert({
      where: { code: 'system:roles:view' },
      update: {},
      create: { code: 'system:roles:view', name: '查看角色' }
    }),
    prisma.permission.upsert({
      where: { code: 'system:roles:add' },
      update: {},
      create: { code: 'system:roles:add', name: '添加角色' }
    }),
    prisma.permission.upsert({
      where: { code: 'system:roles:edit' },
      update: {},
      create: { code: 'system:roles:edit', name: '编辑角色' }
    }),
    prisma.permission.upsert({
      where: { code: 'system:roles:delete' },
      update: {},
      create: { code: 'system:roles:delete', name: '删除角色' }
    }),
    
    // 权限管理权限
    prisma.permission.upsert({
      where: { code: 'system:permissions:manage' },
      update: {},
      create: { code: 'system:permissions:manage', name: '权限管理' }
    }),
    prisma.permission.upsert({
      where: { code: 'system:permissions:view' },
      update: {},
      create: { code: 'system:permissions:view', name: '查看权限' }
    }),
    
    // 菜单管理权限
    prisma.permission.upsert({
      where: { code: 'system:menus:manage' },
      update: {},
      create: { code: 'system:menus:manage', name: '菜单管理' }
    }),
    prisma.permission.upsert({
      where: { code: 'system:menus:view' },
      update: {},
      create: { code: 'system:menus:view', name: '查看菜单' }
    }),
    
    // 设置权限
    prisma.permission.upsert({
      where: { code: 'settings:index:view' },
      update: {},
      create: { code: 'settings:index:view', name: '查看设置' }
    }),
    
    // 电子商务权限
    prisma.permission.upsert({
      where: { code: 'e-commerce:index:view' },
      update: {},
      create: { code: 'e-commerce:index:view', name: '查看电子商务' }
    }),
    
    // 开发工具权限
    prisma.permission.upsert({
      where: { code: 'dev-tools:index:view' },
      update: {},
      create: { code: 'dev-tools:index:view', name: '查看开发工具' }
    }),
    
    // 内容管理权限
    prisma.permission.upsert({
      where: { code: 'content:index:view' },
      update: {},
      create: { code: 'content:index:view', name: '查看内容管理' }
    }),
    
    // 应用权限
    prisma.permission.upsert({
      where: { code: 'apps:index:view' },
      update: {},
      create: { code: 'apps:index:view', name: '查看应用' }
    }),
    
    // 关于页面权限
    prisma.permission.upsert({
      where: { code: 'about:index:view' },
      update: {},
      create: { code: 'about:index:view', name: '查看关于页面' }
    })
  ]);

  console.log(`已创建 ${permissions.length} 个权限`);

  // 3. 为管理员角色分配所有权限
  const adminPermissions = await Promise.all(
    permissions.map(permission => 
      prisma.rolepermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      })
    )
  );

  console.log(`已为管理员角色分配 ${adminPermissions.length} 个权限`);

  // 4. 创建基础菜单 - 基于src/app目录结构
  const dashboardMenu = await prisma.menu.create({
    data: {
      name: '仪表盘',
      path: '/dashboard',
      icon: 'DashboardOutlined',
      sort: 1,
      component: 'Dashboard'
    }
  });

  // 仪表板子菜单
  const analyticsMenu = await prisma.menu.create({
    data: {
      name: '数据分析',
      path: '/dashboard/analytics',
      icon: 'BarChartOutlined',
      sort: 1,
      component: 'DashboardAnalytics',
      parentId: dashboardMenu.id
    }
  });

  const workspaceMenu = await prisma.menu.create({
    data: {
      name: '工作区',
      path: '/dashboard/workspace',
      icon: 'AppstoreOutlined',
      sort: 2,
      component: 'DashboardWorkspace',
      parentId: dashboardMenu.id
    }
  });

  const systemMenu = await prisma.menu.create({
    data: {
      name: '系统管理',
      path: '/system',
      icon: 'SettingOutlined',
      sort: 2,
      component: 'System'
    }
  });

  const usersMenu = await prisma.menu.create({
    data: {
      name: '用户管理',
      path: '/users',
      icon: 'UserOutlined',
      sort: 3,
      component: 'Users'
    }
  });

  const settingsMenu = await prisma.menu.create({
    data: {
      name: '设置',
      path: '/settings',
      icon: 'ToolOutlined',
      sort: 4,
      component: 'Settings'
    }
  });

  const ecommerceMenu = await prisma.menu.create({
    data: {
      name: '电子商务',
      path: '/e-commerce',
      icon: 'ShoppingCartOutlined',
      sort: 5,
      component: 'ECommerce'
    }
  });

  const devToolsMenu = await prisma.menu.create({
    data: {
      name: '开发工具',
      path: '/dev-tools',
      icon: 'CodeOutlined',
      sort: 6,
      component: 'DevTools'
    }
  });

  const contentMenu = await prisma.menu.create({
    data: {
      name: '内容管理',
      path: '/content',
      icon: 'FileTextOutlined',
      sort: 7,
      component: 'Content'
    }
  });

  const appsMenu = await prisma.menu.create({
    data: {
      name: '应用',
      path: '/apps',
      icon: 'AppstoreAddOutlined',
      sort: 8,
      component: 'Apps'
    }
  });

  const aboutMenu = await prisma.menu.create({
    data: {
      name: '关于',
      path: '/about',
      icon: 'InfoCircleOutlined',
      sort: 9,
      component: 'About'
    }
  });

  console.log('已创建基础菜单');

  // 5. 添加菜单权限关联
  const menuPermissions = await Promise.all([
    // 仪表盘菜单权限
    prisma.menuPermission.create({
      data: {
        menuId: dashboardMenu.id,
        permissionId: permissions.find(p => p.code === 'dashboard:index:view').id,
        actionType: 'view'
      }
    }),

    // 分析子菜单权限
    prisma.menuPermission.create({
      data: {
        menuId: analyticsMenu.id,
        permissionId: permissions.find(p => p.code === 'dashboard:analytics:view').id,
        actionType: 'view'
      }
    }),

    // 工作区子菜单权限
    prisma.menuPermission.create({
      data: {
        menuId: workspaceMenu.id,
        permissionId: permissions.find(p => p.code === 'dashboard:workspace:view').id,
        actionType: 'view'
      }
    }),

    // 系统菜单权限
    prisma.menuPermission.create({
      data: {
        menuId: systemMenu.id,
        permissionId: permissions.find(p => p.code === 'system:index:view').id,
        actionType: 'view'
      }
    }),

    // 用户菜单权限
    prisma.menuPermission.create({
      data: {
        menuId: usersMenu.id,
        permissionId: permissions.find(p => p.code === 'system:users:view').id,
        actionType: 'view'
      }
    }),

    // 设置菜单权限
    prisma.menuPermission.create({
      data: {
        menuId: settingsMenu.id,
        permissionId: permissions.find(p => p.code === 'settings:index:view').id,
        actionType: 'view'
      }
    }),

    // 电子商务菜单权限
    prisma.menuPermission.create({
      data: {
        menuId: ecommerceMenu.id,
        permissionId: permissions.find(p => p.code === 'e-commerce:index:view').id,
        actionType: 'view'
      }
    }),

    // 开发工具菜单权限
    prisma.menuPermission.create({
      data: {
        menuId: devToolsMenu.id,
        permissionId: permissions.find(p => p.code === 'dev-tools:index:view').id,
        actionType: 'view'
      }
    }),

    // 内容管理菜单权限
    prisma.menuPermission.create({
      data: {
        menuId: contentMenu.id,
        permissionId: permissions.find(p => p.code === 'content:index:view').id,
        actionType: 'view'
      }
    }),

    // 应用菜单权限
    prisma.menuPermission.create({
      data: {
        menuId: appsMenu.id,
        permissionId: permissions.find(p => p.code === 'apps:index:view').id,
        actionType: 'view'
      }
    }),

    // 关于菜单权限
    prisma.menuPermission.create({
      data: {
        menuId: aboutMenu.id,
        permissionId: permissions.find(p => p.code === 'about:index:view').id,
        actionType: 'view'
      }
    })
  ]);

  console.log(`已创建 ${menuPermissions.length} 个菜单权限关联`);

  // 6. 创建管理员用户
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      password: '$2b$10$uVSg6DP1lLPNJB9o5NQ1wezgQRRY1.6UJjx6HGrYGcGLQwkUvHPla', // hash of 'admin123'
      email: 'admin@example.com',
      name: '系统管理员',
      status: 'ACTIVE'
    }
  });

  console.log('已创建管理员用户:', adminUser);

  // 7. 将管理员用户关联到管理员角色
  await prisma.userrole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id
    }
  });

  console.log('已关联管理员用户和角色');
  console.log('数据填充完成！');
}

main()
  .catch((e) => {
    console.error('数据填充出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 