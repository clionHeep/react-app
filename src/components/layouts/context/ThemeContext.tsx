import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
} from "react";
import { ConfigProvider, theme } from "antd";

interface ThemeContextType {
  themeMode: "light" | "dark" | "custom";
  customColor: string;
  customBgColor: string;
  setThemeMode: (mode: "light" | "dark" | "custom") => void;
  setCustomColor: (color: string) => void;
  setCustomBgColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

// 使用 useIsomorphicLayoutEffect 来避免 SSR 警告
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [themeMode, setThemeModeState] = useState<"light" | "dark" | "custom">(
    "light"
  );
  const [customColor, setCustomColorState] = useState<string>("#1890ff");
  const [customBgColor, setCustomBgColorState] = useState<string>("#ffffff");

  // 初始化主题设置
  useIsomorphicLayoutEffect(() => {
    const storedTheme = localStorage.getItem("themeMode") as
      | "light"
      | "dark"
      | "custom";
    const storedColor = localStorage.getItem("customColor");
    const storedBgColor = localStorage.getItem("customBgColor");

    if (storedTheme) {
      setThemeModeState(storedTheme);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setThemeModeState(prefersDark ? "dark" : "light");
    }

    if (storedColor) {
      setCustomColorState(storedColor);
    }

    if (storedBgColor) {
      setCustomBgColorState(storedBgColor);
    }

    setMounted(true);
  }, []);

  // 更新主题模式并保存到 localStorage
  const setThemeMode = (mode: "light" | "dark" | "custom") => {
    setThemeModeState(mode);
    localStorage.setItem("themeMode", mode);
  };

  // 更新自定义颜色并保存到 localStorage
  const setCustomColor = (color: string) => {
    setCustomColorState(color);
    localStorage.setItem("customColor", color);
  };

  // 更新自定义背景色并保存到 localStorage
  const setCustomBgColor = (color: string) => {
    setCustomBgColorState(color);
    localStorage.setItem("customBgColor", color);
  };

  // 监听系统主题变化
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (themeMode === "light" || themeMode === "dark") {
        setThemeMode(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode, mounted]);

  const getThemeConfig = () => {
    const baseConfig = {
      token: {
        borderRadius: 6,
      },
    };

    switch (themeMode) {
      case "dark":
        return {
          ...baseConfig,
          algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
          token: {
            ...baseConfig.token,
            colorPrimary: "#177ddc",
            colorBgContainer: "#141414",
            colorBgElevated: "#1f1f1f",
            colorBgLayout: "#000000",
            colorText: "rgba(255, 255, 255, 0.85)",
            colorTextSecondary: "rgba(255, 255, 255, 0.45)",
          },
        };
      case "custom":
        return {
          ...baseConfig,
          token: {
            ...baseConfig.token,
            colorPrimary: customColor,
            colorBgContainer: customBgColor,
            colorBgElevated: customBgColor,
            colorBgLayout: customBgColor,
            colorText: "rgba(0, 0, 0, 0.88)",
            colorTextSecondary: "rgba(0, 0, 0, 0.45)",
          },
        };
      default:
        return {
          ...baseConfig,
          algorithm: theme.defaultAlgorithm,
          token: {
            ...baseConfig.token,
            colorPrimary: "#1890ff",
          },
        };
    }
  };

  // 在客户端渲染完成前使用默认主题
  if (!mounted) {
    return <ConfigProvider theme={getThemeConfig()}>{children}</ConfigProvider>;
  }

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        customColor,
        customBgColor,
        setThemeMode,
        setCustomColor,
        setCustomBgColor,
      }}
    >
      <ConfigProvider theme={getThemeConfig()}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
