import { ThemeConfig } from 'antd/es/config-provider/context';

// 生成菜单样式 CSS 字符串的函数
export const getMenuStyles = (token: ThemeConfig['token']) => {
  if (!token) return '';
  
  return `
    /* 统一菜单项样式 */
    .fixed-menu-items.ant-menu-light .ant-menu-item-selected {
      background-color: ${token.colorPrimaryBg};
      color: ${token.colorPrimary} !important;
    }
    .fixed-menu-items.ant-menu-light .ant-menu-item:hover {
      color: ${token.colorPrimary} !important;
    }
    .fixed-menu-items.ant-menu-light .ant-menu-item-active {
      color: ${token.colorPrimary} !important;
    }
    /* 确保菜单文字颜色一致 */
    .fixed-menu-items.ant-menu-light .ant-menu-item-selected a,
    .fixed-menu-items.ant-menu-light .ant-menu-item-selected span,
    .fixed-menu-items.ant-menu-light .ant-menu-item-selected div {
      color: ${token.colorPrimary} !important;
    }
    .fixed-menu-items.ant-menu-light .ant-menu-item:hover a,
    .fixed-menu-items.ant-menu-light .ant-menu-item:hover span,
    .fixed-menu-items.ant-menu-light .ant-menu-item:hover div {
      color: ${token.colorPrimary} !important;
    }
    .fixed-menu-items.ant-menu-light .ant-menu-item-active a,
    .fixed-menu-items.ant-menu-light .ant-menu-item-active span,
    .fixed-menu-items.ant-menu-light .ant-menu-item-active div {
      color: ${token.colorPrimary} !important;
    }
    /* 强化菜单文字样式 */
    .fixed-menu-items .ant-menu-title-content {
      color: inherit !important;
    }
    .fixed-menu-items.ant-menu-light .ant-menu-item-selected .ant-menu-title-content {
      color: ${token.colorPrimary} !important;
      font-weight: 500;
    }
    /* 直接针对菜单文本 */
    .fixed-menu-items .ant-menu-item * {
      transition: color 0.3s;
    }
    .fixed-menu-items .ant-menu-item-selected * {
      color: ${token.colorPrimary} !important;
    }
    .fixed-menu-items .ant-menu-item:hover * {
      color: ${token.colorPrimary} !important;
    }
    /* 菜单项强制颜色应用 */
    .fixed-menu-items .ant-menu-item-selected > span,
    .fixed-menu-items .ant-menu-item-selected > a,
    .fixed-menu-items .ant-menu-item-selected > div,
    .fixed-menu-items .ant-menu-item-selected > * {
      color: ${token.colorPrimary} !important;
    }
    /* 添加下划线指示 */
    .ant-menu-horizontal.fixed-menu-items > .ant-menu-item-selected::after,
    .ant-menu-horizontal.fixed-menu-items > .ant-menu-item:hover::after {
      border-bottom-color: ${token.colorPrimary} !important;
      border-bottom-width: 2px !important;
    }
    
    /* 专门针对ant-menu-title-content元素的高优先级规则 */
    .ant-menu .ant-menu-item .ant-menu-title-content,
    .fixed-menu-items .ant-menu-item .ant-menu-title-content {
      transition: color 0.3s ease;
    }
    
    /* 选中状态下的菜单项标题内容 */
    .ant-menu .ant-menu-item-selected .ant-menu-title-content,
    .fixed-menu-items .ant-menu-item-selected .ant-menu-title-content,
    .ant-menu.fixed-menu-items .ant-menu-item-selected .ant-menu-title-content,
    html body .ant-menu-item.ant-menu-item-selected .ant-menu-title-content {
      color: ${token.colorPrimary} !important;
      font-weight: 500;
    }
    
    /* 悬停状态下的菜单项标题内容 */
    .ant-menu .ant-menu-item:hover .ant-menu-title-content,
    .fixed-menu-items .ant-menu-item:hover .ant-menu-title-content,
    html body .ant-menu-item:hover .ant-menu-title-content {
      color: ${token.colorPrimary} !important;
    }
    
    /* 激活状态下的菜单项标题内容 */
    .ant-menu .ant-menu-item-active .ant-menu-title-content,
    .fixed-menu-items .ant-menu-item-active .ant-menu-title-content,
    html body .ant-menu-item-active .ant-menu-title-content {
      color: ${token.colorPrimary} !important;
    }
    
    /* 水平菜单的特殊情况 */
    .ant-menu-horizontal .ant-menu-item-selected .ant-menu-title-content,
    .ant-menu-horizontal.fixed-menu-items .ant-menu-item-selected .ant-menu-title-content,
    .ant-menu-horizontal .ant-menu-overflow-item-selected .ant-menu-title-content {
      color: ${token.colorPrimary} !important;
    }
    
    /* 内联菜单的特殊情况 */
    .ant-menu-inline .ant-menu-item-selected .ant-menu-title-content,
    .ant-menu-inline.fixed-menu-items .ant-menu-item-selected .ant-menu-title-content {
      color: ${token.colorPrimary} !important;
    }
    
    /* 极高优先级选择器，确保覆盖所有情况 */
    html body .ant-menu .ant-menu-item-selected .ant-menu-title-content,
    html body .ant-menu.fixed-menu-items .ant-menu-item.ant-menu-item-selected .ant-menu-title-content {
      color: ${token.colorPrimary} !important;
    }
    
    /* 父子菜单关系处理 - 当子菜单被选中时，父菜单也应该显示主题色 */
    .ant-menu-submenu-selected > .ant-menu-submenu-title,
    .ant-menu-submenu-selected > .ant-menu-submenu-title .ant-menu-title-content,
    .ant-menu-submenu-selected > .ant-menu-submenu-title > span,
    .ant-menu-submenu-active > .ant-menu-submenu-title,
    .ant-menu-submenu-active > .ant-menu-submenu-title .ant-menu-title-content {
      color: ${token.colorPrimary} !important;
    }
    
    /* 水平菜单中的激活父菜单项 */
    .ant-menu-horizontal > .ant-menu-submenu-selected > .ant-menu-submenu-title,
    .ant-menu-horizontal > .ant-menu-submenu-selected > .ant-menu-submenu-title .ant-menu-title-content,
    .ant-menu-horizontal > .ant-menu-submenu-active > .ant-menu-submenu-title,
    .ant-menu-horizontal > .ant-menu-submenu-active > .ant-menu-submenu-title .ant-menu-title-content {
      color: ${token.colorPrimary} !important;
    }
    
    /* 混合布局特殊处理 - 确保当点击子菜单时，水平主菜单也显示主题色 */
    .ant-menu-horizontal.fixed-menu-items > .ant-menu-item.activeParent,
    .ant-menu-horizontal.fixed-menu-items > .ant-menu-item.activeParent .ant-menu-title-content,
    .ant-menu-horizontal.fixed-menu-items > .ant-menu-item.activeParent * {
      color: ${token.colorPrimary} !important;
    }
    .ant-menu-horizontal.fixed-menu-items > .ant-menu-item.activeParent::after {
      border-bottom-color: ${token.colorPrimary} !important;
      border-bottom-width: 2px !important;
      opacity: 1;
    }
    
    /* 处理水平菜单特殊性 */
    .ant-menu-horizontal.fixed-menu-items .ant-menu-overflow-item-selected .ant-menu-title-content,
    .ant-menu-horizontal.fixed-menu-items .ant-menu-overflow-item-selected *,
    .ant-menu-horizontal.fixed-menu-items .ant-menu-item-selected .ant-menu-title-content {
      color: ${token.colorPrimary} !important;
    }
    
    /* 为activeParent类添加主题色 */
    .fixed-menu-items .ant-menu-item.activeParent,
    .fixed-menu-items.ant-menu-light .ant-menu-item.activeParent {
      color: ${token.colorPrimary} !important;
    }
    
    /* 确保activeParent类的子元素也使用主题色 */
    .fixed-menu-items .ant-menu-item.activeParent .ant-menu-title-content,
    .fixed-menu-items .ant-menu-item.activeParent *,
    .fixed-menu-items .ant-menu-item.activeParent > *,
    .fixed-menu-items.ant-menu-light .ant-menu-item.activeParent *,
    .fixed-menu-items.ant-menu-light .ant-menu-item.activeParent .ant-menu-title-content {
      color: ${token.colorPrimary} !important;
    }
    
    /* 水平菜单中activeParent的样式 */
    .ant-menu-horizontal.fixed-menu-items > .ant-menu-item.activeParent::after {
      border-bottom-color: ${token.colorPrimary} !important;
      border-bottom-width: 2px !important;
      opacity: 1;
    }

    /* 子菜单弹出层中的所有项 */
    .ant-menu-submenu-popup .ant-menu-item.ant-menu-item-selected {
      background-color: ${token.colorPrimaryBg} !important;
      color: ${token.colorPrimary} !important;
    }
    
    /* 子菜单标题内容 */
    .ant-menu-submenu-popup .ant-menu-item.ant-menu-item-selected .ant-menu-title-content,
    .ant-menu-submenu-popup .ant-menu-item-selected * {
      color: ${token.colorPrimary} !important;
    }
    
    /* 子菜单悬停效果 */
    .ant-menu-submenu-popup .ant-menu-item:hover .ant-menu-title-content,
    .ant-menu-submenu-popup .ant-menu-item:hover * {
      color: ${token.colorPrimary} !important;
    }
    
    /* 确保子菜单的标题内容使用主题色 */
    html body .ant-menu-vertical .ant-menu-item-selected .ant-menu-title-content,
    html body .ant-menu-vertical .ant-menu-item-selected,
    html body .ant-menu-vertical .ant-menu-item-active,
    html body .ant-menu-submenu-popup .ant-menu-item-selected .ant-menu-title-content {
      color: ${token.colorPrimary} !important;
    }
  `;
};

// 面包屑样式
export const getBreadcrumbStyles = () => {
  return `
    .custom-breadcrumb .ant-breadcrumb-link a,
    .custom-breadcrumb .ant-breadcrumb-link a:hover {
      background: transparent !important;
    }
    .custom-breadcrumb .ant-breadcrumb-link {
    }
    .custom-breadcrumb ol {
      display: flex;
      flex-wrap: wrap;
    }
  `;
};

// 侧边栏滚动样式
export const getSiderScrollStyles = (token: ThemeConfig['token']) => {
  if (!token) return '';
  
  return `
    /* 隐藏Chrome, Safari和Opera的滚动条 */
    .ant-layout-sider::-webkit-scrollbar {
      display: none;
    }
    
    /* 固定Logo区域 */
    .sider-logo {
      position: sticky;
      top: 0;
      z-index: 10;
      background: ${token.colorBgContainer};
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    
    /* 设置Menu容器滚动 */
    .menu-container {
      height: calc(100vh - 64px);
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE and Edge */
    }
    
    /* 隐藏菜单容器的滚动条 */
    .menu-container::-webkit-scrollbar {
      display: none;
    }
  `;
}; 