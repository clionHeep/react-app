import React from 'react';

const StaticLoadingPlaceholder: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
      }}
    >
      <div
        style={{
          padding: "12px 20px",
          fontSize: "14px",
          color: "#1890ff",
        }}
      >
        加载中...
      </div>
    </div>
  );
};

export default StaticLoadingPlaceholder; 