'use client';

export default function Home() {
  return (
    <div style={{ padding: 24, borderRadius: 8 }}>
      <h1>欢迎使用多布局演示</h1>
      <p>你可以通过右上角的选择器切换不同的布局方式：</p>
      <ul>
        <li>顶部导航 - 适用于简单的应用</li>
        <li>侧边导航 - 适用于复杂的应用</li>
        <li>混合导航 - 适用于层级较深的应用</li>
      </ul>
    </div>
  );
} 