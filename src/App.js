import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Card, Button, List, Typography, message, Badge, Space, Divider, Popconfirm } from 'antd';
import { CopyOutlined, ReloadOutlined, DeleteOutlined, SwapOutlined, MailOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const API_ENDPOINT = process.env.REACT_APP_API_URL;

function App() {
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  const createRandomEmail = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    return `${randomId}@tiepln.id.vn`;
  };

  // Hàm xóa hộp thư trên Server
  const deleteInbox = async (targetEmail) => {
    try {
      await axios.get(`${API_ENDPOINT}?addr=${targetEmail}&action=delete`);
    } catch (err) {
      console.error("Lỗi khi xóa thư cũ");
    }
  };

  // Nút Đổi Email mới
  const handleRefreshEmail = async () => {
    setLoading(true);
    await deleteInbox(email); // Xóa thư cũ trước khi đổi
    const newMail = createRandomEmail();
    setEmail(newMail);
    setEmails([]);
    message.success("Đã đổi địa chỉ mới và dọn dẹp thư cũ!");
    setLoading(false);
  };

  // Nút Xóa sạch hộp thư hiện tại
  const handleClearInbox = async () => {
    setLoading(true);
    await deleteInbox(email);
    setEmails([]);
    message.warning("Đã xóa sạch hộp thư!");
    setLoading(false);
  };

  useEffect(() => {
    setEmail(createRandomEmail());
  }, []);

  const fetchEmails = useCallback(async () => {
    if (!email) return;
    try {
      const res = await axios.get(`${API_ENDPOINT}?addr=${email}`);
      setEmails(res.data);
    } catch (err) { /* silent error */ }
  }, [email]);

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(fetchEmails, 10000);
    return () => clearInterval(interval);
  }, [fetchEmails]);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ background: '#001529', textAlign: 'center' }}>
        <Title level={3} style={{ color: '#fff', margin: '15px 0' }}>Temp Mail Premium - tiepln.id.vn</Title>
      </Header>
      
      <Content style={{ padding: '30px', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
        <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary">Địa chỉ của bạn (Thư sẽ tự xóa khi bạn đổi địa chỉ):</Text>
            <Title level={2} copyable={{ text: email }}>{email}</Title>
            <Space wrap>
              <Button type="primary" size="large" icon={<CopyOutlined />} onClick={() => {
                navigator.clipboard.writeText(email);
                message.success("Đã copy!");
              }}>Sao chép</Button>
              
              <Button size="large" icon={<SwapOutlined />} onClick={handleRefreshEmail} loading={loading}>Đổi địa chỉ mới</Button>
              
              <Popconfirm title="Xóa toàn bộ thư trong hộp này?" onConfirm={handleClearInbox} okText="Xóa" cancelText="Hủy">
                <Button size="large" danger icon={<DeleteOutlined />}>Xóa hộp thư</Button>
              </Popconfirm>

              <Button size="large" icon={<ReloadOutlined />} onClick={fetchEmails} loading={loading}>Làm mới</Button>
            </Space>
          </Space>
        </Card>

        <Divider orientation="left">Hộp thư đến <Badge count={emails.length} /></Divider>

        <List
          dataSource={emails}
          renderItem={(item) => (
            <Card style={{ marginBottom: '12px' }} size="small" title={`Từ: ${item.sender}`}>
              <Text strong>{item.subject}</Text>
              <div style={{ marginTop: '8px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                {item.content}
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>Nhận lúc: {new Date(item.received_at).toLocaleString()}</Text>
            </Card>
          )}
          locale={{ emptyText: 'Đang chờ thư mới...' }}
        />
      </Content>
    </Layout>
  );
}
export default App;