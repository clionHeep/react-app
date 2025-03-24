/*
* 为管理员角色分配所有菜单的脚本
* 
* 运行方法：
* 1. 确保已安装依赖: npm install
* 2. 执行脚本: node prisma/assignAdminMenus.js
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('开始为管理员分配所有菜单...');

    // 查找管理员角色
    let adminRole = await prisma.role.findFirst({
      where: { name: '管理员' }
    });

    if (!adminRole) {
      // 创建管理员角色
      adminRole = await prisma.role.create({
        data: {
          name: '管理员',
          description: '系统管理员，拥有所有权限',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      console.log(`管理员角色不存在，已创建新角色 (ID: ${adminRole.id})`);
    } else {
      console.log(`找到管理员角色 (ID: ${adminRole.id})`);
    }

    // 获取所有菜单
    const allMenus = await prisma.menu.findMany();
    console.log(`系统中共有 ${allMenus.length} 个菜单`);

    // 获取管理员当前的菜单权限
    const existingMenus = await prisma.rolemenu.findMany({
      where: { roleId: adminRole.id }
    });
    const existingMenuIds = existingMenus.map(em => em.menuId);
    
    console.log(`管理员当前已有 ${existingMenuIds.length} 个菜单权限`);

    // 为管理员分配所有菜单
    let assignedCount = 0;
    for (const menu of allMenus) {
      if (existingMenuIds.includes(menu.id)) {
        console.log(`管理员已有菜单 "${menu.name}" 的权限，跳过`);
        continue;
      }
      
      await prisma.rolemenu.create({
        data: {
          roleId: adminRole.id,
          menuId: menu.id,
          createdAt: new Date(),
        }
      });
      console.log(`为管理员分配菜单 "${menu.name}" 成功`);
      assignedCount++;
    }

    console.log(`共为管理员分配了 ${assignedCount} 个新菜单权限`);
    console.log('管理员菜单分配完成');
  } catch (err) {
    console.error('处理出错:', err);
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