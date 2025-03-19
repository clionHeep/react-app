import React from "react";
import { Card } from "antd";
import Typography from "antd/es/typography";
const { Title, Paragraph } = Typography;

export default function DashboardPage() {
  return (
    <div className="dashboard-container" style={{ padding: "24px" }}>
      <Title level={2}>仪表盘</Title>
      <Paragraph>欢迎来到仪表盘页面，这里是系统的数据中心。</Paragraph>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          marginTop: "24px",
        }}
      >
        <Card
          title="数据分析"
          style={{ width: 300 }}
          extra={<a href="/dashboard/analytics">详情</a>}
        >
          查看系统数据分析和统计信息
        </Card>

        <Card
          title="工作台"
          style={{ width: 300 }}
          extra={<a href="/dashboard/workspace">详情</a>}
        >
          访问您的个人工作台和项目
        </Card>
      </div>
    </div>
  );
}
