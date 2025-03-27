This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

npx prisma generate
   
npx prisma db push

npx prisma --datasource-provider mysql

npx prisma studio
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# 认证系统说明

本系统实现了如下认证功能：

1. 账号密码登录 - 用户只能通过用户名+密码登录系统
2. 忘记密码 - 通过邮箱或手机验证码重置密码
3. 用户注册 - 新用户需要使用用户名、邮箱（可选）和手机号（可选）注册系统

## 数据库迁移

由于修改了数据库模型，需要执行以下命令生成迁移：

```bash
# 如果是全新安装（没有现有用户数据）
npx prisma db push

# 如果有现有数据（为已存在的用户分配用户名）
npx prisma migrate dev --name add_username_and_phone
```

## API接口

### 用户注册

```
POST /api/auth/register
{
  "username": "用户名", // 必填
  "password": "密码", // 必填
  "email": "example@example.com", // 可选
  "phone": "13800138000", // 可选
  "name": "真实姓名" // 可选
}
```

### 账号密码登录

```
POST /api/auth/login
{
  "username": "用户名",
  "password": "密码"
}
```

### 发送重置密码邮箱验证码

```
POST /api/auth/forgot-password/email
{
  "email": "example@example.com"
}
```

### 发送重置密码短信验证码

```
POST /api/auth/forgot-password/phone
{
  "phone": "13800138000"
}
```

### 重置密码

```
POST /api/auth/reset-password
{
  "email": "example@example.com", // 邮箱和手机号二选一
  "phone": "13800138000",
  "code": "123456",
  "newPassword": "newpassword123"
}
```

## 注意事项

1. 验证码有效期为10分钟
2. 同一邮箱或手机号1分钟内只能请求一次验证码
3. 验证码6位数字
4. 验证码使用一次后失效
5. 现有用户需要分配唯一用户名
6. 用户名、邮箱和手机号都是唯一的，不能重复注册

## TypeScript类型问题解决

由于数据库模型已经更新，会出现类型不匹配的问题。执行以下命令重新生成Prisma客户端来解决这个问题：

```bash
npx prisma generate
```

# 新功能: Redis存储与访问统计

## Redis集成

项目已经集成了Redis，用于以下功能：

1. 存储登录令牌 - 刷新令牌现在存储在Redis中，而不是数据库中，提高了性能和安全性
2. 访问统计 - 记录总访问量和每日访问量

## 访问统计API

可以通过以下API访问站点访问统计数据：

- `GET /stats/total` - 获取总访问量
- `GET /stats/today` - 获取今日访问量
- `GET /stats/daily/:date` - 获取指定日期的访问量（需要登录权限，日期格式：YYYY-MM-DD）
- `GET /stats/recent/:days` - 获取最近n天的访问量（需要登录权限）

## 设置Redis

确保在开发环境中已安装并运行Redis服务器。配置环境变量：

```bash
# .env 文件
REDIS_URL=redis://localhost:6379
```

对于生产环境，请设置实际的Redis服务器URL。
