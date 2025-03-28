import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

// 密码加密辅助函数
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

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
      isSystem: true,
      status: 1
    }
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: '普通用户',
      isSystem: true,
      status: 1
    }
  });

  console.log('已创建角色:', { adminRole, userRole });

  // 2. 创建系统管理相关权限
  const systemPermissions = await Promise.all([
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
    prisma.permission.upsert({
      where: { code: 'system:menus:add' },
      update: {},
      create: { code: 'system:menus:add', name: '添加菜单' }
    }),
    prisma.permission.upsert({
      where: { code: 'system:menus:edit' },
      update: {},
      create: { code: 'system:menus:edit', name: '编辑菜单' }
    }),
    prisma.permission.upsert({
      where: { code: 'system:menus:delete' },
      update: {},
      create: { code: 'system:menus:delete', name: '删除菜单' }
    })
  ]);

  console.log(`已创建 ${systemPermissions.length} 个系统管理权限`);

  // 3. 为管理员角色分配所有权限
  const adminPermissions = await Promise.all(
    systemPermissions.map(permission => 
      prisma.rolepermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      })
    )
  );

  console.log(`已为管理员角色分配 ${adminPermissions.length} 个权限`);

  // 4. 创建系统管理菜单
  const systemMenu = await prisma.menu.create({
    data: {
      name: '系统管理',
      path: '/system',
      icon: 'SettingOutlined',
      sort: 1,
      component: 'System',
      status: 1
    }
  });

  // 创建系统管理子菜单
  const usersMenu = await prisma.menu.create({
    data: {
      name: '用户管理',
      path: '/system/users',
      icon: 'UserOutlined',
      sort: 1,
      component: 'SystemUsers',
      parentId: systemMenu.id,
      status: 1
    }
  });

  const rolesMenu = await prisma.menu.create({
    data: {
      name: '角色管理',
      path: '/system/roles',
      icon: 'TeamOutlined',
      sort: 2,
      component: 'SystemRoles',
      parentId: systemMenu.id,
      status: 1
    }
  });

  const menusMenu = await prisma.menu.create({
    data: {
      name: '菜单管理',
      path: '/system/menus',
      icon: 'MenuOutlined',
      sort: 3,
      component: 'SystemMenus',
      parentId: systemMenu.id,
      status: 1
    }
  });

  console.log('已创建系统管理菜单');

  // 5. 添加菜单权限关联
  const menuPermissions = await Promise.all([
    // 系统管理菜单权限
    prisma.menuPermission.create({
      data: {
        menuId: systemMenu.id,
        permissionId: systemPermissions.find(p => p.code === 'system:index:view').id,
        actionType: 'view'
      }
    }),

    // 用户管理菜单权限
    prisma.menuPermission.create({
      data: {
        menuId: usersMenu.id,
        permissionId: systemPermissions.find(p => p.code === 'system:users:view').id,
        actionType: 'view'
      }
    }),
    prisma.menuPermission.create({
      data: {
        menuId: usersMenu.id,
        permissionId: systemPermissions.find(p => p.code === 'system:users:add').id,
        actionType: 'add'
      }
    }),
    prisma.menuPermission.create({
      data: {
        menuId: usersMenu.id,
        permissionId: systemPermissions.find(p => p.code === 'system:users:edit').id,
        actionType: 'edit'
      }
    }),
    prisma.menuPermission.create({
      data: {
        menuId: usersMenu.id,
        permissionId: systemPermissions.find(p => p.code === 'system:users:delete').id,
        actionType: 'delete'
      }
    }),

    // 角色管理菜单权限
    prisma.menuPermission.create({
      data: {
        menuId: rolesMenu.id,
        permissionId: systemPermissions.find(p => p.code === 'system:roles:view').id,
        actionType: 'view'
      }
    }),
    prisma.menuPermission.create({
      data: {
        menuId: rolesMenu.id,
        permissionId: systemPermissions.find(p => p.code === 'system:roles:add').id,
        actionType: 'add'
      }
    }),
    prisma.menuPermission.create({
      data: {
        menuId: rolesMenu.id,
        permissionId: systemPermissions.find(p => p.code === 'system:roles:edit').id,
        actionType: 'edit'
      }
    }),
    prisma.menuPermission.create({
      data: {
        menuId: rolesMenu.id,
        permissionId: systemPermissions.find(p => p.code === 'system:roles:delete').id,
        actionType: 'delete'
      }
    }),

    // 菜单管理菜单权限
    prisma.menuPermission.create({
      data: {
        menuId: menusMenu.id,
        permissionId: systemPermissions.find(p => p.code === 'system:menus:view').id,
        actionType: 'view'
      }
    }),
    prisma.menuPermission.create({
      data: {
        menuId: menusMenu.id,
        permissionId: systemPermissions.find(p => p.code === 'system:menus:add').id,
        actionType: 'add'
      }
    }),
    prisma.menuPermission.create({
      data: {
        menuId: menusMenu.id,
        permissionId: systemPermissions.find(p => p.code === 'system:menus:edit').id,
        actionType: 'edit'
      }
    }),
    prisma.menuPermission.create({
      data: {
        menuId: menusMenu.id,
        permissionId: systemPermissions.find(p => p.code === 'system:menus:delete').id,
        actionType: 'delete'
      }
    })
  ]);

  console.log(`已创建 ${menuPermissions.length} 个菜单权限关联`);

  // 6. 创建管理员用户
  const adminPassword = await hashPassword('admin123');
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      password: adminPassword,
      email: 'admin@example.com',
      name: '系统管理员',
      status: 'ACTIVE'
    }
  });

  // 创建测试用户
  const userPassword = await hashPassword('user123');
  const testUser = await prisma.user.create({
    data: {
      username: 'user',
      password: userPassword,
      email: 'user@example.com',
      name: '测试用户',
      status: 'ACTIVE'
    }
  });

  console.log('已创建管理员用户:', adminUser);
  console.log('已创建测试用户:', testUser);

  // 7. 关联用户和角色
  await Promise.all([
    // 管理员用户关联管理员角色
    prisma.userrole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    }),
    // 测试用户关联普通用户角色
    prisma.userrole.create({
      data: {
        userId: testUser.id,
        roleId: userRole.id
      }
    })
  ]);

  console.log('已关联用户和角色');
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