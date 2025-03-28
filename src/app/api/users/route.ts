import { NextResponse } from 'next/server';
import { db } from '@/db';
import type { User, UserCreate, ApiResponse, PageResponse } from '@/types/api';
import bcrypt from 'bcrypt';
import { user_status } from '@prisma/client';

/**
 * 获取用户列表
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');
        const username = searchParams.get('username');
        const nickname = searchParams.get('nickname');
        const status = searchParams.get('status');

        // 构建查询条件
        const where = {
            ...(username && { username: { contains: username } }),
            ...(nickname && { name: { contains: nickname } }),
            ...(status && { status: status as user_status }),
        };

        // 查询用户列表
        const [users, total] = await Promise.all([
            db.user.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    userrole: {
                        include: {
                            role: true
                        }
                    }
                }
            }),
            db.user.count({ where }),
        ]);

        // 转换数据库模型为API类型
        const apiUsers: User[] = users.map(user => ({
            id: user.id,
            username: user.username,
            nickname: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            status: user.status === user_status.ACTIVE ? 1 : 0,
            createTime: user.createdAt.toISOString(),
            updateTime: user.updatedAt.toISOString(),
            roles: user.userrole.map(ur => ({
                id: ur.role.id,
                name: ur.role.name,
                code: ur.role.name, // 使用角色名称作为代码
                status: ur.role.status,
                description: ur.role.description || '',
                createTime: ur.role.createdAt.toISOString(),
                updateTime: ur.role.updatedAt.toISOString(),
                menus: [] // 暂时为空数组
            }))
        }));

        return NextResponse.json({
            code: 0,
            message: 'success',
            data: {
                total,
                list: apiUsers,
            },
        } as ApiResponse<PageResponse<User>>);
    } catch (err) {
        console.error('获取用户列表失败:', err);
        return NextResponse.json(
            {
                code: 500,
                message: 'Internal Server Error',
            } as ApiResponse<null>,
            { status: 500 }
        );
    }
}

/**
 * 创建用户
 */
export async function POST(request: Request) {
    try {
        const body: UserCreate = await request.json();

        // 检查用户名是否已存在
        const existingUser = await db.user.findUnique({
            where: { username: body.username },
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    code: 400,
                    message: '用户名已存在',
                },
                { status: 400 }
            );
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(body.password, 10);

        // 创建用户
        const user = await db.user.create({
            data: {
                username: body.username,
                password: hashedPassword,
                name: body.nickname,
                email: body.email,
                phone: body.phone,
                status: body.status === 1 ? user_status.ACTIVE : user_status.INACTIVE,
            },
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                phone: true,
                status: true,
                roles: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        // 转换数据库模型为API类型
        const apiUser: User = {
            id: user.id,
            username: user.username,
            nickname: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            status: user.status === user_status.ACTIVE ? 1 : 0,
            createTime: user.createdAt.toISOString(),
            updateTime: user.updatedAt.toISOString(),
            roles: [], // TODO: 实现角色关联查询
        };

        return NextResponse.json({
            code: 0,
            message: 'success',
            data: apiUser,
        });
    } catch (err) {
        console.error('创建用户失败:', err);
        return NextResponse.json(
            {
                code: 500,
                message: 'Internal Server Error',
            },
            { status: 500 }
        );
    }
} 