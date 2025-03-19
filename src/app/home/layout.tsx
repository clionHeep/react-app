// "use client";
// import React, { useState } from "react";
// import {
//   DesktopOutlined,
//   FileOutlined,
//   MenuFoldOutlined,
//   MenuUnfoldOutlined,
//   PieChartOutlined,
//   TeamOutlined,
//   UserOutlined,
// } from "@ant-design/icons";
// import type { MenuProps } from "antd";
// import { Button, Layout, Menu, theme } from "antd";

// const { Header, Sider, Content } = Layout;

// const items: MenuProps["items"] = [
//   {
//     key: "1",
//     icon: <PieChartOutlined />,
//     label: "Option 1",
//   },
//   {
//     key: "2",
//     icon: <DesktopOutlined />,
//     label: "Option 2",
//   },
//   {
//     key: "sub1",
//     icon: <UserOutlined />,
//     label: "User",
//     children: [
//       {
//         key: "3",
//         label: "Tom",
//       },
//       {
//         key: "4",
//         label: "Bill",
//       },
//       {
//         key: "5",
//         label: "Alex",
//       },
//     ],
//   },
//   {
//     key: "sub2",
//     icon: <TeamOutlined />,
//     label: "Team",
//     children: [
//       {
//         key: "6",
//         label: "Team 1",
//       },
//       {
//         key: "7",
//         label: "Team 2",
//       },
//     ],
//   },
//   {
//     key: "9",
//     icon: <FileOutlined />,
//     label: "Team 1",
//   },
// ];

// const App: React.FC = () => {
//   const [collapsed, setCollapsed] = useState(false);
//   const {
//     token: { colorBgContainer, borderRadiusLG },
//   } = theme.useToken();

//   return (
//     <Layout>
//       <Sider
//         trigger={null}
//         collapsible
//         collapsed={collapsed}
//         className="min-h-screen"
//         style={{ background: colorBgContainer }}
//       >
//         <div className="demo-logo-vertical" />
//         <Menu
//           theme="light"
//           mode="inline"
//           defaultSelectedKeys={["3"]}
//           defaultOpenKeys={["sub1"]}
//           items={items}
//         />
//       </Sider>
//       <Layout>
//         <Header
//           style={{ padding: 0, background: colorBgContainer }}
//           className="flex justify-between items-center"
//         >
//           <Button
//             type="text"
//             icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
//             onClick={() => setCollapsed(!collapsed)}
//             style={{
//               fontSize: "16px",
//               width: 64,
//               height: 64,
//             }}
//           />
//           <div className="pr-20">login</div>
//         </Header>
//         <Content
//           style={{
//             margin: "24px 16px",
//             padding: 24,
//             minHeight: 280,
//             background: colorBgContainer,
//             borderRadius: borderRadiusLG,
//           }}
//         >
//           Content
//         </Content>
//       </Layout>
//     </Layout>
//   );
// };

// export default App;
import React from 'react'

export default function layout() {
  return (
    <div>layout</div>
  )
}
