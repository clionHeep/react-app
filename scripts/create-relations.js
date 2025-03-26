import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('开始创建关联关系...');

    // 查找管理员角色
    const adminRole = await prisma.role.findFirst({
      where: { name: 'admin' }
    });

    if (!adminRole) {
      console.log('管理员角色不存在，正在创建...');
      await prisma.role.create({
        data: {
          name: 'admin',
          description: '系统管理员',
          updatedAt: new Date() // 添加必需的updatedAt字段
        }
      });
      console.log('管理员角色创建成功');
    }

    // 查找或创建常规用户角色
    const userRole = await prisma.role.findFirst({
      where: { name: 'user' }
    });

    if (!userRole) {
      console.log('用户角色不存在，正在创建...');
      await prisma.role.create({
        data: {
          name: 'user',
          description: '普通用户',
          updatedAt: new Date() // 添加必需的updatedAt字段
        }
      });
      console.log('用户角色创建成功');
    }

    // 获取所有菜单
    const menus = await prisma.menu.findMany();
    console.log(`找到 ${menus.length} 个菜单`);

    // 获取所有权限
    const permissions = await prisma.permission.findMany();
    console.log(`找到 ${permissions.length} 个权限`);

    // 为管理员角色关联所有菜单
    console.log('为管理员角色关联所有菜单...');
    for (const menu of menus) {
      try {
        await prisma.rolemenu.upsert({
          where: {
            roleId_menuId: {
              roleId: adminRole?.id || 1,
              menuId: menu.id,
            },
          },
          update: {},
          create: {
            roleId: adminRole?.id || 1,
            menuId: menu.id,
          },
        });
      } catch (e) {
        console.log(`菜单 ${menu.id} 关联失败:`, e);
      }
    }

    // 为管理员角色关联所有权限
    console.log('为管理员角色关联所有权限...');
    for (const permission of permissions) {
      try {
        await prisma.rolepermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: adminRole?.id || 1,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: adminRole?.id || 1,
            permissionId: permission.id,
          },
        });
      } catch (e) {
        console.log(`权限 ${permission.id} 关联失败:`, e);
      }
    }

    // 更新直接关系 (使用新的 Schema 关系)
    if (menus.length > 0 || permissions.length > 0) {
      console.log('更新直接关系...');
      try {
        const updateData = {};
        
        if (menus.length > 0) {
          updateData.menus = {
            connect: menus.map(menu => ({ id: menu.id }))
          };
        }
        
        if (permissions.length > 0) {
          updateData.permissions = {
            connect: permissions.map(permission => ({ id: permission.id }))
          };
        }
        
        await prisma.role.update({
          where: { id: adminRole?.id || 1 },
          data: updateData
        });
      } catch (e) {
        console.log('直接关系更新失败:', e);
      }
    }

    console.log('关联关系创建完成！');
  } catch (error) {
    console.error('创建关联关系失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => console.log('脚本执行完成'))
  .catch((e) => console.error('脚本执行失败:', e)); 