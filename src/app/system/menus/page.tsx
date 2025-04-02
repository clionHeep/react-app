"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Switch,
  Tag,
  Popover,
  Collapse,
  App,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import request from "@/lib/axios";
import * as Icons from "@ant-design/icons";
import type { AntdIconProps } from "@ant-design/icons/lib/components/AntdIcon";

interface MenuItem {
  id: number;
  name: string;
  routeName?: string;
  path?: string;
  component?: string;
  layout?: "DEFAULT" | "BLANK" | "CUSTOM";
  redirect?: string;
  icon?: string;
  i18nKey?: string;
  type: "DIRECTORY" | "MENU" | "BUTTON";
  permission?: string;
  params?: Record<string, string | number | boolean>;
  query?: Record<string, string | number | boolean>;
  sort: number;
  hidden: boolean;
  hideTab: boolean;
  hideMenu: boolean;
  hideBreadcrumb: boolean;
  hideChildren: boolean;
  status: number;
  isExternal: boolean;
  keepAlive: boolean;
  constant: boolean;
  affix: boolean;
  parentId?: number;
  children?: MenuItem[];
  remark?: string;
  [key: string]:
    | string
    | number
    | boolean
    | MenuItem[]
    | Record<string, string | number | boolean>
    | undefined;
}

// 图标选择器组件
const IconPicker: React.FC<{
  value?: string;
  onChange?: (value: string) => void;
}> = ({ value, onChange }) => {
  const [searchText, setSearchText] = useState("");
  const [visible, setVisible] = useState(false);

  const getIconComponent = (iconName: string) => {
    if (!iconName) return null;
    const IconComponent = (
      Icons as unknown as Record<string, React.ComponentType<AntdIconProps>>
    )[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  const iconList = Object.keys(Icons)
    .filter((key) => key.endsWith("Outlined"))
    .filter((key) => key.toLowerCase().includes(searchText.toLowerCase()));

  const content = (
    <div style={{ width: 300 }}>
      <Input
        placeholder="搜索图标"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <div style={{ height: 300, overflow: "auto" }}>
        <Space wrap>
          {iconList.map((key) => {
            const IconComponent = (
              Icons as unknown as Record<
                string,
                React.ComponentType<AntdIconProps>
              >
            )[key];
            return (
              <Button
                key={key}
                type={value === key ? "primary" : "text"}
                icon={<IconComponent />}
                onClick={() => {
                  onChange?.(key);
                  setVisible(false);
                }}
              />
            );
          })}
        </Space>
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      title="选择图标"
      trigger="click"
      open={visible}
      onOpenChange={setVisible}
    >
      <Button>{value ? getIconComponent(value) : "选择图标"}</Button>
    </Popover>
  );
};

// 构建树形结构的辅助函数
const buildTree = (
  items: MenuItem[],
  parentId: number | null = null
): MenuItem[] => {
  return items
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      ...item,
      children: buildTree(items, item.id),
    }))
    .sort((a, b) => (a.sort || 0) - (b.sort || 0));
};

const MenuPage: React.FC = () => {
  const [data, setData] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);

  const getIconComponent = (iconName: string) => {
    if (!iconName) return null;
    const IconComponent = (
      Icons as unknown as Record<string, React.ComponentType<AntdIconProps>>
    )[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await request.get("/api/menus");
      console.log("菜单数据原始响应:", response);

      let menuData: MenuItem[] = [];

      if (response.data?.data) {
        const data = response.data.data;
        if (data.list && Array.isArray(data.list)) {
          const flatMenus = data.list.map((item: MenuItem) => ({
            ...item,
            sort: item.order || 0,
            status: item.status || 1,
            hidden: item.hidden || false,
            hideTab: item.hideTab || false,
            hideMenu: item.hideMenu || false,
            hideBreadcrumb: item.hideBreadcrumb || false,
            hideChildren: item.hideChildren || false,
            isExternal: item.isExternal || false,
            keepAlive: item.keepAlive || true,
            constant: item.constant || false,
            affix: item.affix || false,
            component: item.component || "",
            permission: item.permission || "",
            routeName: item.routeName || "",
            layout: item.layout || "DEFAULT",
            redirect: item.redirect || "",
            i18nKey: item.i18nKey || "",
            params: item.params || {},
            query: item.query || {},
            remark: item.remark || "",
          }));
          menuData = buildTree(flatMenus);
        } else if (Array.isArray(data)) {
          menuData = buildTree(data);
        }
      }

      console.log("处理后的菜单数据:", menuData);
      setData(menuData);
    } catch (error) {
      console.error("获取菜单数据失败:", error);
      message.error("获取菜单数据失败");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: MenuItem) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/api/menus/${id}`);
      message.success("删除成功");
      fetchData();
    } catch {
      message.error("删除失败");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 处理布尔值字段
      const booleanFields = [
        "hidden",
        "hideTab",
        "hideMenu",
        "hideBreadcrumb",
        "hideChildren",
        "isExternal",
        "keepAlive",
        "constant",
        "affix",
      ];
      booleanFields.forEach((field) => {
        values[field] = !!values[field];
      });

      // 处理 JSON 字段
      if (values.params && typeof values.params === "string") {
        try {
          values.params = JSON.parse(values.params);
        } catch {
          values.params = {};
        }
      }
      if (values.query && typeof values.query === "string") {
        try {
          values.query = JSON.parse(values.query);
        } catch {
          values.query = {};
        }
      }

      if (editingId) {
        await request.put(`/api/menus?id=${editingId}`, values);
        message.success("更新成功");
      } else {
        await request.post("/api/menus", values);
        message.success("添加成功");
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.error("操作失败:", error);
      message.error("操作失败");
    }
  };

  const columns: ColumnsType<MenuItem> = [
    {
      title: "",
      key: "expand",
      width: 48,
      render: (_, record) => {
        if (record.children && record.children.length > 0) {
          return <div style={{ width: "24px" }} />;
        }
        return null;
      },
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      width: "220px",
      render: (text, record) => (
        <Space>
          {record.icon && getIconComponent(record.icon)}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: "120px",
      render: (type: string) =>
        ({
          DIRECTORY: "目录",
          MENU: "菜单",
          BUTTON: "按钮",
        }[type] || type),
    },
    {
      title: "路由路径",
      dataIndex: "path",
      key: "path",
      width: "180px",
      render: (path: string) => <span style={{ color: "#666" }}>{path}</span>,
    },
    {
      title: "组件",
      dataIndex: "component",
      key: "component",
      width: "180px",
      render: (component: string) => (
        <span style={{ color: "#666", fontFamily: "monospace" }}>
          {component}
        </span>
      ),
    },
    {
      title: "权限标识",
      dataIndex: "permission",
      key: "permission",
      width: "180px",
      render: (permission: string) => (
        <span style={{ color: "#666" }}>{permission}</span>
      ),
    },
    {
      title: "排序",
      dataIndex: "sort",
      key: "sort",
      width: "80px",
      align: "center",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: "100px",
      align: "center",
      render: (status: number) => (
        <Tag
          color={status === 1 ? "success" : "error"}
          style={{ minWidth: "48px", textAlign: "center" }}
        >
          {status === 1 ? "启用" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: "150px",
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <App>
      <div style={{ padding: "24px" }}>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加菜单
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: "max-content" }}
          expandable={{
            defaultExpandAllRows: true,
            expandRowByClick: true,
            indentSize: 0,
            expandIcon: ({ expanded, onExpand, record }) => {
              if (record.children && record.children.length > 0) {
                return (
                  <div
                    className="expand-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExpand(record, e);
                    }}
                    style={{
                      transition: "all 0.3s ease",
                      transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "24px",
                      height: "24px",
                      cursor: "pointer",
                      color: "#1677ff",
                    }}
                  >
                    <PlusOutlined style={{ fontSize: "12px" }} />
                  </div>
                );
              }
              return null;
            },
          }}
          rowClassName={(record) => {
            return record.parentId ? "child-menu-row" : "";
          }}
          className="menu-table"
        />

        <style jsx global>{`
          .menu-table .ant-table-row {
            transition: all 0.3s ease;
          }

          .menu-table .child-menu-row td {
            padding-left: 40px !important;
            background-color: #fafafa;
          }

          .menu-table .ant-table-cell {
            padding: 12px 16px !important;
          }

          .menu-table .expand-icon:hover {
            color: #1677ff;
          }

          .menu-table .ant-table-row-expand-icon-cell {
            padding-right: 0 !important;
          }

          .menu-table .ant-table-tbody > tr.ant-table-row:hover > td {
            background-color: #f5f5f5;
          }

          .menu-table .ant-table-tbody > tr > td {
            border-bottom: 1px solid #f0f0f0;
          }

          .menu-table .ant-table-thead > tr > th {
            background-color: #fafafa;
            font-weight: 500;
            color: #333;
          }

          .menu-table .ant-btn-link {
            padding: 4px 8px;
            height: auto;
          }
        `}</style>

        <Modal
          title={editingId ? "编辑菜单" : "添加菜单"}
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              type: "MENU", // 设置默认值为 MENU
              status: 1,
              sort: 0,
              layout: "DEFAULT",
              hidden: false,
              hideTab: false,
              hideMenu: false,
              hideBreadcrumb: false,
              hideChildren: false,
              isExternal: false,
              keepAlive: true,
              constant: false,
              affix: false,
            }}
          >
            <Collapse
              defaultActiveKey={["basic", "route"]}
              style={{ marginBottom: 24 }}
              items={[
                {
                  key: "basic",
                  label: "基本信息",
                  children: (
                    <Space style={{ width: "100%" }} direction="vertical">
                      <Form.Item
                        name="name"
                        label="名称"
                        rules={[{ required: true, message: "请输入菜单名称" }]}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        name="type"
                        label="菜单类型"
                        rules={[{ required: true, message: "请选择菜单类型" }]}
                      >
                        <Select>
                          <Select.Option value="DIRECTORY">目录</Select.Option>
                          <Select.Option value="MENU">菜单</Select.Option>
                          <Select.Option value="BUTTON">按钮</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item name="icon" label="图标">
                        <IconPicker />
                      </Form.Item>

                      <Form.Item name="sort" label="排序号" initialValue={0}>
                        <Input type="number" />
                      </Form.Item>

                      <Form.Item name="parentId" label="父级菜单">
                        <Select allowClear>
                          {data.map((item) => (
                            <Select.Option key={item.id} value={item.id}>
                              {item.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item name="status" label="状态" initialValue={1}>
                        <Select>
                          <Select.Option value={1}>启用</Select.Option>
                          <Select.Option value={0}>禁用</Select.Option>
                        </Select>
                      </Form.Item>
                    </Space>
                  ),
                },
                {
                  key: "route",
                  label: "路由配置",
                  children: (
                    <Space style={{ width: "100%" }} direction="vertical">
                      <Form.Item name="routeName" label="路由名称">
                        <Input />
                      </Form.Item>

                      <Form.Item name="path" label="路由路径">
                        <Input />
                      </Form.Item>

                      <Form.Item name="component" label="组件路径">
                        <Input />
                      </Form.Item>

                      <Form.Item
                        name="layout"
                        label="布局类型"
                        initialValue="DEFAULT"
                      >
                        <Select>
                          <Select.Option value="DEFAULT">
                            默认布局
                          </Select.Option>
                          <Select.Option value="BLANK">空白布局</Select.Option>
                          <Select.Option value="CUSTOM">
                            自定义布局
                          </Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item name="redirect" label="重定向路径">
                        <Input />
                      </Form.Item>
                    </Space>
                  ),
                },
                {
                  key: "advanced",
                  label: "高级配置",
                  children: (
                    <Space style={{ width: "100%" }} direction="vertical">
                      <Form.Item name="i18nKey" label="国际化Key">
                        <Input />
                      </Form.Item>

                      <Form.Item name="permission" label="权限标识">
                        <Input />
                      </Form.Item>

                      <Form.Item name="remark" label="备注">
                        <Input.TextArea />
                      </Form.Item>

                      <Form.Item label="显示设置">
                        <Space wrap>
                          <Form.Item
                            name="hidden"
                            valuePropName="checked"
                            noStyle
                          >
                            <Switch
                              checkedChildren="隐藏"
                              unCheckedChildren="显示"
                            />
                          </Form.Item>
                          <Form.Item
                            name="hideTab"
                            valuePropName="checked"
                            noStyle
                          >
                            <Switch
                              checkedChildren="隐藏页签"
                              unCheckedChildren="显示页签"
                            />
                          </Form.Item>
                          <Form.Item
                            name="hideMenu"
                            valuePropName="checked"
                            noStyle
                          >
                            <Switch
                              checkedChildren="隐藏菜单"
                              unCheckedChildren="显示菜单"
                            />
                          </Form.Item>
                          <Form.Item
                            name="hideBreadcrumb"
                            valuePropName="checked"
                            noStyle
                          >
                            <Switch
                              checkedChildren="隐藏面包屑"
                              unCheckedChildren="显示面包屑"
                            />
                          </Form.Item>
                          <Form.Item
                            name="hideChildren"
                            valuePropName="checked"
                            noStyle
                          >
                            <Switch
                              checkedChildren="隐藏子菜单"
                              unCheckedChildren="显示子菜单"
                            />
                          </Form.Item>
                        </Space>
                      </Form.Item>

                      <Form.Item label="功能设置">
                        <Space wrap>
                          <Form.Item
                            name="isExternal"
                            valuePropName="checked"
                            noStyle
                          >
                            <Switch
                              checkedChildren="外链"
                              unCheckedChildren="内部"
                            />
                          </Form.Item>
                          <Form.Item
                            name="keepAlive"
                            valuePropName="checked"
                            noStyle
                          >
                            <Switch
                              checkedChildren="缓存"
                              unCheckedChildren="不缓存"
                            />
                          </Form.Item>
                          <Form.Item
                            name="constant"
                            valuePropName="checked"
                            noStyle
                          >
                            <Switch
                              checkedChildren="常量"
                              unCheckedChildren="非常量"
                            />
                          </Form.Item>
                          <Form.Item
                            name="affix"
                            valuePropName="checked"
                            noStyle
                          >
                            <Switch
                              checkedChildren="固定"
                              unCheckedChildren="不固定"
                            />
                          </Form.Item>
                        </Space>
                      </Form.Item>
                    </Space>
                  ),
                },
              ]}
            />
          </Form>
        </Modal>
      </div>
    </App>
  );
};

export default MenuPage;
