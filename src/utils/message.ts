import { MessageService } from '@/providers/MessageProvider';

/**
 * 全局消息工具
 * 封装统一的消息显示功能
 */
export const showMessage = {
  /**
   * 显示成功消息
   */
  success: (content: React.ReactNode, duration?: number, onClose?: () => void) => {
    MessageService.success(content, duration, onClose);
  },
  
  /**
   * 显示错误消息
   */
  error: (content: React.ReactNode, duration?: number, onClose?: () => void) => {
    MessageService.error(content, duration, onClose);
  },
  
  /**
   * 显示警告消息
   */
  warning: (content: React.ReactNode, duration?: number, onClose?: () => void) => {
    MessageService.warning(content, duration, onClose);
  },
  
  /**
   * 显示信息消息
   */
  info: (content: React.ReactNode, duration?: number, onClose?: () => void) => {
    MessageService.info(content, duration, onClose);
  }
};