import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('查看所有菜单...');
  
  const menus = await prisma.menu.findMany({
    orderBy: { id: 'asc' }
  });
  
  console.log(`共找到 ${menus.length} 个菜单:`);
  for (const menu of menus) {
    const parent = menu.parentId ? 
      await prisma.menu.findUnique({ where: { id: menu.parentId } }) : 
      null;
    
    console.log(`- ID: ${menu.id}, 名称: ${menu.name}, 路径: ${menu.path}${parent ? ', 父菜单: ' + parent.name : ''}`);
  }

  // 查看角色
  const roles = await prisma.role.findMany();
  console.log(`\n共找到 ${roles.length} 个角色:`);
  for (const role of roles) {
    console.log(`- ID: ${role.id}, 名称: ${role.name}`);

    // 获取该角色的菜单权限
    const roleMenus = await prisma.rolemenu.findMany({
      where: { roleId: role.id },
      include: { menu: true }
    });

    console.log(`  拥有 ${roleMenus.length} 个菜单权限:`);
    for (const rm of roleMenus) {
      console.log(`  - ${rm.menu.name} (ID: ${rm.menu.id}, 路径: ${rm.menu.path})`);
    }
  }
}

main()
  .catch((e) => {
    console.error('查看菜单出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 