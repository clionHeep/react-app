/*
* 创建基本菜单的脚本
* 
* 运行方法：
* 1. 确保已安装依赖: npm install
* 2. 执行脚本: node prisma/createBasicMenus.js
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('开始创建基本菜单...');

    // 检查并创建仪表盘菜单
    let dashboardMenu = await prisma.menu.findFirst({
      where: { path: '/dashboard' }
    });

    if (dashboardMenu) {
      console.log(`仪表盘菜单已存在: ${dashboardMenu.name} (ID: ${dashboardMenu.id})`);
    } else {
      dashboardMenu = await prisma.menu.create({
        data: {
          name: '仪表盘',
          path: '/dashboard',
          component: 'Dashboard',
          icon: 'dashboard',
          sort: 1,
          hidden: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      console.log(`仪表盘菜单创建成功 (ID: ${dashboardMenu.id})`);
    }

    // 检查并创建个人中心菜单
    let profileMenu = await prisma.menu.findFirst({
      where: { path: '/profile' }
    });

    if (profileMenu) {
      console.log(`个人中心菜单已存在: ${profileMenu.name} (ID: ${profileMenu.id})`);
    } else {
      profileMenu = await prisma.menu.create({
        data: {
          name: '个人中心',
          path: '/profile',
          component: 'profile/index',
          icon: 'user',
          sort: 10,
          hidden: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      console.log(`个人中心菜单创建成功 (ID: ${profileMenu.id})`);
    }

    // 获取管理员角色
    const adminRole = await prisma.role.findFirst({
      where: { name: '管理员' }
    });

    if (adminRole) {
      // 为管理员分配这些菜单
      for (const menu of [dashboardMenu, profileMenu]) {
        const existingRoleMenu = await prisma.rolemenu.findFirst({
          where: {
            roleId: adminRole.id,
            menuId: menu.id
          }
        });

        if (existingRoleMenu) {
          console.log(`管理员已有菜单 "${menu.name}" 的权限，跳过`);
        } else {
          await prisma.rolemenu.create({
            data: {
              roleId: adminRole.id,
              menuId: menu.id,
              createdAt: new Date()
            }
          });
          console.log(`为管理员分配菜单 "${menu.name}" 成功`);
        }
      }
    } else {
      console.log('未找到管理员角色，跳过为管理员分配菜单');
    }

    // 检查系统菜单 (可选的额外菜单)
    let systemMenu = await prisma.menu.findFirst({
      where: { path: '/system' }
    });

    if (systemMenu) {
      console.log(`系统管理菜单已存在: ${systemMenu.name} (ID: ${systemMenu.id})`);
    } else {
      systemMenu = await prisma.menu.create({
        data: {
          name: '系统管理',
          path: '/system',
          icon: 'setting',
          sort: 2,
          hidden: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      console.log(`系统管理菜单创建成功 (ID: ${systemMenu.id})`);

      // 为系统管理菜单创建子菜单
      const systemSubMenus = [
        {
          name: '用户管理',
          path: '/system/user',
          component: 'system/user/index',
          icon: 'user',
          sort: 1,
          parentId: systemMenu.id
        },
        {
          name: '角色管理',
          path: '/system/role',
          component: 'system/role/index',
          icon: 'team',
          sort: 2,
          parentId: systemMenu.id
        },
        {
          name: '菜单管理',
          path: '/system/menu',
          component: 'system/menu/index',
          icon: 'menu',
          sort: 3,
          parentId: systemMenu.id
        }
      ];

      for (const subMenu of systemSubMenus) {
        const newSubMenu = await prisma.menu.create({
          data: {
            ...subMenu,
            hidden: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
        console.log(`创建子菜单 "${subMenu.name}" 成功 (ID: ${newSubMenu.id})`);

        // 为管理员分配子菜单
        if (adminRole) {
          await prisma.rolemenu.create({
            data: {
              roleId: adminRole.id,
              menuId: newSubMenu.id,
              createdAt: new Date()
            }
          });
          console.log(`为管理员分配子菜单 "${subMenu.name}" 成功`);
        }
      }

      // 为管理员分配系统管理菜单
      if (adminRole) {
        await prisma.rolemenu.create({
          data: {
            roleId: adminRole.id,
            menuId: systemMenu.id,
            createdAt: new Date()
          }
        });
        console.log(`为管理员分配菜单 "${systemMenu.name}" 成功`);
      }
    }

    console.log('基本菜单创建完成');
  } catch (err) {
    console.error('创建菜单出错:', err);
  }
}

main()
  .catch((e) => {
    console.error('脚本运行出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 