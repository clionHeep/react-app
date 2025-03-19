import type { ThemeConfig } from 'antd';

export const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#0070f3',
    colorBgContainer: '#ffffff',
    colorText: '#000000',
    colorBorder: '#e5e5e5',
    colorBgTextHover: '#f7f7f7',
  },
  components: {
    Menu: {
      itemBg: '#ffffff',
      itemSelectedBg: '#f0f7ff',
      itemSelectedColor: '#0070f3',
      itemHoverBg: '#f7f7f7',
    },
  },
};

export const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#0070f3',
    colorBgContainer: '#18181b',
    colorText: '#ffffff',
    colorBorder: '#27272a',
    colorBgTextHover: '#27272a',
  },
  components: {
    Menu: {
      itemBg: '#18181b',
      itemSelectedBg: '#0c1f3a',
      itemSelectedColor: '#0070f3',
      itemHoverBg: '#27272a',
    },
  },
}; 