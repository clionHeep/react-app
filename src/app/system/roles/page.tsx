"use client";

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag, TreeSelect } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Role, Menu } from '@/types/api';
import { getRoleList, createRole, updateRole, deleteRole } from '@/api/role';
import { getMenuTree } from '@/api/menu';
import type { TablePaginationConfig } from 'antd/es/table';

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
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await getRoleList({
        page: pagination.current || 1,
        pageSize: pagination.pageSize || 10,
      });
      console.log('角色数据:', response.data);
      // 处理分页数据格式
      const roleData = response.data?.list || response.data || [];
      console.log('处理后的角色数据:', roleData);
      setRoles(roleData as Role[]);
      setPagination(prev => ({
        ...prev,
        total: response.data?.total || 0,
      }));
    } catch (error: unknown) {
      console.error('获取角色数据失败:', error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('获取角色列表失败');
      }
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取菜单树
  const fetchMenus = async () => {
    try {
      const response = await getMenuTree();
      console.log('菜单树数据:', response.data);
      // 处理菜单树数据格式
      const menuData = response.data?.data || response.data || [];
      console.log('处理后的菜单树数据:', menuData);
      setMenus(menuData as Menu[]);
    } catch (error: unknown) {
      console.error('获取菜单树数据失败:', error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('获取菜单列表失败');
      }
      setMenus([]);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchMenus();
  }, [pagination.current, pagination.pageSize]);

  // 表格列定义
  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'success' : 'error'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
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
      await deleteRole(role.id);
      message.success('删除成功');
      fetchRoles();
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('删除失败');
      }
    }
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        await updateRole(editingRole.id, values);
        message.success('更新成功');
      } else {
        await createRole(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchRoles();
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('操作失败');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">角色管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
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
        title={editingRole ? '编辑角色' : '添加角色'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="角色编码"
            rules={[{ required: true, message: '请输入角色编码' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入角色描述' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="menuIds"
            label="菜单权限"
            rules={[{ required: true, message: '请选择菜单权限' }]}
          >
            <TreeSelect
              multiple
              placeholder="请选择菜单权限"
              treeData={menus.map(menu => ({
                title: menu.name,
                value: menu.id,
                children: menu.children?.map(child => ({
                  title: child.name,
                  value: child.id,
                })),
              }))}
            />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
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