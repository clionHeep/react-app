-- 添加超级管理员角色和用户的SQL脚本
-- 此脚本适用于直接在MySQL中执行

-- 添加管理员角色（如果不存在）
INSERT INTO `role` (`name`, `description`, `createdAt`, `updatedAt`) 
SELECT '管理员', '系统管理员，拥有所有权限', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `role` WHERE `name` = '管理员');

-- 使用变量存储角色ID
SET @admin_role_id = (SELECT `id` FROM `role` WHERE `name` = '管理员' LIMIT 1);

-- 添加超级管理员用户 'admin'（如果不存在）
-- 密码为: admin123 (已哈希)
INSERT INTO `user` (`username`, `email`, `password`, `name`, `avatar`, `gender`, `status`, `roles`, `createdAt`, `updatedAt`) 
SELECT 'admin', 'admin@example.com', '$2b$10$uojaXW.Lb679L3qvYBQ5jODr8ZCGpGOHxpT.rSgA9HmBJpzP6Mq8G', '超级管理员', 'https://randomuser.me/api/portraits/men/1.jpg', '男', 'ACTIVE', 'admin', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE `username` = 'admin');

-- 使用变量存储admin用户ID
SET @admin_user_id = (SELECT `id` FROM `user` WHERE `username` = 'admin' LIMIT 1);

-- 为admin用户分配管理员角色（如果未分配）
INSERT INTO `userrole` (`userId`, `roleId`, `createdAt`) 
SELECT @admin_user_id, @admin_role_id, NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `userrole` 
  WHERE `userId` = @admin_user_id AND `roleId` = @admin_role_id
);

-- 添加另一个超级管理员用户 'root'（如果不存在）
-- 密码为: root123 (已哈希)
INSERT INTO `user` (`username`, `email`, `password`, `name`, `avatar`, `gender`, `status`, `roles`, `createdAt`, `updatedAt`) 
SELECT 'root', 'root@example.com', '$2b$10$UGjCKdpXh8h5HkDiO2wjKeb2vH6YzXfJqx.jhMxRFJB4wnp8EJ9w.', '系统管理员', 'https://randomuser.me/api/portraits/men/2.jpg', '男', 'ACTIVE', 'admin', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE `username` = 'root');

-- 使用变量存储root用户ID
SET @root_user_id = (SELECT `id` FROM `user` WHERE `username` = 'root' LIMIT 1);

-- 为root用户分配管理员角色（如果未分配）
INSERT INTO `userrole` (`userId`, `roleId`, `createdAt`) 
SELECT @root_user_id, @admin_role_id, NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `userrole` 
  WHERE `userId` = @root_user_id AND `roleId` = @admin_role_id
); 