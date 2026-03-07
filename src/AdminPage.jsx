import React, { useState, useEffect } from 'react';
import { Table, Layout, Typography, Card, Tag, message } from 'antd';
import axios from 'axios';

const { Content } = Layout;
const { Title } = Typography;

const AdminPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!API_URL) {
      console.error("Thiếu REACT_APP_API_URL trong file .env");
      return;
    }

    setLoading(true);
    // Gọi API với mật mã tiep123
    axios.get(`${API_URL}?action=admin&key=tiep123`)
      .then(res => {
        // CHỐT CHẶN: Chỉ set data nếu kết quả trả về là một Mảng
        if (Array.isArray(res.data)) {
          setData(res.data);
        } else {
          setData([]);
          message.error("Dữ liệu Admin không đúng định dạng!");
        }
      })
      .catch((err) => {
        console.log("Lỗi truy cập Admin:", err);
        message.error("Không thể kết nối đến máy chủ quản trị.");
      })
      .finally(() => setLoading(false));
  }, [API_URL]);

  const columns = [
    { 
      title: 'Người nhận', 
      dataIndex: 'recipient', 
      key: 'recipient', 
      render: (t) => <Tag color="blue">{t}</Tag> 
    },
    { title: 'Người gửi', dataIndex: 'sender', key: 'sender' },
    { title: 'Tiêu đề', dataIndex: 'subject', key: 'subject' },
    { 
      title: 'Thời gian', 
      dataIndex: 'received_at', 
      key: 'received_at', 
      render: (d) => d ? new Date(d).toLocaleString() : "N/A" 
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', padding: '20px', background: '#f0f2f5' }}>
      <Content>
        <Card title={<Title level={2}>Hệ thống Quản trị Email Toàn cục</Title>}>
          <Table 
            dataSource={data} 
            columns={columns} 
            rowKey="id" 
            loading={loading}
            locale={{ emptyText: "Không có dữ liệu email nào trong hệ thống." }}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default AdminPage;