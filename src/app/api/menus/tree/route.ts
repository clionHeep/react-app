import { db } from '@/db';
import { JsonResponse } from '@/utils/api-response';

/**
 * 获取菜单树
 */
export async function GET() {
  try {
    // 获取所有菜单
    const menus = await db.menu.findMany({
      orderBy: {
        sort: 'asc',
      },
      where: {
        parentId: null, // 只获取顶级菜单
      },
      include: {
        children: {
          orderBy: {
            sort: 'asc',
          },
        },
      },
    });

    return JsonResponse(menus);
  } catch (error) {
    console.error('获取菜单树失败:', error);
    return JsonResponse(null, '获取菜单树失败', 500);
  }
} 