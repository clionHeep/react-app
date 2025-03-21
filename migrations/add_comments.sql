-- 为表添加注释
ALTER TABLE `user` COMMENT '用户信息表';
ALTER TABLE `menu` COMMENT '菜单信息表';
ALTER TABLE `role` COMMENT '角色信息表';
ALTER TABLE `permission` COMMENT '权限信息表';
ALTER TABLE `post` COMMENT '文章信息表';
ALTER TABLE `userrole` COMMENT '用户-角色关联表';
ALTER TABLE `rolemenu` COMMENT '角色-菜单关联表';
ALTER TABLE `rolepermission` COMMENT '角色-权限关联表';
ALTER TABLE `refreshtoken` COMMENT '刷新令牌表';

-- 为用户表字段添加注释
ALTER TABLE `user` MODIFY COLUMN `id` int NOT NULL AUTO_INCREMENT COMMENT '用户ID，自增主键';
ALTER TABLE `user` MODIFY COLUMN `email` varchar(191) NOT NULL COMMENT '用户邮箱，唯一';
ALTER TABLE `user` MODIFY COLUMN `password` varchar(191) NOT NULL COMMENT '用户密码，加密存储';
ALTER TABLE `user` MODIFY COLUMN `name` varchar(191) NULL COMMENT '用户名称，可为空';
ALTER TABLE `user` MODIFY COLUMN `avatar` varchar(191) NULL COMMENT '用户头像URL，可为空';
ALTER TABLE `user` MODIFY COLUMN `status` ENUM('ACTIVE', 'INACTIVE', 'LOCKED') NOT NULL DEFAULT 'ACTIVE' COMMENT '用户状态，默认为激活';
ALTER TABLE `user` MODIFY COLUMN `roles` varchar(191) NOT NULL DEFAULT 'user' COMMENT '备用角色字符串，用于向后兼容';
ALTER TABLE `user` MODIFY COLUMN `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间';
ALTER TABLE `user` MODIFY COLUMN `updatedAt` datetime(3) NOT NULL COMMENT '更新时间';

-- 为菜单表字段添加注释
ALTER TABLE `menu` MODIFY COLUMN `id` int NOT NULL AUTO_INCREMENT COMMENT '菜单ID，自增主键';
ALTER TABLE `menu` MODIFY COLUMN `name` varchar(191) NOT NULL COMMENT '菜单名称';
ALTER TABLE `menu` MODIFY COLUMN `path` varchar(191) NULL COMMENT '路由路径，可为空';
ALTER TABLE `menu` MODIFY COLUMN `component` varchar(191) NULL COMMENT '组件路径，可为空';
ALTER TABLE `menu` MODIFY COLUMN `redirect` varchar(191) NULL COMMENT '重定向地址，可为空';
ALTER TABLE `menu` MODIFY COLUMN `icon` varchar(191) NULL COMMENT '菜单图标，可为空';
ALTER TABLE `menu` MODIFY COLUMN `sort` int NOT NULL DEFAULT 0 COMMENT '排序序号，默认为0';
ALTER TABLE `menu` MODIFY COLUMN `hidden` boolean NOT NULL DEFAULT false COMMENT '是否隐藏，默认不隐藏';
ALTER TABLE `menu` MODIFY COLUMN `parentId` int NULL COMMENT '父菜单ID，可为空';
ALTER TABLE `menu` MODIFY COLUMN `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间';
ALTER TABLE `menu` MODIFY COLUMN `updatedAt` datetime(3) NOT NULL COMMENT '更新时间';

-- 为角色表字段添加注释
ALTER TABLE `role` MODIFY COLUMN `id` int NOT NULL AUTO_INCREMENT COMMENT '角色ID，自增主键';
ALTER TABLE `role` MODIFY COLUMN `name` varchar(191) NOT NULL COMMENT '角色名称，唯一';
ALTER TABLE `role` MODIFY COLUMN `description` varchar(191) NULL COMMENT '角色描述，可为空';
ALTER TABLE `role` MODIFY COLUMN `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间';
ALTER TABLE `role` MODIFY COLUMN `updatedAt` datetime(3) NOT NULL COMMENT '更新时间';

-- 为权限表字段添加注释
ALTER TABLE `permission` MODIFY COLUMN `id` int NOT NULL AUTO_INCREMENT COMMENT '权限ID，自增主键';
ALTER TABLE `permission` MODIFY COLUMN `code` varchar(191) NOT NULL COMMENT '权限编码，如 system:user:create，唯一';
ALTER TABLE `permission` MODIFY COLUMN `name` varchar(191) NOT NULL COMMENT '权限名称，如 创建用户';
ALTER TABLE `permission` MODIFY COLUMN `description` varchar(191) NULL COMMENT '权限描述，可为空';
ALTER TABLE `permission` MODIFY COLUMN `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间';
ALTER TABLE `permission` MODIFY COLUMN `updatedAt` datetime(3) NOT NULL COMMENT '更新时间';

-- 为用户-角色关联表字段添加注释
ALTER TABLE `userrole` MODIFY COLUMN `id` int NOT NULL AUTO_INCREMENT COMMENT '关联ID，自增主键';
ALTER TABLE `userrole` MODIFY COLUMN `userId` int NOT NULL COMMENT '用户ID，外键';
ALTER TABLE `userrole` MODIFY COLUMN `roleId` int NOT NULL COMMENT '角色ID，外键';
ALTER TABLE `userrole` MODIFY COLUMN `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间';

-- 为角色-菜单关联表字段添加注释
ALTER TABLE `rolemenu` MODIFY COLUMN `id` int NOT NULL AUTO_INCREMENT COMMENT '关联ID，自增主键';
ALTER TABLE `rolemenu` MODIFY COLUMN `roleId` int NOT NULL COMMENT '角色ID，外键';
ALTER TABLE `rolemenu` MODIFY COLUMN `menuId` int NOT NULL COMMENT '菜单ID，外键';
ALTER TABLE `rolemenu` MODIFY COLUMN `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间';

-- 为角色-权限关联表字段添加注释
ALTER TABLE `rolepermission` MODIFY COLUMN `id` int NOT NULL AUTO_INCREMENT COMMENT '关联ID，自增主键';
ALTER TABLE `rolepermission` MODIFY COLUMN `roleId` int NOT NULL COMMENT '角色ID，外键';
ALTER TABLE `rolepermission` MODIFY COLUMN `permissionId` int NOT NULL COMMENT '权限ID，外键';
ALTER TABLE `rolepermission` MODIFY COLUMN `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间';

-- 为刷新令牌表字段添加注释
ALTER TABLE `refreshtoken` MODIFY COLUMN `id` int NOT NULL AUTO_INCREMENT COMMENT '令牌ID，自增主键';
ALTER TABLE `refreshtoken` MODIFY COLUMN `token` varchar(191) NOT NULL COMMENT '令牌值，唯一';
ALTER TABLE `refreshtoken` MODIFY COLUMN `userId` int NOT NULL COMMENT '用户ID，外键，唯一';
ALTER TABLE `refreshtoken` MODIFY COLUMN `expiresAt` datetime(3) NOT NULL COMMENT '过期时间';
ALTER TABLE `refreshtoken` MODIFY COLUMN `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间';
ALTER TABLE `refreshtoken` MODIFY COLUMN `updatedAt` datetime(3) NOT NULL COMMENT '更新时间';

-- 为文章表字段添加注释
ALTER TABLE `post` MODIFY COLUMN `id` varchar(191) NOT NULL COMMENT '文章ID，CUID格式';
ALTER TABLE `post` MODIFY COLUMN `title` varchar(191) NOT NULL COMMENT '文章标题';
ALTER TABLE `post` MODIFY COLUMN `content` varchar(191) NULL COMMENT '文章内容，可为空';
ALTER TABLE `post` MODIFY COLUMN `published` boolean NOT NULL DEFAULT false COMMENT '是否发布，默认未发布';
ALTER TABLE `post` MODIFY COLUMN `authorId` int NULL COMMENT '作者ID，外键，可为空';
ALTER TABLE `post` MODIFY COLUMN `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间';
ALTER TABLE `post` MODIFY COLUMN `updatedAt` datetime(3) NOT NULL COMMENT '更新时间'; 