"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Tag,
  TreeSelect,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { Role, Menu } from "@/types/api";
import { RoleService } from "@/api/role";
import { MenuService } from "@/api/menu";
import type { TablePaginationConfig } from "antd/es/table";

const RoleManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [roles, setRoles] = useState<Role[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 获取角色列表
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await RoleService.getList({
        page: pagination.current || 1,
        pageSize: pagination.pageSize || 10,
      });
      console.log("角色数据原始响应:", response);

      // 确保数据是数组格式
      let roleData: Role[] = [];

      // 处理响应数据
      if (response?.data) {
        const data = response.data;
        // 如果数据是分页格式
        if (data.list && Array.isArray(data.list)) {
          roleData = data.list;
          setPagination((prev) => ({
            ...prev,
            total: data.total || roleData.length,
          }));
        }
        // 如果数据直接是数组
        else if (Array.isArray(data)) {
          roleData = data;
          setPagination((prev) => ({
            ...prev,
            total: roleData.length,
          }));
        }
      }

      console.log("处理后的角色数据:", roleData);
      setRoles(roleData);
    } catch (error) {
      console.error("获取角色数据失败:", error);
      message.error("获取角色数据失败");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取菜单树
  const fetchMenus = async () => {
    try {
      console.log("开始获取菜单树数据...");
      const response = await MenuService.getTree();
      console.log("菜单树数据原始响应:", response);

      // 确保数据是数组格式
      let menuData: Menu[] = [];
      if (Array.isArray(response)) {
        menuData = response;
      } else if (
        response &&
        typeof response === "object" &&
        "data" in response
      ) {
        // 处理可能的嵌套响应
        const data = (response as { data: Menu[] }).data;
        if (Array.isArray(data)) {
          menuData = data;
        }
      }

      console.log("处理后的菜单树数据:", menuData);
      setMenus(menuData);
    } catch (error) {
      console.error("获取菜单树数据失败:", error);
      message.error("获取菜单列表失败");
      setMenus([]);
    }
  };

  // 初始化数据
  useEffect(() => {
    console.log("组件挂载，开始初始化数据...");
    fetchData();
    fetchMenus();
  }, []); // 只在组件挂载时执行一次

  // 处理分页变化
  useEffect(() => {
    console.log("分页变化，重新获取角色数据...");
    fetchData();
  }, [pagination.current, pagination.pageSize]);

  // 表格列定义
  const columns = [
    {
      title: "角色名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "角色编码",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: number) => (
        <Tag color={status === 1 ? "success" : "error"}>
          {status === 1 ? "启用" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
    },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, record: Role) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 处理添加角色
  const handleAdd = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑角色
  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue(role);
    setModalVisible(true);
  };

  // 处理删除角色
  const handleDelete = async (role: Role) => {
    try {
      await RoleService.delete(role.id);
      message.success("删除成功");
      fetchData();
    } catch (error) {
      console.error("删除角色失败:", error);
    }
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        await RoleService.update(editingRole.id, values);
        message.success("更新成功");
      } else {
        await RoleService.create(values);
        message.success("添加成功");
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.error("提交角色数据失败:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加角色
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={roles}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={(pagination) => setPagination(pagination)}
      />

      <Modal
        title={editingRole ? "编辑角色" : "添加角色"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: "请输入角色名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="角色编码"
            rules={[{ required: true, message: "请输入角色编码" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: "请输入角色描述" }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="menuIds"
            label="菜单权限"
            rules={[{ required: true, message: "请选择菜单权限" }]}
          >
            <TreeSelect
              multiple
              placeholder="请选择菜单权限"
              treeData={menus.map((menu) => ({
                title: menu.name,
                value: menu.id,
                children: menu.children?.map((child) => ({
                  title: child.name,
                  value: child.id,
                })),
              }))}
            />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: "请选择状态" }]}
          >
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleManagement;
