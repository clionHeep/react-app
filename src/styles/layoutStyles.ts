import { ThemeConfig } from 'antd/es/config-provider/context';
import { isDarkMode, getTextColor, getThemeAwareContentStyles, getThemeAwareShadow } from './themeUtils';

// 定义布局样式的接口
export interface LayoutStyles {
    layout: React.CSSProperties;
    header: React.CSSProperties;
    breadcrumb: React.CSSProperties;
    menu: React.CSSProperties;
    container: React.CSSProperties;
    content: React.CSSProperties;
    innerContent: React.CSSProperties;
}

// 生成基础布局样式
export const getBaseStyles = (token: ThemeConfig['token']): LayoutStyles => {
    // 检测是否为深色模式
    const darkMode = isDarkMode(token);
    
    // 设置适当的颜色
    const textColor = getTextColor(token);
    const borderColor = darkMode ? 'rgba(255, 255, 255, 0.15)' : '#f0f0f0';
    const contentStyles = getThemeAwareContentStyles(token);
    const shadowStyle = getThemeAwareShadow(token);

    // 默认样式，无论token是否存在都返回
    const baseStyles: LayoutStyles = {
        layout: { minHeight: "100vh" },
        header: {
            padding: "0 24px",
            height: 64,
            lineHeight: "64px",
            background: darkMode ? "#141414" : "#fff", // 根据模式设置默认背景
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: darkMode 
                ? "0 2px 8px rgba(0,0,0,0.3)" 
                : "0 2px 8px rgba(0,0,0,0.05)",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            color: textColor,
        },
        breadcrumb: {
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            zIndex: 995,
            padding: "20px 30px 20px", // 增加垂直间距
            background: darkMode ? "#141414" : "#fff",
            borderBottom: `1px solid ${borderColor}`,
            boxShadow: darkMode 
                ? "0 1px 4px rgba(0,0,0,0.2)" 
                : "0 1px 4px rgba(0,0,0,0.03)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: textColor,
        },
        menu: {
            flex: 1,
            marginLeft: 40,
            height: 64,
            minHeight: 64,
            maxHeight: 64,
            background: "transparent",
            borderBottom: "none",
        },
        container: {
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 64,
        },
        content: {
            padding: "0 50px",
            marginTop: 140, // 固定间距，因为面包屑总是存在
            color: textColor,
        },
        innerContent: {
            ...contentStyles,
            padding: 24,
            minHeight: 280,
            borderRadius: 6,
            boxShadow: shadowStyle,
        },
    };

    // 如果没有token，直接返回基础样式
    if (!token) {
        return baseStyles;
    }

    // 客户端渲染后使用主题token
    return {
        ...baseStyles,
        header: {
            ...baseStyles.header,
            background: token.colorBgContainer,
        },
        breadcrumb: {
            ...baseStyles.breadcrumb,
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorder}`,
        },
        innerContent: {
            ...baseStyles.innerContent,
            borderRadius: token.borderRadiusLG,
        },
    };
}; 