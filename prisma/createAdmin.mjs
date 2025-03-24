/*
* 创建超级管理员用户的脚本
* 
* 运行方法：
* 1. 确保已安装依赖: npm install bcrypt
* 2. 执行脚本: node prisma/createAdmin.mjs
*/

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('开始创建超级管理员用户...');

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

    // 检查超级管理员用户是否已存在
    let adminUser = await prisma.user.findFirst({
      where: { username: 'admin' }
    });

    if (adminUser) {
      console.log(`超级管理员用户已存在 (ID: ${adminUser.id}, 用户名: ${adminUser.username})`);
    } else {
      // 创建超级管理员用户
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      adminUser = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@example.com',
          password: hashedPassword,
          name: '超级管理员',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          gender: '男',
          status: 'ACTIVE',
          roles: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      console.log(`创建超级管理员用户成功 (ID: ${adminUser.id}, 用户名: ${adminUser.username})`);
    }

    // 检查用户是否已分配管理员角色
    const existingUserRole = await prisma.userrole.findFirst({
      where: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    });

    if (existingUserRole) {
      console.log(`超级管理员用户已分配管理员角色，无需重复分配`);
    } else {
      // 为超级管理员用户分配管理员角色
      await prisma.userrole.create({
        data: {
          userId: adminUser.id,
          roleId: adminRole.id,
          createdAt: new Date()
        }
      });
      console.log(`为超级管理员用户分配管理员角色成功`);
    }

    // 创建另一个管理员用户 root
    let rootUser = await prisma.user.findFirst({
      where: { username: 'root' }
    });

    if (rootUser) {
      console.log(`root用户已存在 (ID: ${rootUser.id}, 用户名: ${rootUser.username})`);
    } else {
      // 创建root用户
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('root123', salt);

      rootUser = await prisma.user.create({
        data: {
          username: 'root',
          email: 'root@example.com',
          password: hashedPassword,
          name: '系统管理员',
          avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
          gender: '男',
          status: 'ACTIVE',
          roles: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      console.log(`创建root用户成功 (ID: ${rootUser.id}, 用户名: ${rootUser.username})`);

      // 为root用户分配管理员角色
      await prisma.userrole.create({
        data: {
          userId: rootUser.id,
          roleId: adminRole.id,
          createdAt: new Date()
        }
      });
      console.log(`为root用户分配管理员角色成功`);
    }

    console.log('超级管理员用户创建完成！');
    console.log('登录凭据:');
    console.log('用户名: admin');
    console.log('密码: admin123');
    console.log('或');
    console.log('用户名: root');
    console.log('密码: root123');

  } catch (err) {
    console.error('创建超级管理员用户出错:', err);
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