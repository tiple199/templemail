import React, { useState, useEffect } from 'react';
import { Table, Layout, Typography, Card, Tag } from 'antd';
import axios from 'axios';

const { Content } = Layout;
const { Title } = Typography;

const AdminPage = () => {
  const [data, setData] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Gọi API với action=admin và mật mã bí mật
    axios.get(`${API_URL}?action=admin&key=tiep123`)
      .then(res => setData(res.data))
      .catch(() => console.log("Lỗi truy cập Admin"));
  }, [API_URL]);

  const columns = [
    { title: 'Người nhận', dataIndex: 'recipient', key: 'recipient', render: (t) => <Tag color="blue">{t}</Tag> },
    { title: 'Người gửi', dataIndex: 'sender', key: 'sender' },
    { title: 'Tiêu đề', dataIndex: 'subject', key: 'subject' },
    { title: 'Thời gian', dataIndex: 'received_at', key: 'received_at', render: (d) => new Date(d).toLocaleString() },
  ];

  return (
    <Layout style={{ minHeight: '100vh', padding: '20px', background: '#f0f2f5' }}>
      <Content>
        <Card title={<Title level={2}>Hệ thống Quản trị Email Toàn cục</Title>}>
          <Table dataSource={data} columns={columns} rowKey="id" />
        </Card>
      </Content>
    </Layout>
  );
};

export default AdminPage;