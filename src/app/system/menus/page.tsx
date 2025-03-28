"use client";

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import request from '@/utils/request';
import * as Icons from '@ant-design/icons';
import type { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';

interface MenuItem {
  id: number;
  name: string;
  path: string;
  icon?: string;
  parentId?: number;
  sort: number;
  children?: MenuItem[];
}

const MenuPage: React.FC = () => {
  const [data, setData] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await request.get('/api/menus');
      console.log('菜单数据:', response.data);
      // 处理分页数据格式
      const menuData = response.data?.list || response.data || [];
      console.log('处理后的菜单数据:', menuData);
      setData(menuData);
    } catch (error) {
      console.error('获取菜单数据失败:', error);
      message.error('获取菜单数据失败');
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
        await request.put(`/api/menus/${editingId}`, values);
        message.success('更新成功');
      } else {
        await request.post('/api/menus', values);
        message.success('添加成功');
      }
      setModalVisible(false);
      fetchData();
    } catch {
      message.error('操作失败');
    }
  };

  const getIconComponent = (iconName: string) => {
    if (!iconName) return null;
    const IconComponent = (Icons as unknown as Record<string, React.ComponentType<AntdIconProps>>)[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  const columns: ColumnsType<MenuItem> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      width: '20%',
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: '15%',
      render: (icon: string) => getIconComponent(icon),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: '10%',
    },
    {
      title: '操作',
      key: 'action',
      width: '20%',
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
          添加菜单
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
        title={editingId ? '编辑菜单' : '添加菜单'}
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
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入菜单名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="path"
            label="路径"
            rules={[{ required: true, message: '请输入菜单路径' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="icon"
            label="图标"
          >
            <Select
              showSearch
              placeholder="选择图标"
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
            >
              {Object.keys(Icons)
                .filter(key => key.endsWith('Outlined'))
                .map(key => (
                  <Select.Option key={key} value={key} label={key}>
                    {getIconComponent(key)} {key}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="sort"
            label="排序"
            rules={[{ required: true, message: '请输入排序号' }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuPage;