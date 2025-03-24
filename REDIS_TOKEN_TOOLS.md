# Redis Token 工具使用指南

本项目提供了多种方式查询和管理Redis中存储的Token，下面是详细的使用说明。

## 1. 使用Redis命令行工具

如果您可以直接访问Redis服务器，可以使用Redis CLI：

```bash
# 连接到Redis服务器
redis-cli

# 查找特定用户的token
GET token:refresh:{用户ID}

# 查找所有token前缀的键
KEYS token:refresh:*

# 检查特定token是否存在
EXISTS {完整token字符串}

# 获取特定token对应的用户ID
GET {完整token字符串}
```

## 2. 使用API端点查询（管理员权限）

项目提供了一个管理员专用API端点来查询Redis中的Token：

```
GET /auth/tokens?userId={可选的用户ID}
```

请求这个端点需要：
1. 一个有效的JWT访问令牌（在Authorization头中）
2. 调用者必须具有"管理员"角色

示例请求：
```bash
# 查询所有Token
curl -H "Authorization: Bearer {你的JWT}" http://localhost:3000/auth/tokens

# 查询特定用户的Token
curl -H "Authorization: Bearer {你的JWT}" http://localhost:3000/auth/tokens?userId=1
```

响应示例：
```json
{
  "total": 5,
  "tokens": [
    {
      "userId": 1,
      "key": "token:refresh:1",
      "value": "7a1b2c3d4e5f..."
    },
    // 更多token...
  ]
}
```

## 3. 使用命令行工具

项目包含一个专用的命令行工具用于Token管理，位于 `src/scripts/redis-tokens.ts`：

```bash
# 安装依赖（如果尚未安装）
npm install

# 运行工具
npx ts-node src/scripts/redis-tokens.ts
```

该工具提供了一个交互式菜单，可以：
- 查看所有Token
- 查询特定用户的Token
- 查询特定Token的详细信息
- 删除特定用户的Token
- 删除所有Token

## 注意事项

1. Token存储结构
   - 用户ID到Token的映射: `token:refresh:{userId}` -> `{tokenValue}`
   - Token到用户ID的反向映射: `{tokenValue}` -> `{userId}`

2. 安全考虑
   - 确保只有管理员可以访问Token查询功能
   - 避免在生产环境中频繁使用KEYS命令（可能影响性能）
   - 使用命令行工具时注意保护好.env文件中的Redis连接信息

3. Token过期
   - 默认情况下，Token有效期为7天
   - 过期的Token会自动从Redis中移除（由Redis TTL机制处理） 