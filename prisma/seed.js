import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据...');
  
  // 清理现有数据（可选）
  await prisma.userrole.deleteMany({});
  await prisma.rolepermission.deleteMany({});
  await prisma.rolemenu.deleteMany({});
  await prisma.refreshtoken.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.menu.deleteMany({});

  // 创建角色
  const adminRole = await prisma.role.create({
    data: {
      name: '管理员',
      description: '系统管理员，拥有所有权限',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const userRole = await prisma.role.create({
    data: {
      name: '普通用户',
      description: '普通用户，拥有基本权限',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('角色创建成功');

  // 创建权限
  const permissions = await Promise.all([
    // 用户管理权限
    prisma.permission.create({
      data: {
        code: 'system:user:list',
        name: '用户列表',
        description: '查看用户列表',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.permission.create({
      data: {
        code: 'system:user:create',
        name: '创建用户',
        description: '创建新用户',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.permission.create({
      data: {
        code: 'system:user:update',
        name: '更新用户',
        description: '更新用户信息',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.permission.create({
      data: {
        code: 'system:user:delete',
        name: '删除用户',
        description: '删除用户',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    // 角色管理权限
    prisma.permission.create({
      data: {
        code: 'system:role:list',
        name: '角色列表',
        description: '查看角色列表',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.permission.create({
      data: {
        code: 'system:role:create',
        name: '创建角色',
        description: '创建新角色',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    // 菜单管理权限
    prisma.permission.create({
      data: {
        code: 'system:menu:list',
        name: '菜单列表',
        description: '查看菜单列表',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    // 基本权限
    prisma.permission.create({
      data: {
        code: 'system:profile:view',
        name: '查看个人资料',
        description: '查看个人资料',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.permission.create({
      data: {
        code: 'system:profile:update',
        name: '更新个人资料',
        description: '更新个人资料',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
  ]);

  console.log('权限创建成功');

  // 创建菜单
  const dashboardMenu = await prisma.menu.create({
    data: {
      name: '仪表盘',
      path: '/dashboard',
      component: 'Dashboard',
      icon: 'dashboard',
      sort: 1,
      hidden: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const systemMenu = await prisma.menu.create({
    data: {
      name: '系统管理',
      path: '/system',
      icon: 'setting',
      sort: 2,
      hidden: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const userMenu = await prisma.menu.create({
    data: {
      name: '用户管理',
      path: '/system/user',
      component: 'system/user/index',
      icon: 'user',
      sort: 1,
      hidden: false,
      parentId: systemMenu.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const roleMenu = await prisma.menu.create({
    data: {
      name: '角色管理',
      path: '/system/role',
      component: 'system/role/index',
      icon: 'team',
      sort: 2,
      hidden: false,
      parentId: systemMenu.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const menuMenu = await prisma.menu.create({
    data: {
      name: '菜单管理',
      path: '/system/menu',
      component: 'system/menu/index',
      icon: 'menu',
      sort: 3,
      hidden: false,
      parentId: systemMenu.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const profileMenu = await prisma.menu.create({
    data: {
      name: '个人中心',
      path: '/profile',
      component: 'profile/index',
      icon: 'user',
      sort: 10,
      hidden: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('菜单创建成功');

  // 创建用户 (使用bcrypt加密密码)
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const userPassword = await bcrypt.hash('user123', salt);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      name: '系统管理员',
      avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
      status: 'ACTIVE',
      roles: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: userPassword,
      name: '测试用户',
      avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
      status: 'ACTIVE',
      roles: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('用户创建成功');

  // 关联用户与角色
  await prisma.userrole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id,
      createdAt: new Date(),
    },
  });

  await prisma.userrole.create({
    data: {
      userId: normalUser.id,
      roleId: userRole.id,
      createdAt: new Date(),
    },
  });

  console.log('用户角色关联成功');

  // 关联角色与权限 (管理员角色拥有所有权限)
  for (const permission of permissions) {
    await prisma.rolepermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: permission.id,
        createdAt: new Date(),
      },
    });
  }

  // 为普通用户角色分配基本权限
  const basicPermissions = permissions.filter(p => 
    p.code === 'system:profile:view' || 
    p.code === 'system:profile:update'
  );

  for (const permission of basicPermissions) {
    await prisma.rolepermission.create({
      data: {
        roleId: userRole.id,
        permissionId: permission.id,
        createdAt: new Date(),
      },
    });
  }

  console.log('角色权限关联成功');

  // 关联角色与菜单 (管理员可以访问所有菜单)
  const allMenus = [dashboardMenu, systemMenu, userMenu, roleMenu, menuMenu, profileMenu];
  
  for (const menu of allMenus) {
    await prisma.rolemenu.create({
      data: {
        roleId: adminRole.id,
        menuId: menu.id,
        createdAt: new Date(),
      },
    });
  }

  // 为普通用户角色分配可访问的菜单
  const userMenus = [dashboardMenu, profileMenu];
  
  for (const menu of userMenus) {
    await prisma.rolemenu.create({
      data: {
        roleId: userRole.id,
        menuId: menu.id,
        createdAt: new Date(),
      },
    });
  }

  console.log('角色菜单关联成功');
  console.log('数据初始化完成!');
}

main()
  .catch((e) => {
    console.error('初始化数据出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 