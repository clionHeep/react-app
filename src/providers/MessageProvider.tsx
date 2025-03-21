import React, { createContext, useContext } from 'react';
import { message } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';

// 创建消息上下文
const MessageContext = createContext<{
  messageApi?: MessageInstance;
}>({});

// 消息提供者组件
export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 使用message钩子
  const [messageApi, contextHolder] = message.useMessage();

  // 注册到全局服务
  React.useEffect(() => {
    if (messageApi) {
      MessageService.register(messageApi);
    }
  }, [messageApi]);

  return (
    <MessageContext.Provider value={{ messageApi }}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
};

// 消息钩子 - 在组件中使用
export const useMessage = () => {
  return useContext(MessageContext);
};

// 全局消息服务 - 用于非组件环境
export class MessageService {
  private static messageApi: MessageInstance | undefined;

  // 注册消息API
  static register(instance: MessageInstance): void {
    this.messageApi = instance;
  }

  // 显示成功消息
  static success(content: React.ReactNode, duration?: number, onClose?: () => void): void {
    if (this.messageApi) {
      this.messageApi.success(content, duration, onClose);
      return;
    }
    // 如果尚未初始化，等待下一个事件循环尝试
    setTimeout(() => {
      if (this.messageApi) {
        this.messageApi.success(content, duration, onClose);
      } else {
        console.warn('消息API尚未初始化');
      }
    }, 0);
  }

  // 显示错误消息
  static error(content: React.ReactNode, duration?: number, onClose?: () => void): void {
    if (this.messageApi) {
      this.messageApi.error(content, duration, onClose);
      return;
    }
    setTimeout(() => {
      if (this.messageApi) {
        this.messageApi.error(content, duration, onClose);
      } else {
        console.warn('消息API尚未初始化');
      }
    }, 0);
  }

  // 显示警告消息
  static warning(content: React.ReactNode, duration?: number, onClose?: () => void): void {
    if (this.messageApi) {
      this.messageApi.warning(content, duration, onClose);
      return;
    }
    setTimeout(() => {
      if (this.messageApi) {
        this.messageApi.warning(content, duration, onClose);
      } else {
        console.warn('消息API尚未初始化');
      }
    }, 0);
  }

  // 显示信息消息
  static info(content: React.ReactNode, duration?: number, onClose?: () => void): void {
    if (this.messageApi) {
      this.messageApi.info(content, duration, onClose);
      return;
    }
    setTimeout(() => {
      if (this.messageApi) {
        this.messageApi.info(content, duration, onClose);
      } else {
        console.warn('消息API尚未初始化');
      }
    }, 0);
  }
} 