import { createClient } from 'redis';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

// 加载环境变量
dotenv.config();

const TOKEN_PREFIX = 'token:refresh:';

// 创建Redis客户端
const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// 创建命令行接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 连接Redis
client.on('error', (err) => console.error('Redis错误:', err));
client.connect().then(() => {
  console.log('已连接到Redis服务器');
  showMenu();
}).catch(err => {
  console.error('Redis连接失败:', err);
  process.exit(1);
});

// 显示菜单
function showMenu() {
  console.log('\n--- Redis Token 管理工具 ---');
  console.log('1. 查看所有Token');
  console.log('2. 查询特定用户Token');
  console.log('3. 查询特定Token值');
  console.log('4. 删除特定用户Token');
  console.log('5. 删除所有Token');
  console.log('0. 退出程序');
  
  rl.question('\n请选择操作 [0-5]: ', async (choice) => {
    switch (choice) {
      case '1':
        await getAllTokens();
        break;
      case '2':
        rl.question('请输入用户ID: ', async (userId) => {
          await getUserToken(parseInt(userId, 10));
          showMenu();
        });
        break;
      case '3':
        rl.question('请输入Token值: ', async (token) => {
          await getTokenInfo(token);
          showMenu();
        });
        break;
      case '4':
        rl.question('请输入用户ID: ', async (userId) => {
          await deleteUserToken(parseInt(userId, 10));
          showMenu();
        });
        break;
      case '5':
        rl.question('确定要删除所有Token吗? (y/n): ', async (confirm) => {
          if (confirm.toLowerCase() === 'y') {
            await deleteAllTokens();
          }
          showMenu();
        });
        break;
      case '0':
        console.log('正在退出程序...');
        await client.disconnect();
        rl.close();
        break;
      default:
        console.log('无效选择，请重新输入');
        showMenu();
    }
  });
}

// 获取所有Token
async function getAllTokens() {
  try {
    const keys = await client.keys(`${TOKEN_PREFIX}*`);
    console.log(`\n共找到 ${keys.length} 个Token:`);
    
    for (const key of keys) {
      const value = await client.get(key);
      const userId = key.replace(TOKEN_PREFIX, '');
      console.log(`用户ID: ${userId}, Token: ${value?.substring(0, 20)}...`);
    }
    
    showMenu();
  } catch (error) {
    console.error('获取所有Token失败:', error);
    showMenu();
  }
}

// 获取特定用户Token
async function getUserToken(userId: number) {
  try {
    const key = `${TOKEN_PREFIX}${userId}`;
    const token = await client.get(key);
    
    if (token) {
      console.log(`\n用户 ${userId} 的Token:`);
      console.log(`Key: ${key}`);
      console.log(`Value: ${token}`);
    } else {
      console.log(`\n未找到用户 ${userId} 的Token`);
    }
  } catch (error) {
    console.error(`获取用户 ${userId} 的Token失败:`, error);
  }
}

// 获取特定Token的信息
async function getTokenInfo(token: string) {
  try {
    const userId = await client.get(token);
    
    if (userId) {
      console.log(`\nToken信息:`);
      console.log(`Token: ${token.substring(0, 20)}...`);
      console.log(`对应用户ID: ${userId}`);
      
      // 验证反向映射
      const reverseKey = `${TOKEN_PREFIX}${userId}`;
      const reverseToken = await client.get(reverseKey);
      
      if (reverseToken === token) {
        console.log('正向反向映射一致✓');
      } else {
        console.log('警告: 反向映射不一致!');
        console.log(`用户${userId}的Token: ${reverseToken?.substring(0, 20)}...`);
      }
    } else {
      console.log(`\n未找到该Token的信息`);
    }
  } catch (error) {
    console.error('获取Token信息失败:', error);
  }
}

// 删除特定用户Token
async function deleteUserToken(userId: number) {
  try {
    const key = `${TOKEN_PREFIX}${userId}`;
    const token = await client.get(key);
    
    if (token) {
      // 删除反向映射
      await client.del(token);
      // 删除用户Token
      await client.del(key);
      console.log(`\n已删除用户 ${userId} 的Token`);
    } else {
      console.log(`\n未找到用户 ${userId} 的Token`);
    }
  } catch (error) {
    console.error(`删除用户 ${userId} 的Token失败:`, error);
  }
}

// 删除所有Token
async function deleteAllTokens() {
  try {
    const keys = await client.keys(`${TOKEN_PREFIX}*`);
    
    if (keys.length > 0) {
      // 获取所有Token值
      const tokenValues = [];
      for (const key of keys) {
        const token = await client.get(key);
        if (token) tokenValues.push(token);
      }
      
      // 删除所有Token反向映射
      for (const token of tokenValues) {
        await client.del(token);
      }
      
      // 删除所有Token键
      for (const key of keys) {
        await client.del(key);
      }
      
      console.log(`\n已删除所有${keys.length}个Token`);
    } else {
      console.log('\n没有找到任何Token');
    }
  } catch (error) {
    console.error('删除所有Token失败:', error);
  }
} 