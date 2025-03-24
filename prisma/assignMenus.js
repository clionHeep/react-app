/*
* 为各个角色分配菜单权限的脚本
* 
* 运行方法：
* 1. 确保已安装依赖: npm install
* 2. 执行脚本: node prisma/assignMenus.js
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('开始为各角色分配菜单...');

    // 获取所有角色
    const roles = await prisma.role.findMany();
    console.log(`找到 ${roles.length} 个角色: ${roles.map(r => r.name).join(', ')}`);

    // 获取所有菜单
    const allMenus = await prisma.menu.findMany();
    console.log(`找到 ${allMenus.length} 个菜单:`);
    for (const menu of allMenus) {
      const parent = menu.parentId ? allMenus.find(m => m.id === menu.parentId) : null;
      console.log(`  - ${menu.name} (ID: ${menu.id}, 路径: ${menu.path}${parent ? ', 父菜单: ' + parent.name : ''})`);
    }

    // 为每个角色设置可访问的菜单
    for (const role of roles) {
      console.log(`\n处理角色: ${role.name} (ID: ${role.id})`);
      
      let menusToAssign = [];
      
      // 管理员: 所有菜单
      if (role.name === '管理员') {
        menusToAssign = [...allMenus];
        console.log(`  管理员角色可访问所有 ${menusToAssign.length} 个菜单`);
      }
      // 普通用户: 仪表盘、个人中心
      else if (role.name === '普通用户' || role.name === '用户') {
        menusToAssign = allMenus.filter(menu => 
          menu.path === '/dashboard' || 
          menu.path === '/profile'
        );
        console.log(`  普通用户角色将访问 ${menusToAssign.length} 个菜单: ${menusToAssign.map(m => m.name).join(', ')}`);
      }
      // 编辑: 仪表盘、个人中心、内容管理及其子菜单
      else if (role.name === '编辑') {
        const contentMenuIds = [];
        const contentMenu = allMenus.find(menu => menu.path === '/content');
        if (contentMenu) {
          contentMenuIds.push(contentMenu.id);
          // 添加内容管理的子菜单
          allMenus.forEach(menu => {
            if (menu.parentId === contentMenu.id) {
              contentMenuIds.push(menu.id);
            }
          });
        }
        
        menusToAssign = allMenus.filter(menu => 
          menu.path === '/dashboard' || 
          menu.path === '/profile' ||
          contentMenuIds.includes(menu.id)
        );
        console.log(`  编辑角色将访问 ${menusToAssign.length} 个菜单: ${menusToAssign.map(m => m.name).join(', ')}`);
      }
      // 审核员: 仪表盘、个人中心、内容管理(部分子菜单)、数据统计
      else if (role.name === '审核员') {
        const contentMenu = allMenus.find(menu => menu.path === '/content');
        const contentMenuIds = contentMenu ? [contentMenu.id] : [];
        
        // 添加内容管理的部分子菜单 (只添加文章列表，不添加草稿箱)
        if (contentMenu) {
          allMenus.forEach(menu => {
            if (menu.parentId === contentMenu.id && menu.path === '/content/posts') {
              contentMenuIds.push(menu.id);
            }
          });
        }
        
        menusToAssign = allMenus.filter(menu => 
          menu.path === '/dashboard' || 
          menu.path === '/profile' ||
          contentMenuIds.includes(menu.id) ||
          menu.path === '/statistics'
        );
        console.log(`  审核员角色将访问 ${menusToAssign.length} 个菜单: ${menusToAssign.map(m => m.name).join(', ')}`);
      }
      // 访客: 仪表盘、个人中心
      else if (role.name === '访客') {
        menusToAssign = allMenus.filter(menu => 
          menu.path === '/dashboard' || 
          menu.path === '/profile'
        );
        console.log(`  访客角色将访问 ${menusToAssign.length} 个菜单: ${menusToAssign.map(m => m.name).join(', ')}`);
      }
      
      // 获取角色当前的菜单权限
      const existingMenus = await prisma.rolemenu.findMany({
        where: { roleId: role.id }
      });
      const existingMenuIds = existingMenus.map(em => em.menuId);
      
      console.log(`  角色当前已有 ${existingMenuIds.length} 个菜单权限`);
      
      // 分配新菜单权限
      let assignedCount = 0;
      for (const menu of menusToAssign) {
        if (existingMenuIds.includes(menu.id)) {
          console.log(`  已有菜单权限: ${menu.name}`);
          continue;
        }
        
        try {
          await prisma.rolemenu.create({
            data: {
              roleId: role.id,
              menuId: menu.id,
              createdAt: new Date(),
            }
          });
          console.log(`  已分配菜单: ${menu.name}`);
          assignedCount++;
        } catch (err) {
          console.error(`  分配菜单失败 ${menu.name}:`, err);
        }
      }
      
      console.log(`  为角色 ${role.name} 分配了 ${assignedCount} 个新菜单权限`);
    }

    console.log('\n所有角色菜单权限分配完成');
  } catch (err) {
    console.error('处理过程中出错:', err);
  }
}

main()
  .catch((e) => {
    console.error('菜单分配出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 