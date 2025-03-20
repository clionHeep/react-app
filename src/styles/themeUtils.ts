import { ThemeConfig } from 'antd/es/config-provider/context';

/**
 * 检测当前是否为深色模式
 * @param token 主题配置对象
 * @returns 是否为深色模式
 */
export const isDarkMode = (token?: ThemeConfig['token']): boolean => {
    if (!token) return false;

    return (
        String(token.colorBgContainer || '').includes('#141414') ||
        String(token.colorBgContainer || '').includes('#1f1f1f') ||
        String(token.colorBgContainer || '').includes('#000') ||
        String(token.colorBgContainer || '').includes('rgba(0,0,0')
    );
};

/**
 * 将十六进制颜色转换为RGBA格式
 * @param hex 十六进制颜色字符串
 * @param opacity 不透明度
 * @returns RGBA格式的颜色字符串
 */
export const hexToRgba = (hex: string, opacity: number): string => {
    try {
        const hex1 = hex.replace('#', '');
        const r = parseInt(hex1.substring(0, 2), 16);
        const g = parseInt(hex1.substring(2, 4), 16);
        const b = parseInt(hex1.substring(4, 6), 16);

        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } catch {
        // 如果转换失败，回退到安全值
        return `rgba(0, 0, 0, ${opacity})`;
    }
};

/**
 * 获取主题色的轻量背景色
 * @param token 主题配置对象
 * @param opacity 不透明度，默认为0.08
 * @returns 主题相关的背景色
 */
export const getThemeBackground = (token?: ThemeConfig['token'], opacity: number = 0.08): string => {
    if (!token) return 'rgba(0, 107, 250, 0.08)'; // 默认值

    const darkMode = isDarkMode(token);

    if (darkMode) {
        // 深色模式下使用主题文本色的淡化版本
        try {
            // 安全地访问colorPrimaryText
            const primaryText = token.colorPrimaryText || 'rgba(255, 255, 255, 0.95)';
            return `rgba(${primaryText.replace(/[^\d,]/g, '')}, ${opacity})`;
        } catch {
            return `rgba(255, 255, 255, ${opacity})`;
        }
    } else {
        // 浅色模式下使用主题色的淡化版本
        const primaryColor = token.colorPrimary || '#006bfa';
        return hexToRgba(primaryColor, opacity);
    }
};

/**
 * 获取主题相关的边框颜色
 * @param token 主题配置对象
 * @returns 主题相关的边框色
 */
export const getThemeBorderColor = (token?: ThemeConfig['token']): string => {
    if (!token) return 'rgba(0, 107, 250, 0.15)'; // 默认值

    const darkMode = isDarkMode(token);

    if (darkMode) {
        try {
            // 安全地访问colorPrimaryText
            const primaryText = token.colorPrimaryText || 'rgba(255, 255, 255, 0.95)';
            return `rgba(${primaryText.replace(/[^\d,]/g, '')}, 0.2)`;
        } catch {
            return 'rgba(255, 255, 255, 0.2)';
        }
    } else {
        const primaryColor = token.colorPrimary || '#006bfa';
        return hexToRgba(primaryColor, 0.15);
    }
};

/**
 * 获取深色模式下更适合的文本颜色
 * @param token 主题配置对象
 * @returns 文本颜色
 */
export const getTextColor = (token?: ThemeConfig['token']): string => {
    const darkMode = isDarkMode(token);
    // 提供更亮的文本颜色以提高可见度
    return darkMode ? 'rgba(255, 255, 255, 0.95)' : (token?.colorText || 'rgba(0, 0, 0, 0.85)');
};

/**
 * 获取主题模式下的卡片和内容区域样式增强
 * @param token 主题配置对象
 * @returns CSS属性对象
 */
export const getThemeAwareContentStyles = (token?: ThemeConfig['token']) => {
    const darkMode = isDarkMode(token);

    return {
        // 在深色模式下使用稍微更亮的背景色以提高对比度
        background: darkMode ? (token?.colorBgElevated || '#252525') : (token?.colorBgContainer || '#fff'),
        color: getTextColor(token),
        border: darkMode ? `1px solid ${token?.colorBorderSecondary || 'rgba(255,255,255,0.15)'}` : 'none',
        boxShadow: darkMode ? '0 2px 14px rgba(0,0,0,0.4)' : 'none',

        // 移除不支持的嵌套选择器语法
        // 注意：headings, links, dividers等特殊元素的样式将通过CSS文件来设置
    };
};

/**
 * 获取深色模式下更好的阴影效果
 * @param token 主题配置对象
 * @returns 阴影样式
 */
export const getThemeAwareShadow = (token?: ThemeConfig['token']): string => {
    const darkMode = isDarkMode(token);
    return darkMode
        ? '0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(255,255,255,0.05)'
        : (token?.boxShadow || '0 4px 12px rgba(0,0,0,0.05)');
};

/**
 * 获取反转的背景色，用于深色模式下的强调区域
 * @param token 主题配置对象
 * @returns 背景样式
 */
export const getInvertedBackground = (token?: ThemeConfig['token']): string => {
    const darkMode = isDarkMode(token);
    return darkMode
        ? (token?.colorBgElevated || '#2d2d2d')
        : (token?.colorBgContainer || '#fff');
};

/**
 * 获取主题感知的卡片样式
 * @param token 主题配置对象
 * @returns 卡片样式对象
 */
export const getThemeCardStyles = (token?: ThemeConfig['token']) => {
    const darkMode = isDarkMode(token);

    return {
        background: getThemeBackground(token),
        borderRadius: token?.borderRadius || 8,
        border: `1px solid ${getThemeBorderColor(token)}`,
        boxShadow: darkMode
            ? "0 4px 12px rgba(0, 0, 0, 0.3)"
            : "0 2px 8px rgba(0, 0, 0, 0.05)",
        padding: "16px 20px",
    };
}; 