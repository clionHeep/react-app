import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('开始清除数据库...');

    // 按照外键约束的顺序删除数据
    console.log('删除 userrole 表数据...');
    await prisma.userrole.deleteMany();

    console.log('删除 rolemenu 表数据...');
    await prisma.rolemenu.deleteMany();

    console.log('删除 rolepermission 表数据...');
    await prisma.rolepermission.deleteMany();

    console.log('删除 refreshtoken 表数据...');
    await prisma.refreshtoken.deleteMany();

    console.log('删除 post 表数据...');
    await prisma.post.deleteMany();

    console.log('删除 user 表数据...');
    await prisma.user.deleteMany();

    console.log('删除 role 表数据...');
    await prisma.role.deleteMany();

    console.log('删除 permission 表数据...');
    await prisma.permission.deleteMany();

    console.log('删除 menu 表数据...');
    await prisma.menu.deleteMany();

    console.log('删除 verificationcode 表数据...');
    await prisma.verificationcode.deleteMany();

    console.log('所有表数据已清除');

    // 重置所有表的自增ID为1
    console.log('重置所有表的AUTO_INCREMENT值...');
    await resetAutoIncrements();
    console.log('AUTO_INCREMENT值已重置为1');

    // 创建默认数据
    console.log('开始创建默认数据...');

    // 1. 创建默认权限
    console.log('创建默认权限...');
    const permissions = await Promise.all([
      prisma.permission.create({
        data: {
          code: 'dashboard:view',
          name: '查看仪表盘',
          description: '允许查看仪表盘页面',
          updatedAt: new Date()
        }
      }),
      prisma.permission.create({
        data: {
          code: 'user:manage',
          name: '用户管理',
          description: '允许管理用户',
          updatedAt: new Date()
        }
      }),
      prisma.permission.create({
        data: {
          code: 'role:manage',
          name: '角色管理',
          description: '允许管理角色',
          updatedAt: new Date()
        }
      }),
      prisma.permission.create({
        data: {
          code: 'permission:manage',
          name: '权限管理',
          description: '允许管理权限',
          updatedAt: new Date()
        }
      }),
      prisma.permission.create({
        data: {
          code: 'menu:manage',
          name: '菜单管理',
          description: '允许管理菜单',
          updatedAt: new Date()
        }
      })
    ]);
    console.log(`创建了 ${permissions.length} 个权限`);

    // 2. 创建默认菜单
    console.log('创建默认菜单...');
    
    // 主菜单 - 仪表盘
    const dashboardMenu = await prisma.menu.create({
      data: {
        name: '仪表盘',
        path: '/dashboard',
        icon: 'dashboard',
        sort: 1,
        hidden: false,
        updatedAt: new Date()
      }
    });

    // 仪表盘子菜单
    await Promise.all([
      prisma.menu.create({
        data: {
          name: '工作台',
          path: '/dashboard/workspace',
          icon: 'desktop',
          sort: 1,
          hidden: false,
          parentId: dashboardMenu.id,
          updatedAt: new Date()
        }
      }),
      prisma.menu.create({
        data: {
          name: '分析页',
          path: '/dashboard/analytics',
          icon: 'bar-chart',
          sort: 2,
          hidden: false,
          parentId: dashboardMenu.id,
          updatedAt: new Date()
        }
      })
    ]);

    // 主菜单 - 系统管理
    const systemMenu = await prisma.menu.create({
      data: {
        name: '系统管理',
        path: '/system',
        icon: 'setting',
        sort: 100,
        hidden: false,
        updatedAt: new Date()
      }
    });

    // 系统管理子菜单
    await Promise.all([
      prisma.menu.create({
        data: {
          name: '用户管理',
          path: '/system/users',
          icon: 'user',
          sort: 1,
          hidden: false,
          parentId: systemMenu.id,
          updatedAt: new Date()
        }
      }),
      prisma.menu.create({
        data: {
          name: '角色管理',
          path: '/system/roles',
          icon: 'team',
          sort: 2,
          hidden: false,
          parentId: systemMenu.id,
          updatedAt: new Date()
        }
      }),
      prisma.menu.create({
        data: {
          name: '菜单管理',
          path: '/system/menus',
          icon: 'menu',
          sort: 3,
          hidden: false,
          parentId: systemMenu.id,
          updatedAt: new Date()
        }
      }),
      prisma.menu.create({
        data: {
          name: '权限管理',
          path: '/system/permissions',
          icon: 'safety-certificate',
          sort: 4,
          hidden: false,
          parentId: systemMenu.id,
          updatedAt: new Date()
        }
      })
    ]);

    const allMenus = await prisma.menu.findMany();
    console.log(`创建了 ${allMenus.length} 个菜单`);

    // 3. 创建角色
    console.log('创建角色...');
    const adminRole = await prisma.role.create({
      data: {
        name: 'admin',
        description: '系统管理员',
        updatedAt: new Date()
      }
    });

    // 创建普通用户角色（此变量会在后面使用）
    await prisma.role.create({
      data: {
        name: 'user',
        description: '普通用户',
        updatedAt: new Date()
      }
    });
    console.log('角色创建完成');

    // 4. 创建默认管理员用户
    console.log('创建管理员用户...');
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        password: '$2b$10$4ghQGLoT8QzAifdXGN54K.dcIA8kl1GEh6txwbBBsKG/NyjWn.v7u', // 明文密码: admin123
        email: 'admin@example.com',
        name: '系统管理员',
        status: 'ACTIVE',
        roles: 'admin',
        updatedAt: new Date()
      }
    });
    console.log('管理员用户创建完成');

    // 5. 为管理员角色关联所有权限和菜单
    console.log('关联管理员角色权限和菜单...');

    // 角色-权限关联
    for (const permission of permissions) {
      await prisma.rolepermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      });
    }

    // 角色-菜单关联
    for (const menu of allMenus) {
      await prisma.rolemenu.create({
        data: {
          roleId: adminRole.id,
          menuId: menu.id
        }
      });
    }

    // 6. 为管理员用户关联角色
    await prisma.userrole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    });

    // 7. 使用多对多关系更新
    try {
      await prisma.role.update({
        where: { id: adminRole.id },
        data: {
          permissions: {
            connect: permissions.map(p => ({ id: p.id }))
          },
          menus: {
            connect: allMenus.map(m => ({ id: m.id }))
          },
          users: {
            connect: [{ id: adminUser.id }]
          }
        }
      });
      console.log('多对多关系更新成功');
    } catch (e) {
      console.log('多对多关系更新失败:', e);
    }

    console.log('默认数据创建完成！');
  } catch (error) {
    console.error('数据库重置失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 重置所有表的AUTO_INCREMENT值为1
async function resetAutoIncrements() {
  const tables = [
    'user',
    'role',
    'permission',
    'menu',
    'post',
    'refreshtoken',
    'rolepermission',
    'rolemenu',
    'userrole',
    'verificationcode'
  ];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE \`${table}\` AUTO_INCREMENT = 1`);
      console.log(`表 ${table} 的AUTO_INCREMENT已重置为1`);
    } catch (error) {
      console.error(`重置表 ${table} 的AUTO_INCREMENT失败:`, error);
    }
  }
}

main()
  .then(() => console.log('数据库重置完成'))
  .catch((e) => console.error('脚本执行失败:', e)); 