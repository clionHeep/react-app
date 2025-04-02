import React, { useState } from 'react';
import { Button, Input, Popover, Space } from 'antd';
import * as Icons from '@ant-design/icons';
import type { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';

interface IconPickerProps {
  value?: string;
  onChange?: (value: string) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  const [searchText, setSearchText] = useState('');
  const [visible, setVisible] = useState(false);

  const getIconComponent = (iconName: string) => {
    if (!iconName) return null;
    const IconComponent = (
      Icons as unknown as Record<string, React.ComponentType<AntdIconProps>>
    )[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  const iconList = Object.keys(Icons)
    .filter((key) => key.endsWith('Outlined'))
    .filter((key) => key.toLowerCase().includes(searchText.toLowerCase()));

  const content = (
    <div style={{ width: 300 }}>
      <Input
        placeholder="搜索图标"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <div style={{ height: 300, overflow: 'auto' }}>
        <Space wrap>
          {iconList.map((key) => {
            const IconComponent = (
              Icons as unknown as Record<string, React.ComponentType<AntdIconProps>>
            )[key];
            return (
              <Button
                key={key}
                type={value === key ? 'primary' : 'text'}
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
      <Button>{value ? getIconComponent(value) : '选择图标'}</Button>
    </Popover>
  );
};

export default IconPicker; 