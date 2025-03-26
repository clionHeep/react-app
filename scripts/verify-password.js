import bcrypt from 'bcrypt';

async function verifyPassword() {
  const storedHash = '$2a$10$u8Zg8UkBRzxvBMUUxL1Nz.ZUKdY9XwPUB2ZnFGbVk.cF3qpDksqz.';
  const plainPassword = 'admin123';
  
  console.log('存储的密码哈希值:', storedHash);
  console.log('尝试验证的明文密码:', plainPassword);
  
  try {
    const isMatch = await bcrypt.compare(plainPassword, storedHash);
    console.log('密码验证结果:', isMatch ? '匹配成功' : '匹配失败');
    
    if (!isMatch) {
      // 重新生成哈希值
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(plainPassword, salt);
      console.log('重新生成的哈希值:', newHash);
      
      // 验证新生成的哈希值
      const checkNewHash = await bcrypt.compare(plainPassword, newHash);
      console.log('新哈希值验证结果:', checkNewHash ? '匹配成功' : '匹配失败');
    }
  } catch (error) {
    console.error('验证过程中出错:', error);
  }
}

verifyPassword()
  .then(() => console.log('验证完成'))
  .catch(err => console.error('验证失败:', err)); 