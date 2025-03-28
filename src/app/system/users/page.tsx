"use client";

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import request from '@/utils/request';

interface UserItem {
  id: number;
  username: string;
  nickname: string;
  email: string;
  phone?: string;
  status: number;
  createTime: string;
  updateTime: string;
  roles: { id: number; name: string }[];
}

const UserPage: React.FC = () => {
  const [data, setData] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await request.get('/api/users');
      console.log('用户数据:', response.data);
      // 处理分页数据格式
      const userData = response.data?.list || response.data || [];
      console.log('处理后的用户数据:', userData);
      setData(userData);
    } catch (error) {
      console.error('获取用户数据失败:', error);
      message.error('获取用户数据失败');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await request.get('/api/roles');
      console.log('角色数据:', response.data);
      // 处理分页数据格式
      const roleData = response.data?.list || response.data || [];
      console.log('处理后的角色数据:', roleData);
      setRoles(roleData);
    } catch (error) {
      console.error('获取角色数据失败:', error);
      message.error('获取角色数据失败');
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchRoles();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: UserItem) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      roleIds: record.roles.map(role => role.id),
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/api/users/${id}`);
      message.success('删除成功');
      fetchData();
    } catch {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await request.put(`/api/users/${editingId}`, values);
        message.success('更新成功');
      } else {
        await request.post('/api/users', values);
        message.success('添加成功');
      }
      setModalVisible(false);
      fetchData();
    } catch {
      message.error('操作失败');
    }
  };

  const columns: ColumnsType<UserItem> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: '15%',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: '15%',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: '20%',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: '15%',
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      width: '15%',
      render: (roles: { id: number; name: string }[]) => (
        <Space>
          {roles.map(role => (
            <Tag key={role.id} color="blue">{role.name}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status: number) => (
        <Tag color={status === 1 ? 'success' : 'error'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: '10%',
      render: (_, record) => (
        <Space size="middle">
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
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          添加用户
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title={editingId ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="roleIds"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择角色"
              options={roles.map(role => ({
                label: role.name,
                value: role.id,
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

export default UserPage; 