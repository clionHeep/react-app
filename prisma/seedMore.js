/*
* 添加更多假数据的种子脚本
* 
* 运行方法：
* 1. 确保已安装依赖: npm install
* 2. 执行脚本: node prisma/seedMore.js
* 
* 注意: 
* - 此脚本假定数据库已经初始化，且已通过原始的seed.js脚本添加了基础数据
* - 特别是，脚本依赖于现有的"普通用户"角色存在
*/

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('开始添加更多假数据...');
  
  // 生成加密密码 - 所有用户使用同一个密码 '123456'
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('123456', salt);
  
  // 预定义需要创建的用户
  const userDataList = [
    {
      username: 'zhang_san',
      email: 'zhangsan@example.com',
      phone: '13911112222',
      password: hashedPassword,
      name: '张三',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      gender: '男',
      birthday: new Date('1990-01-15'),
      address: '北京市海淀区',
      bio: '热爱技术的开发者',
      status: 'ACTIVE',
      roles: 'user',
    },
    {
      username: 'li_si',
      email: 'lisi@example.com',
      phone: '13922223333',
      password: hashedPassword,
      name: '李四',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      gender: '男',
      birthday: new Date('1992-05-20'),
      address: '上海市浦东新区',
      bio: '资深产品经理',
      status: 'ACTIVE',
      roles: 'user',
    },
    {
      username: 'wang_wu',
      email: 'wangwu@example.com',
      phone: '13933334444',
      password: hashedPassword,
      name: '王五',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      gender: '男',
      birthday: new Date('1988-08-08'),
      address: '广州市天河区',
      bio: '喜欢旅游的设计师',
      status: 'ACTIVE',
      roles: 'user',
    },
    {
      username: 'zhao_liu',
      email: 'zhaoliu@example.com',
      phone: '13944445555',
      password: hashedPassword,
      name: '赵六',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      gender: '女',
      birthday: new Date('1995-12-25'),
      address: '深圳市南山区',
      bio: '喜欢音乐的营销专家',
      status: 'ACTIVE',
      roles: 'user',
    },
    {
      username: 'test_inactive',
      email: 'inactive@example.com',
      phone: '13900001111',
      password: hashedPassword,
      name: '未激活用户',
      avatar: 'https://randomuser.me/api/portraits/men/9.jpg',
      gender: '男',
      birthday: new Date('1990-01-01'),
      address: '重庆市渝中区',
      bio: '这是一个未激活的测试账号',
      status: 'INACTIVE',
      roles: 'user',
    },
    {
      username: 'test_locked',
      email: 'locked@example.com',
      phone: '13900002222',
      password: hashedPassword,
      name: '锁定用户',
      avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
      gender: '男',
      birthday: new Date('1991-02-02'),
      address: '西安市雁塔区',
      bio: '这是一个被锁定的测试账号',
      status: 'LOCKED',
      roles: 'user',
    },
  ];

  // 创建用户 - 验证用户是否已存在
  const users = [];
  for (const userData of userDataList) {
    // 检查用户是否已存在
    const existingUser = await prisma.user.findFirst({
      where: { username: userData.username },
    });

    if (existingUser) {
      console.log(`用户 ${userData.username} 已存在，跳过创建`);
      users.push(existingUser);
    } else {
      const newUser = await prisma.user.create({
        data: {
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(`用户 ${userData.username} 创建成功`);
      users.push(newUser);
    }
  }

  console.log('用户处理完成');

  // 获取用户角色
  const userRole = await prisma.role.findFirst({
    where: { name: '普通用户' },
  });

  if (!userRole) {
    console.error('未找到普通用户角色，无法分配角色');
  } else {
    // 为新用户分配角色
    for (const user of users) {
      // 检查用户角色是否已分配
      const existingUserRole = await prisma.userrole.findFirst({
        where: {
          userId: user.id,
          roleId: userRole.id,
        },
      });

      if (existingUserRole) {
        console.log(`用户 ${user.username} 已分配角色，跳过分配`);
      } else {
        await prisma.userrole.create({
          data: {
            userId: user.id,
            roleId: userRole.id,
            createdAt: new Date(),
          },
        });
        console.log(`用户 ${user.username} 角色分配成功`);
      }
    }
    console.log('用户角色分配处理完成');
  }

  // 创建更多角色，如果不存在的话
  const roleNames = ['编辑', '审核员', '访客'];
  const roleDescriptions = ['内容编辑者', '内容审核者', '系统访客'];
  const roles = [];

  for (let i = 0; i < roleNames.length; i++) {
    const existingRole = await prisma.role.findFirst({
      where: { name: roleNames[i] },
    });

    if (existingRole) {
      console.log(`角色 ${roleNames[i]} 已存在，跳过创建`);
      roles.push(existingRole);
    } else {
      const newRole = await prisma.role.create({
        data: {
          name: roleNames[i],
          description: roleDescriptions[i],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(`角色 ${roleNames[i]} 创建成功`);
      roles.push(newRole);
    }
  }

  const [editorRole, reviewerRole, guestRole] = roles;
  console.log('角色处理完成');

  // 创建更多权限，如果不存在的话
  const permissionData = [
    { code: 'content:view', name: '查看内容', description: '允许查看内容' },
    { code: 'content:create', name: '创建内容', description: '允许创建内容' },
    { code: 'content:edit', name: '编辑内容', description: '允许编辑内容' },
    { code: 'content:delete', name: '删除内容', description: '允许删除内容' },
    { code: 'content:publish', name: '发布内容', description: '允许发布内容' },
  ];

  const contentPermissions = [];
  for (const perm of permissionData) {
    const existingPermission = await prisma.permission.findFirst({
      where: { code: perm.code },
    });

    if (existingPermission) {
      console.log(`权限 ${perm.code} 已存在，跳过创建`);
      contentPermissions.push(existingPermission);
    } else {
      const newPermission = await prisma.permission.create({
        data: {
          ...perm,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(`权限 ${perm.code} 创建成功`);
      contentPermissions.push(newPermission);
    }
  }
  console.log('权限处理完成');

  // 为角色分配权限，如果不存在的话
  const rolePermissionsData = [
    // 编辑角色权限
    { roleId: editorRole.id, permissionId: contentPermissions[0].id }, // view
    { roleId: editorRole.id, permissionId: contentPermissions[1].id }, // create
    { roleId: editorRole.id, permissionId: contentPermissions[2].id }, // edit
    // 审核员角色权限
    { roleId: reviewerRole.id, permissionId: contentPermissions[0].id }, // view
    { roleId: reviewerRole.id, permissionId: contentPermissions[3].id }, // delete
    { roleId: reviewerRole.id, permissionId: contentPermissions[4].id }, // publish
    // 访客角色权限
    { roleId: guestRole.id, permissionId: contentPermissions[0].id }, // view
  ];

  for (const rpData of rolePermissionsData) {
    const existingRolePermission = await prisma.rolepermission.findFirst({
      where: {
        roleId: rpData.roleId,
        permissionId: rpData.permissionId,
      },
    });

    if (existingRolePermission) {
      console.log(`角色权限关系已存在，跳过创建`);
    } else {
      await prisma.rolepermission.create({
        data: {
          ...rpData,
          createdAt: new Date(),
        },
      });
      console.log(`角色权限关系创建成功`);
    }
  }

  console.log('角色权限关系处理完成');

  // 添加一些文章数据
  const posts = [
    {
      title: '如何提高工作效率',
      content: '本文将分享10个实用技巧，帮助你在日常工作中提高效率...(这里是详细内容)',
      published: true,
      authorId: users[0].id,
    },
    {
      title: '旅行的意义',
      content: '旅行不仅仅是为了看风景，更是一种生活态度...(这里是详细内容)',
      published: true,
      authorId: users[1].id,
    },
    {
      title: '健康饮食指南',
      content: '均衡的饮食对健康至关重要，本文将介绍一些健康饮食的基本原则...(这里是详细内容)',
      published: true,
      authorId: users[2].id,
    },
    {
      title: '如何学习一门新技能',
      content: '学习新技能需要方法和坚持，这里分享我的经验...(这里是详细内容)',
      published: true,
      authorId: users[3].id,
    },
    {
      title: '读书笔记：《思考，快与慢》',
      content: '这本书讲述了人类思维的两种模式，以下是我的读书心得...(这里是详细内容)',
      published: false,
      authorId: users[0].id,
    },
    {
      title: '环保从生活小事做起',
      content: '保护环境人人有责，我们可以从日常生活的小事做起...(这里是详细内容)',
      published: false,
      authorId: users[1].id,
    },
  ];

  for (const post of posts) {
    // 检查文章是否已存在
    const existingPost = await prisma.post.findFirst({
      where: { 
        title: post.title,
        authorId: post.authorId
      },
    });

    if (existingPost) {
      console.log(`文章 "${post.title}" 已存在，跳过创建`);
    } else {
      await prisma.post.create({
        data: {
          id: randomUUID(),
          title: post.title,
          content: post.content,
          published: post.published,
          authorId: post.authorId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(`文章 "${post.title}" 创建成功`);
    }
  }

  console.log('文章处理完成');

  // 添加一些验证码
  const verificationCodes = [
    {
      type: 'reset_password_email',
      target: 'zhangsan@example.com',
      code: '123456',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10分钟后过期
      used: false,
    },
    {
      type: 'reset_password_phone',
      target: '13911112222',
      code: '654321',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      used: false,
    },
    {
      type: 'reset_password_email',
      target: 'lisi@example.com',
      code: '789012',
      expiresAt: new Date(Date.now() - 30 * 60 * 1000), // 已过期
      used: false,
    },
    {
      type: 'reset_password_phone',
      target: '13922223333',
      code: '345678',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      used: true, // 已使用
    },
  ];

  for (const code of verificationCodes) {
    // 检查验证码是否已存在
    const existingCode = await prisma.verificationcode.findFirst({
      where: {
        type: code.type,
        target: code.target,
        code: code.code,
      },
    });

    if (existingCode) {
      console.log(`验证码 ${code.code} 已存在，跳过创建`);
    } else {
      await prisma.verificationcode.create({
        data: {
          type: code.type,
          target: code.target,
          code: code.code,
          expiresAt: code.expiresAt,
          used: code.used,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(`验证码 ${code.code} 创建成功`);
    }
  }

  console.log('验证码处理完成');

  // 以下是添加额外菜单的代码
  const menuData = [
    {
      name: '内容管理',
      path: '/content',
      component: null,
      icon: 'file-text',
      sort: 3,
      hidden: false,
      parentId: null,
    },
    {
      name: '文章列表',
      path: '/content/posts',
      component: 'content/posts/index',
      icon: 'file',
      sort: 1,
      hidden: false,
      parentId: null, // 这里先设置为null，后面会更新为内容管理的ID
    },
    {
      name: '草稿箱',
      path: '/content/drafts',
      component: 'content/drafts/index',
      icon: 'edit',
      sort: 2,
      hidden: false,
      parentId: null, // 这里先设置为null，后面会更新为内容管理的ID
    },
    {
      name: '数据统计',
      path: '/statistics',
      component: 'statistics/index',
      icon: 'bar-chart',
      sort: 4,
      hidden: false,
      parentId: null,
    },
  ];

  // 先创建父级菜单
  let contentMenu = null;
  for (const menu of menuData) {
    if (menu.path === '/content') {
      // 检查菜单是否已存在
      const existingMenu = await prisma.menu.findFirst({
        where: { path: menu.path },
      });

      if (existingMenu) {
        console.log(`菜单 "${menu.name}" 已存在，跳过创建`);
        contentMenu = existingMenu;
      } else {
        const newMenu = await prisma.menu.create({
          data: {
            name: menu.name,
            path: menu.path,
            component: menu.component,
            icon: menu.icon,
            sort: menu.sort,
            hidden: menu.hidden,
            parentId: menu.parentId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log(`菜单 "${menu.name}" 创建成功`);
        contentMenu = newMenu;
      }
      break;
    }
  }

  // 然后创建子菜单
  if (contentMenu) {
    for (const menu of menuData) {
      // 跳过已创建的内容管理菜单
      if (menu.path === '/content') continue;
      
      // 为文章列表和草稿箱设置父ID为内容管理的ID
      if (menu.path === '/content/posts' || menu.path === '/content/drafts') {
        menu.parentId = contentMenu.id;
      }

      // 检查菜单是否已存在
      const existingMenu = await prisma.menu.findFirst({
        where: { path: menu.path },
      });

      if (existingMenu) {
        console.log(`菜单 "${menu.name}" 已存在，跳过创建`);
      } else {
        await prisma.menu.create({
          data: {
            name: menu.name,
            path: menu.path,
            component: menu.component,
            icon: menu.icon,
            sort: menu.sort,
            hidden: menu.hidden,
            parentId: menu.parentId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log(`菜单 "${menu.name}" 创建成功`);
      }
    }
  }

  // 获取所有角色
  const allRoles = await prisma.role.findMany();

  // 获取所有菜单
  const allMenus = await prisma.menu.findMany();

  // 为角色分配菜单
  for (const role of allRoles) {
    // 管理员角色可以访问所有菜单
    if (role.name === '管理员') {
      for (const menu of allMenus) {
        // 检查角色菜单关系是否已存在
        const existingRoleMenu = await prisma.rolemenu.findFirst({
          where: {
            roleId: role.id,
            menuId: menu.id,
          },
        });

        if (existingRoleMenu) {
          console.log(`管理员角色已拥有菜单 "${menu.name}"，跳过分配`);
        } else {
          await prisma.rolemenu.create({
            data: {
              roleId: role.id,
              menuId: menu.id,
              createdAt: new Date(),
            },
          });
          console.log(`为管理员角色分配菜单 "${menu.name}" 成功`);
        }
      }
    }
    // 编辑角色可以访问内容管理相关菜单
    else if (role.name === '编辑') {
      const contentMenus = allMenus.filter(menu => 
        menu.path === '/content' || 
        menu.path === '/content/posts' || 
        menu.path === '/content/drafts'
      );

      for (const menu of contentMenus) {
        // 检查角色菜单关系是否已存在
        const existingRoleMenu = await prisma.rolemenu.findFirst({
          where: {
            roleId: role.id,
            menuId: menu.id,
          },
        });

        if (existingRoleMenu) {
          console.log(`编辑角色已拥有菜单 "${menu.name}"，跳过分配`);
        } else {
          await prisma.rolemenu.create({
            data: {
              roleId: role.id,
              menuId: menu.id,
              createdAt: new Date(),
            },
          });
          console.log(`为编辑角色分配菜单 "${menu.name}" 成功`);
        }
      }
    }
    // 审核员角色可以访问内容管理和统计菜单
    else if (role.name === '审核员') {
      const reviewerMenus = allMenus.filter(menu => 
        menu.path === '/content' || 
        menu.path === '/content/posts' || 
        menu.path === '/statistics'
      );

      for (const menu of reviewerMenus) {
        // 检查角色菜单关系是否已存在
        const existingRoleMenu = await prisma.rolemenu.findFirst({
          where: {
            roleId: role.id,
            menuId: menu.id,
          },
        });

        if (existingRoleMenu) {
          console.log(`审核员角色已拥有菜单 "${menu.name}"，跳过分配`);
        } else {
          await prisma.rolemenu.create({
            data: {
              roleId: role.id,
              menuId: menu.id,
              createdAt: new Date(),
            },
          });
          console.log(`为审核员角色分配菜单 "${menu.name}" 成功`);
        }
      }
    }
  }

  console.log('菜单数据处理完成');

  // 添加刷新令牌
  const refreshTokens = [
    {
      userId: users[0].id,
      token: randomUUID(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
    },
    {
      userId: users[1].id,
      token: randomUUID(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      userId: users[2].id,
      token: randomUUID(),
      expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 已过期的令牌
    },
  ];

  for (const tokenData of refreshTokens) {
    // 限制每个用户只有一个刷新令牌，如果已存在则更新
    const existingToken = await prisma.refreshtoken.findFirst({
      where: { userId: tokenData.userId },
    });

    if (existingToken) {
      await prisma.refreshtoken.update({
        where: { id: existingToken.id },
        data: {
          token: tokenData.token,
          expiresAt: tokenData.expiresAt,
          updatedAt: new Date(),
        },
      });
      console.log(`用户 ID ${tokenData.userId} 的刷新令牌已更新`);
    } else {
      await prisma.refreshtoken.create({
        data: {
          token: tokenData.token,
          userId: tokenData.userId,
          expiresAt: tokenData.expiresAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(`用户 ID ${tokenData.userId} 的刷新令牌创建成功`);
    }
  }

  console.log('刷新令牌处理完成');

  console.log('所有假数据添加完成!');
}

main()
  .catch((e) => {
    console.error('添加假数据出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 