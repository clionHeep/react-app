# 全局加载状态使用指南

## 基本用法

在Next.js的App Router中，`loading.tsx`文件是一个特殊的文件，它会自动处理页面加载状态。当放置在`app`目录下时，它可以处理整个应用的加载状态。

### 应用目录结构

```
app/
├── loading.tsx      # 全局加载组件
├── page.tsx         # 首页
├── dashboard/
│   ├── loading.tsx  # dashboard路由的加载组件（可选）
│   └── page.tsx     # dashboard页面
└── ...
```

### 加载状态自动处理

1. 当用户导航到应用中的任何页面时，如果页面需要加载数据，Next.js会自动显示最近的loading.tsx组件
2. 加载组件会在页面准备好之前显示，然后无缝切换到实际页面

### 在组件中使用

如果需要在组件中手动控制加载状态，可以使用以下方式：

```jsx
import dynamic from 'next/dynamic';

// 动态导入Loading组件
const Loading = dynamic(() => import('@/app/loading'));

// 在组件中使用
function MyComponent() {
  const [isLoading, setIsLoading] = useState(true);
  
  // ...
  
  if (isLoading) {
    return <Loading />;
  }
  
  return <div>加载完成的内容</div>;
}
```

## 嵌套加载状态

可以在不同的路由目录下创建不同的loading.tsx文件，以实现更精细的加载状态控制：

- `app/loading.tsx` - 应用全局加载状态
- `app/dashboard/loading.tsx` - 仅dashboard路由的加载状态

## 性能提示

- 加载组件将被预渲染，以便快速显示
- 当使用Suspense加载数据时，加载组件会自动显示
- Next.js会在页面准备好后自动切换到实际内容

## 注意事项

- 不要在loading.tsx中使用数据获取逻辑
- 加载组件应该是轻量级的，以便快速显示
- 如果需要自定义加载行为，可以使用React的Suspense和ErrorBoundary 