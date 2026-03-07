import React, { useState, useEffect, useMemo } from 'react';
import { Table, Layout, Typography, Card, Tag, message, Button, Input, Space, Popconfirm } from 'antd';
import { DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Content } = Layout;
const { Title } = Typography;

const AdminPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(''); // State cho bộ lọc
  const API_URL = process.env.REACT_APP_API_URL;
  const ADMIN_KEY = "tiep123";

  const fetchData = async () => {
    if (!API_URL) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?action=admin&key=${ADMIN_KEY}`);
      if (Array.isArray(res.data)) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (err) {
      message.error("Lỗi tải dữ liệu admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API_URL]);

  // Hàm xóa tất cả dữ liệu
  const handleDeleteAll = async () => {
    try {
      await axios.get(`${API_URL}?action=deleteAll&key=${ADMIN_KEY}`);
      message.success("Đã xóa sạch toàn bộ cơ sở dữ liệu!");
      setData([]); // Cập nhật lại giao diện ngay lập tức
    } catch (err) {
      message.error("Không thể xóa dữ liệu");
    }
  };

  // Logic lọc dữ liệu theo tên người nhận
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.recipient?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  const columns = [
    { 
      title: 'Người nhận', 
      dataIndex: 'recipient', 
      key: 'recipient', 
      render: (t) => <Tag color="blue">{t}</Tag>,
      // Thêm tính năng lọc tại cột
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm email nhận..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
        </div>
      ),
      filterIcon: () => <SearchOutlined style={{ color: searchText ? '#1890ff' : undefined }} />
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
        <Card 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <Title level={3} style={{ margin: 0 }}>Quản trị Hệ thống Email</Title>
              <Space>
                <Input 
                  placeholder="Lọc nhanh người nhận..." 
                  prefix={<SearchOutlined />} 
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  allowClear
                  style={{ width: 250 }}
                />
                <Button icon={<ReloadOutlined />} onClick={fetchData}>Làm mới</Button>
                <Popconfirm
                  title="CẢNH BÁO: Xóa toàn bộ database?"
                  onConfirm={handleDeleteAll}
                  okText="Xóa hết"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger type="primary" icon={<DeleteOutlined />}>Xóa tất cả</Button>
                </Popconfirm>
              </Space>
            </div>
          }
        >
          <Table 
            dataSource={filteredData} 
            columns={columns} 
            rowKey="id" 
            loading={loading}
            pagination={{ pageSize: 15 }}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default AdminPage;