import React, { useState } from "react";
import { Drawer, Switch } from "antd";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";
import classNames from "classnames";

interface ThemeSettingsProps {
  open: boolean;
  onClose: () => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ open, onClose }) => {
  const [selectedLayout, setSelectedLayout] = useState("vertical");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("blue");

  const layouts = [
    {
      id: "vertical",
      name: "侧边菜单布局",
      preview: (
        <div className="h-14 flex">
          <div className="w-1/4 bg-gray-100 rounded" />
          <div className="flex-1 ml-1">
            <div className="h-3 bg-gray-100 mb-1 rounded" />
            <div className="h-10 bg-gray-100 rounded" />
          </div>
        </div>
      ),
    },
    {
      id: "horizontal",
      name: "顶部菜单布局",
      preview: (
        <div className="h-14 flex flex-col">
          <div className="h-3 bg-gray-100 mb-1 rounded" />
          <div className="flex-1 bg-gray-100 rounded" />
        </div>
      ),
    },
  ];

  const themes = [
    { id: "blue", color: "#1677ff" },
    { id: "purple", color: "#722ed1" },
    { id: "cyan", color: "#13c2c2" },
    { id: "green", color: "#52c41a" },
    { id: "orange", color: "#f5a623" },
  ];

  return (
    <Drawer
      title="主题设置"
      placement="right"
      width={280}
      onClose={onClose}
      open={open}
      closable={false}
      bodyStyle={{ padding: 0 }}
      extra={
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <CloseOutlined className="text-gray-400" />
        </button>
      }
    >
      <div className="px-6 py-4 space-y-6 flex">
        {/* 布局设置 */}
        <div className="flex flex-col gap-y-16px">
          <h3 className="mb-3 text-sm font-medium text-gray-900">布局模式</h3>
          <div className="grid grid-cols-2 gap-3">
            {layouts.map((layout) => (
              <div
                key={layout.id}
                onClick={() => setSelectedLayout(layout.id)}
                className={classNames(
                  "cursor-pointer rounded-lg border transition-all p-3 flex flex-col",
                  {
                    "border-primary bg-primary/5": selectedLayout === layout.id,
                    "border-gray-200 hover:border-primary/40":
                      selectedLayout !== layout.id,
                  }
                )}
              >
                <div className="flex-1">{layout.preview}</div>
                <div className="mt-2 text-xs text-center text-gray-600">
                  {layout.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 主题色设置 */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-900">深色模式</h3>
            <Switch
              checked={isDarkMode}
              onChange={setIsDarkMode}
              size="small"
            />
          </div>
          <div className="flex gap-3">
            {themes.map((theme) => (
              <div
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={classNames(
                  "w-8 h-8 rounded-full cursor-pointer border-2 transition-colors",
                  {
                    "border-primary ring-2 ring-primary/20":
                      selectedTheme === theme.id,
                    "border-transparent": selectedTheme !== theme.id,
                  }
                )}
                style={{ backgroundColor: theme.color }}
              >
                {selectedTheme === theme.id && (
                  <div className="h-full flex items-center justify-center">
                    <CheckOutlined className="text-white text-xs" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 底部按钮 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
        <button
          onClick={onClose}
          className="w-full h-9 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
        >
          确认
        </button>
      </div>
    </Drawer>
  );
};

export default ThemeSettings;
