import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Card, Button, List, Typography, message, Badge, Space, Divider, Popconfirm, Switch } from 'antd';
import { CopyOutlined, ReloadOutlined, DeleteOutlined, SwapOutlined, MailOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons';
import axios from 'axios';
import DOMPurify from 'dompurify'; // Thư viện làm sạch HTML
import styled, { keyframes, createGlobalStyle } from 'styled-components'; // Để tạo hiệu ứng tuyết rơi

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const API_ENDPOINT = process.env.REACT_APP_API_URL;

// --- ❄️ HIỆU ỨNG TUYẾT RƠI (SNOWFLAKES) ---
const snowfall = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(110vh); }
`;

const SnowflakeContainer = styled.div`
  position: fixed;
  top: -10px;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
`;

const Snowflake = styled.div`
  position: absolute;
  color: #fff;
  opacity: 0.8;
  animation: ${snowfall} linear infinite;
`;

const GlobalStyle = createGlobalStyle`
  body {
    overflow-x: hidden;
  }
`;

function App() {
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // Trạng thái Dark Mode
  const lastEmailCount = useRef(0);

  // Tạo bông tuyết
  const createSnowflakes = () => {
    const snowflakes = [];
    for (let i = 0; i < 50; i++) {
      const style = {
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 5 + 5}s`,
        animationDelay: `${Math.random() * 5}s`,
        fontSize: `${Math.random() * 10 + 10}px`
      };
      snowflakes.push(<Snowflake key={i} style={style}>❄</Snowflake>);
    }
    return snowflakes;
  };

  const createRandomEmail = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    return `${randomId}@tiepln.id.vn`;
  };

  // Hàm phát tiếng "Ting"
  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log("Trình duyệt chặn tự động phát âm thanh"));
  };

  const deleteInbox = async (targetEmail) => {
    try {
      await axios.get(`${API_ENDPOINT}?addr=${targetEmail}&action=delete`);
    } catch (err) {
      console.error("Lỗi khi xóa thư cũ");
    }
  };

  const handleRefreshEmail = async () => {
    setLoading(true);
    await deleteInbox(email); // Xóa thư cũ trước khi đổi
    const newMail = createRandomEmail();
    setEmail(newMail);
    setEmails([]);
    lastEmailCount.current = 0;
    message.success("Đã đổi địa chỉ mới và dọn dẹp thư cũ!");
    setLoading(false);
  };

  const handleClearInbox = async () => {
    setLoading(true);
    await deleteInbox(email);
    setEmails([]);
    lastEmailCount.current = 0;
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
      const newEmails = res.data;
      
      // Kiểm tra nếu có mail mới thì phát âm thanh
      if (newEmails.length > lastEmailCount.current) {
        playNotificationSound();
        message.info("Bạn có thư mới!");
      }
      
      setEmails(newEmails);
      lastEmailCount.current = newEmails.length;
    } catch (err) { /* silent error */ }
  }, [email]);

  // Tự động làm mới mỗi 10 giây
  useEffect(() => {
    fetchEmails();
    const interval = setInterval(fetchEmails, 10000);
    return () => clearInterval(interval);
  }, [fetchEmails]);

  // Cấu hình giao diện Dark/Light
  const layoutStyle = darkMode ? {
    minHeight: '100vh', background: '#141414', transition: 'all 0.3s'
  } : {
    minHeight: '100vh', background: '#f0f2f5', transition: 'all 0.3s'
  };

  const cardStyle = darkMode ? {
    textAlign: 'center', borderRadius: '12px', background: '#1f1f1f', border: '1px solid #303030', transition: 'all 0.3s'
  } : {
    textAlign: 'center', borderRadius: '12px', background: '#fff', border: '1px solid #e8e8e8', transition: 'all 0.3s'
  };

  const textType = darkMode ? { color: 'rgba(255, 255, 255, 0.65)' } : { color: 'rgba(0, 0, 0, 0.45)' };
  const titleColor = darkMode ? { color: '#fff' } : { color: '#000' };

  return (
    <>
      <GlobalStyle />
      {/* ❄️ Hiệu ứng tuyết rơi chỉ hiện khi ở chế độ Light Mode */}
      {!darkMode && (
        <SnowflakeContainer>
          {createSnowflakes()}
        </SnowflakeContainer>
      )}

      <Layout style={layoutStyle}>
        <Header style={{ background: darkMode ? '#1f1f1f' : '#001529', textAlign: 'center', transition: 'all 0.3s' }}>
          <Space>
            <Title level={3} style={{ color: '#fff', margin: '15px 0' }}>Temp Mail Premium</Title>
            <Divider type="vertical" />
            {/* 💡 Công tắc chuyển đổi Dark Mode */}
            <Switch
              checked={darkMode}
              onChange={(checked) => {
                setDarkMode(checked);
                // Kích hoạt âm thanh một lần để trình duyệt cấp quyền
                playNotificationSound(); 
                message.info(checked ? "Đã bật chế độ tối" : "Đã bật chế độ sáng");
              }}
              checkedChildren={<BulbFilled />}
              unCheckedChildren={<BulbOutlined />}
            />
          </Space>
        </Header>
        
        <Content style={{ padding: '30px', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
          <Card style={cardStyle}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary" style={textType}>Địa chỉ của bạn (Thư sẽ tự xóa khi bạn đổi địa chỉ):</Text>
              <Title level={2} copyable={{ text: email }} style={titleColor}>{email}</Title>
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

          <Divider orientation="left" style={titleColor}>Hộp thư đến <Badge count={emails.length} /></Divider>

          <List
            dataSource={emails}
            renderItem={(item) => (
              <Card style={{ marginBottom: '12px', background: darkMode ? '#1f1f1f' : '#fff', border: darkMode ? '1px solid #303030' : '1px solid #e8e8e8', transition: 'all 0.3s' }} size="small" title={<Text strong style={titleColor}>Từ: {item.sender}</Text>}>
                <Text strong style={titleColor}>{item.subject}</Text>
                {/* 🛡️ Hiển thị HTML an toàn */}
                <div 
                  style={{ 
                    marginTop: '8px', 
                    padding: '15px', 
                    background: darkMode ? '#141414' : '#fafafa', 
                    border: darkMode ? '1px solid #303030' : '1px solid #eee', 
                    borderRadius: '8px',
                    color: darkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
                    transition: 'all 0.3s'
                  }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.content) }} 
                />
                <Text type="secondary" style={{ ...textType, fontSize: '12px' }}>Nhận lúc: {new Date(item.received_at).toLocaleString()}</Text>
              </Card>
            )}
            locale={{ emptyText: <Text style={textType}>Đang chờ thư mới...</Text> }}
          />
        </Content>
      </Layout>
    </>
  );
}
export default App;