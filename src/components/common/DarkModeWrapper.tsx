import React from 'react';
import { theme } from 'antd';
import { isDarkMode } from '@/styles/themeUtils';

interface DarkModeWrapperProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 深色模式内容增强包装器组件
 * 
 * 用于包装内容区域，在深色模式下提供更好的可见度和对比度
 * 所有样式均通过CSS文件定义，避免内联样式嵌套选择器问题
 */
const DarkModeWrapper: React.FC<DarkModeWrapperProps> = ({ 
  children, 
  className = '',
  style = {}
}) => {
  const { token } = theme.useToken();
  const darkMode = isDarkMode(token);
  
  return (
    <div 
      className={`dark-mode-wrapper ${className} ${darkMode ? 'dark-mode' : ''}`} 
      style={style}
    >
      {children}
    </div>
  );
};

export default DarkModeWrapper; 