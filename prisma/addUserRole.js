/*
* 为用户分配角色的脚本
* 
* 运行方法：
* 1. 确保已安装依赖: npm install
* 2. 执行脚本: node prisma/addUserRole.js
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('开始处理用户角色...');

    // 获取所有角色
    const roles = await prisma.role.findMany();
    console.log(`找到 ${roles.length} 个角色: ${roles.map(r => r.name).join(', ')}`);

    // 查找普通用户角色 - 注意名称可能不同，根据实际情况调整
    let userRole = roles.find(r => r.name === '普通用户');
    
    if (!userRole) {
      // 尝试其他可能的名称
      userRole = roles.find(r => r.name === '用户');
      if (userRole) {
        console.log(`找到"用户"角色，ID: ${userRole.id}`);
      }
    } else {
      console.log(`找到"普通用户"角色，ID: ${userRole.id}`);
    }

    if (!userRole) {
      console.log('没有找到普通用户角色，创建新角色');
      userRole = await prisma.role.create({
        data: {
          name: '普通用户',
          description: '普通用户，拥有基本权限',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      console.log(`成功创建普通用户角色，ID: ${userRole.id}`);
    }

    // 获取所有用户
    const users = await prisma.user.findMany({
      include: {
        userrole: {
          include: {
            role: true
          }
        }
      }
    });
    console.log(`找到 ${users.length} 个用户`);

    let assignedCount = 0;
    for (const user of users) {
      console.log(`处理用户: ${user.username || user.name || user.email || user.id}`);
      const hasUserRole = user.userrole.some(ur => ur.role.id === userRole.id);
      
      if (hasUserRole) {
        console.log(`  用户已有普通用户角色，跳过`);
      } else {
        try {
          await prisma.userrole.create({
            data: {
              userId: user.id,
              roleId: userRole.id,
              createdAt: new Date()
            }
          });
          console.log(`  为用户分配了普通用户角色`);
          assignedCount++;
        } catch (err) {
          console.error(`  为用户分配角色失败:`, err);
        }
      }
    }

    console.log(`共为 ${assignedCount} 名用户分配了普通用户角色`);

    // 获取所有菜单
    const allMenus = await prisma.menu.findMany();
    console.log(`找到 ${allMenus.length} 个菜单`);

    // 为普通用户角色分配基本菜单
    const dashboardMenu = await prisma.menu.findFirst({
      where: { path: '/dashboard' }
    });
    if (dashboardMenu) {
      console.log(`找到仪表盘菜单: ${dashboardMenu.name}, ID: ${dashboardMenu.id}`);
    } else {
      console.log('未找到仪表盘菜单');
    }

    const profileMenu = await prisma.menu.findFirst({
      where: { path: '/profile' }
    });
    if (profileMenu) {
      console.log(`找到个人中心菜单: ${profileMenu.name}, ID: ${profileMenu.id}`);
    } else {
      console.log('未找到个人中心菜单');
    }

    const menuToAssign = [];
    if (dashboardMenu) menuToAssign.push(dashboardMenu);
    if (profileMenu) menuToAssign.push(profileMenu);

    // 获取内容菜单
    const contentMenu = await prisma.menu.findFirst({
      where: { path: '/content' }
    });
    if (contentMenu) {
      console.log(`找到内容管理菜单: ${contentMenu.name}, ID: ${contentMenu.id}`);
      menuToAssign.push(contentMenu);
    } else {
      console.log('未找到内容管理菜单');
    }

    // 查找普通用户已有的菜单权限
    const existingMenus = await prisma.rolemenu.findMany({
      where: { roleId: userRole.id }
    });
    console.log(`普通用户角色已有 ${existingMenus.length} 个菜单权限`);

    const existingMenuIds = existingMenus.map(em => em.menuId);

    let menuAssignedCount = 0;
    for (const menu of menuToAssign) {
      if (existingMenuIds.includes(menu.id)) {
        console.log(`普通用户角色已有菜单 "${menu.name}" 的权限，跳过`);
      } else {
        try {
          await prisma.rolemenu.create({
            data: {
              roleId: userRole.id,
              menuId: menu.id,
              createdAt: new Date()
            }
          });
          console.log(`为普通用户角色分配菜单 "${menu.name}" 成功`);
          menuAssignedCount++;
        } catch (err) {
          console.error(`为普通用户角色分配菜单 "${menu.name}" 失败:`, err);
        }
      }
    }

    console.log(`共为普通用户角色分配了 ${menuAssignedCount} 个菜单`);
  } catch (err) {
    console.error('处理过程中出错:', err);
  }

  console.log('处理完成');
}

main()
  .catch((e) => {
    console.error('处理用户角色总体出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 