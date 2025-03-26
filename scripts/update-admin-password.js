import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function updateAdminPassword() {
  try {
    // 生成新的密码哈希
    const plainPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(plainPassword, salt);
    
    console.log('新哈希值:', newHash);
    
    // 更新数据库中admin用户的密码
    const updatedUser = await prisma.user.update({
      where: { username: 'admin' },
      data: {
        password: newHash,
        updatedAt: new Date()
      }
    });
    
    console.log('管理员密码已更新，用户ID:', updatedUser.id);
    
    // 验证新密码
    const isMatch = await bcrypt.compare(plainPassword, updatedUser.password);
    console.log('新密码验证结果:', isMatch ? '匹配成功' : '匹配失败');
    
  } catch (error) {
    console.error('更新密码出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword()
  .then(() => console.log('密码更新完成'))
  .catch(err => console.error('更新失败:', err)); 