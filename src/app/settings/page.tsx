'use client';

import React, { useState } from 'react';

export default function SettingsPage() {
  // 模拟系统设置数据
  const [generalSettings, setGeneralSettings] = useState({
    siteName: '管理系统',
    siteDescription: '一个现代的管理系统平台',
    adminEmail: 'admin@example.com',
    recordsPerPage: 10,
    allowRegistration: true,
    maintenanceMode: false,
    defaultLanguage: 'zh_CN',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
  });
  
  // 安全设置
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30, // 分钟
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireNumber: true,
    passwordRequireUppercase: true,
    maxLoginAttempts: 5,
    twoFactorAuth: false,
    allowedIpRanges: '*'
  });
  
  // 备份设置
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily', // daily, weekly, monthly
    backupTime: '02:00',
    keepBackups: 7,
    backupIncludeFiles: true,
    backupIncludeDatabase: true,
    backupLocation: 'local'
  });
  
  // 处理一般设置更改
  const handleGeneralSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) : value
    });
  };
  
  // 处理安全设置更改
  const handleSecuritySettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setSecuritySettings({
      ...securitySettings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) : value
    });
  };
  
  // 处理备份设置更改
  const handleBackupSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setBackupSettings({
      ...backupSettings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };
  
  // 处理设置保存
  const handleSaveSettings = () => {
    // 在实际应用中，这里会发送请求保存设置
    alert('设置已保存');
  };
  
  // 处理设置重置
  const handleResetSettings = () => {
    if (confirm('确定要重置所有设置为默认值吗？')) {
      // 在实际应用中，这里会发送请求重置设置
      alert('设置已重置为默认值');
    }
  };
  
  // 处理立即备份
  const handleImmediateBackup = () => {
    // 模拟备份过程
    alert('系统备份已开始，请稍后查看备份状态');
  };

  return (
    <div style={{ padding: 24, borderRadius: 8 }}>
      <h1>系统设置</h1>
      <p>管理和配置系统的各项功能与参数</p>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: 24,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <button style={{
            padding: '8px 16px',
            background: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }} onClick={handleSaveSettings}>
            保存设置
          </button>
          
          <button style={{
            padding: '8px 16px',
            background: 'white',
            color: '#ff4d4f',
            border: '1px solid #ff4d4f',
            borderRadius: '4px',
            cursor: 'pointer'
          }} onClick={handleResetSettings}>
            重置设置
          </button>
        </div>
      </div>
      
      <div style={{ 
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        marginBottom: '24px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>基本设置</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>站点名称</label>
            <input
              type="text"
              name="siteName"
              value={generalSettings.siteName}
              onChange={handleGeneralSettingChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>管理员邮箱</label>
            <input
              type="email"
              name="adminEmail"
              value={generalSettings.adminEmail}
              onChange={handleGeneralSettingChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>站点描述</label>
            <input
              type="text"
              name="siteDescription"
              value={generalSettings.siteDescription}
              onChange={handleGeneralSettingChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>每页记录数</label>
            <input
              type="number"
              name="recordsPerPage"
              value={generalSettings.recordsPerPage}
              onChange={handleGeneralSettingChange}
              min="5"
              max="100"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>默认语言</label>
            <select
              name="defaultLanguage"
              value={generalSettings.defaultLanguage}
              onChange={handleGeneralSettingChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9'
              }}
            >
              <option value="zh_CN">简体中文</option>
              <option value="en_US">English (US)</option>
              <option value="ja_JP">日本語</option>
              <option value="ko_KR">한국어</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>日期格式</label>
            <select
              name="dateFormat"
              value={generalSettings.dateFormat}
              onChange={handleGeneralSettingChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9'
              }}
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY年MM月DD日">YYYY年MM月DD日</option>
            </select>
          </div>
        </div>
        
        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="allowRegistration"
              checked={generalSettings.allowRegistration}
              onChange={handleGeneralSettingChange}
              style={{ marginRight: 8 }}
            />
            允许用户注册
          </label>
        </div>
        
        <div style={{ marginTop: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={generalSettings.maintenanceMode}
              onChange={handleGeneralSettingChange}
              style={{ marginRight: 8 }}
            />
            启用维护模式（仅管理员可访问）
          </label>
        </div>
      </div>
      
      <div style={{ 
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        marginBottom: '24px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>安全设置</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>会话超时时间（分钟）</label>
            <input
              type="number"
              name="sessionTimeout"
              value={securitySettings.sessionTimeout}
              onChange={handleSecuritySettingChange}
              min="5"
              max="1440"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>密码最小长度</label>
            <input
              type="number"
              name="passwordMinLength"
              value={securitySettings.passwordMinLength}
              onChange={handleSecuritySettingChange}
              min="6"
              max="32"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>最大登录尝试次数</label>
            <input
              type="number"
              name="maxLoginAttempts"
              value={securitySettings.maxLoginAttempts}
              onChange={handleSecuritySettingChange}
              min="1"
              max="10"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>允许的IP范围</label>
            <input
              type="text"
              name="allowedIpRanges"
              value={securitySettings.allowedIpRanges}
              onChange={handleSecuritySettingChange}
              placeholder="例如: 192.168.1.* 或 * 表示所有"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9'
              }}
            />
          </div>
        </div>
        
        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="passwordRequireSpecial"
              checked={securitySettings.passwordRequireSpecial}
              onChange={handleSecuritySettingChange}
              style={{ marginRight: 8 }}
            />
            密码需要包含特殊字符
          </label>
        </div>
        
        <div style={{ marginTop: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="passwordRequireNumber"
              checked={securitySettings.passwordRequireNumber}
              onChange={handleSecuritySettingChange}
              style={{ marginRight: 8 }}
            />
            密码需要包含数字
          </label>
        </div>
        
        <div style={{ marginTop: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="passwordRequireUppercase"
              checked={securitySettings.passwordRequireUppercase}
              onChange={handleSecuritySettingChange}
              style={{ marginRight: 8 }}
            />
            密码需要包含大写字母
          </label>
        </div>
        
        <div style={{ marginTop: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="twoFactorAuth"
              checked={securitySettings.twoFactorAuth}
              onChange={handleSecuritySettingChange}
              style={{ marginRight: 8 }}
            />
            启用两因素认证
          </label>
        </div>
      </div>
      
      <div style={{ 
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        marginBottom: '24px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ 
          marginTop: 0, 
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>备份设置</span>
          <button style={{
            padding: '6px 12px',
            background: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }} onClick={handleImmediateBackup}>
            立即备份
          </button>
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>备份频率</label>
            <select
              name="backupFrequency"
              value={backupSettings.backupFrequency}
              onChange={handleBackupSettingChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9'
              }}
            >
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>备份时间</label>
            <input
              type="time"
              name="backupTime"
              value={backupSettings.backupTime}
              onChange={handleBackupSettingChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>保留备份数量</label>
            <input
              type="number"
              name="keepBackups"
              value={backupSettings.keepBackups}
              onChange={handleBackupSettingChange}
              min="1"
              max="30"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>备份存储位置</label>
            <select
              name="backupLocation"
              value={backupSettings.backupLocation}
              onChange={handleBackupSettingChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9'
              }}
            >
              <option value="local">本地存储</option>
              <option value="cloud">云存储</option>
              <option value="both">本地和云存储</option>
            </select>
          </div>
        </div>
        
        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="autoBackup"
              checked={backupSettings.autoBackup}
              onChange={handleBackupSettingChange}
              style={{ marginRight: 8 }}
            />
            启用自动备份
          </label>
        </div>
        
        <div style={{ marginTop: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="backupIncludeFiles"
              checked={backupSettings.backupIncludeFiles}
              onChange={handleBackupSettingChange}
              style={{ marginRight: 8 }}
            />
            备份包含文件
          </label>
        </div>
        
        <div style={{ marginTop: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="backupIncludeDatabase"
              checked={backupSettings.backupIncludeDatabase}
              onChange={handleBackupSettingChange}
              style={{ marginRight: 8 }}
            />
            备份包含数据库
          </label>
        </div>
      </div>
    </div>
  );
} 