"use client";

import React from "react";
import { Typography, Card, Tabs } from "antd";
import { AppstoreOutlined, ShoppingOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const AppsPage: React.FC = () => {
  return (
    <div className="apps-container" style={{ padding: "24px" }}>
      <Title level={2}>应用管理</Title>
      <Paragraph>在这里管理您的应用和访问应用商店。</Paragraph>

      <Tabs
        defaultActiveKey="1"
        style={{ marginTop: "24px" }}
        items={[
          {
            key: "1",
            label: (
              <span>
                <ShoppingOutlined />
                应用市场
              </span>
            ),
            children: (
              <div style={{ paddingTop: "16px" }}>
                <Card
                  title="应用商店"
                  extra={<a href="/apps/app-store">查看全部</a>}
                >
                  <p>浏览和安装各种应用来扩展系统功能。</p>
                </Card>
              </div>
            ),
          },
          {
            key: "2",
            label: (
              <span>
                <AppstoreOutlined />
                我的应用
              </span>
            ),
            children: (
              <div style={{ paddingTop: "16px" }}>
                <Card
                  title="已安装应用"
                  extra={<a href="/apps/my-apps">管理应用</a>}
                >
                  <p>查看和管理您已安装的应用。</p>
                </Card>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default AppsPage;
