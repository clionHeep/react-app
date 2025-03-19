import React from "react";
import { Avatar, Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  BgColorsOutlined,
} from "@ant-design/icons";

interface UserInfoProps {
  onLayoutClick: () => void;
}

const userMenuItems: MenuProps["items"] = [
  {
    key: "1",
    label: "个人中心",
    icon: <UserOutlined />,
  },
  {
    key: "2",
    label: "系统设置",
    icon: <SettingOutlined />,
  },
  {
    type: "divider",
  },
  {
    key: "3",
    label: "退出登录",
    icon: <LogoutOutlined />,
  },
];

const UserInfo: React.FC<UserInfoProps> = ({ onLayoutClick }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Button type="text" icon={<BellOutlined />} style={{ fontSize: 16 }} />
      <Button
        type="text"
        icon={<BgColorsOutlined />}
        onClick={onLayoutClick}
        style={{ fontSize: 16 }}
      />
      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <Avatar icon={<UserOutlined />} />
          <span>管理员</span>
        </div>
      </Dropdown>
    </div>
  );
};

export default UserInfo;
