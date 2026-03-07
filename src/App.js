import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Card, Button, List, Typography, message, Badge, Space, Divider, Popconfirm, Switch, Slider, Spin } from 'antd';
import { CopyOutlined, ReloadOutlined, DeleteOutlined, SwapOutlined, BulbOutlined, BulbFilled, SoundOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import DOMPurify from 'dompurify';
import styled, { keyframes, createGlobalStyle } from 'styled-components';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const API_ENDPOINT = process.env.REACT_APP_API_URL;

// --- ❄️ HIỆU ỨNG TUYẾT RƠI ---
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

// Icon xoay cho Loading
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function App() {
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false); // State riêng cho việc load danh sách mail
  
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true'); 
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('appVolume')) || 0.2);
  
  const lastEmailCount = useRef(0);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('appVolume', volume);
  }, [volume]);

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

  const playNotificationSound = useCallback(() => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
    audio.volume = volume; 
    audio.play().catch(e => console.log("Trình duyệt chặn phát âm thanh"));
  }, [volume]);

  const deleteInbox = async (targetEmail) => {
    try {
      await axios.get(`${API_ENDPOINT}?addr=${targetEmail}&action=delete`);
    } catch (err) {
      console.error("Lỗi khi xóa thư cũ");
    }
  };

  const handleRefreshEmail = async () => {
    setLoading(true);
    await deleteInbox(email);
    const newMail = createRandomEmail();
    setEmail(newMail);
    setEmails([]);
    lastEmailCount.current = 0;
    message.success("Đã đổi địa chỉ mới!");
    setLoading(false);
  };

  const handleClearInbox = async () => {
    setLoading(true);
    await deleteInbox(email);
    setEmails([]);
    lastEmailCount.current = 0;
    message.warning("Hộp thư đã trống!");
    setLoading(false);
  };

  useEffect(() => {
    setEmail(createRandomEmail());
  }, []);

  const fetchEmails = useCallback(async (isManual = false) => {
    if (!email) return;
    if (isManual) setFetching(true); // Chỉ hiện xoay khi bấm nút hoặc đổi mail
    try {
      const res = await axios.get(`${API_ENDPOINT}?addr=${email}`);
      const newEmails = res.data;
      
      if (newEmails.length > lastEmailCount.current) {
        playNotificationSound();
        message.info("Bạn có thư mới!");
      }
      
      setEmails(newEmails);
      lastEmailCount.current = newEmails.length;
    } catch (err) { /* silent */ }
    setFetching(false);
  }, [email, playNotificationSound]);

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(() => fetchEmails(false), 10000);
    return () => clearInterval(interval);
  }, [fetchEmails]);

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
      {!darkMode && (
        <SnowflakeContainer>
          {createSnowflakes()}
        </SnowflakeContainer>
      )}

      <Layout style={layoutStyle}>
        <Header style={{ 
          background: darkMode ? '#1f1f1f' : '#001529', 
          textAlign: 'center', 
          transition: 'all 0.3s',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 20px',
          height: 'auto',
          flexWrap: 'wrap'
        }}>
          <Space size="large" style={{ padding: '10px 0' }}>
            <Title level={3} style={{ color: '#fff', margin: 0 }}>Temp Mail Premium</Title>
            
            <Divider type="vertical" style={{ background: '#444' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', width: '120px' }}>
              <SoundOutlined style={{ color: '#fff', marginRight: 8 }} />
              <Slider 
                min={0} max={1} step={0.01} 
                value={volume} onChange={setVolume} 
                style={{ flex: 1 }}
                tooltip={{ formatter: (val) => `${Math.round(val * 100)}%` }}
              />
            </div>

            <Divider type="vertical" style={{ background: '#444' }} />

            <Switch
              checked={darkMode}
              onChange={(checked) => {
                setDarkMode(checked);
                playNotificationSound(); 
              }}
              checkedChildren={<BulbFilled />}
              unCheckedChildren={<BulbOutlined />}
            />
          </Space>
        </Header>
        
        <Content style={{ padding: '30px', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
          <Card style={cardStyle} loading={loading}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary" style={textType}>Địa chỉ của bạn:</Text>
              <Title level={2} copyable={{ text: email }} style={titleColor}>{email}</Title>
              <Space wrap>
                <Button type="primary" size="large" icon={<CopyOutlined />} onClick={() => {
                  navigator.clipboard.writeText(email);
                  message.success("Đã copy!");
                  playNotificationSound(); 
                }}>Sao chép</Button>
                
                <Button size="large" icon={<SwapOutlined />} onClick={handleRefreshEmail} loading={loading}>Đổi địa chỉ</Button>
                
                <Popconfirm title="Xóa hộp thư?" onConfirm={handleClearInbox} okText="Xóa" cancelText="Hủy">
                  <Button size="large" danger icon={<DeleteOutlined />}>Xóa hộp thư</Button>
                </Popconfirm>

                <Button size="large" icon={<ReloadOutlined />} onClick={() => fetchEmails(true)} loading={fetching}>Làm mới</Button>
              </Space>
            </Space>
          </Card>

          <Divider orientation="left" style={titleColor}>
            Hộp thư đến <Badge count={emails.length} style={{ marginLeft: 8 }} />
          </Divider>

          {/* Hiệu ứng xoay khi tải danh sách mail */}
          <Spin spinning={fetching} indicator={antIcon} tip="Đang kiểm tra thư mới...">
            <List
              dataSource={emails}
              renderItem={(item) => (
                <Card 
                  style={{ 
                    marginBottom: '12px', 
                    background: darkMode ? '#1f1f1f' : '#fff', 
                    border: darkMode ? '1px solid #303030' : '1px solid #e8e8e8' 
                  }} 
                  size="small" 
                  title={<Text strong style={titleColor}>Từ: {item.sender}</Text>}
                >
                  <Text strong style={titleColor}>{item.subject}</Text>
                  <div 
                    style={{ 
                      marginTop: '8px', padding: '15px', 
                      background: darkMode ? '#141414' : '#fafafa', 
                      border: darkMode ? '1px solid #303030' : '1px solid #eee', 
                      borderRadius: '8px',
                      color: darkMode ? '#d9d9d9' : '#333',
                      overflowX: 'auto'
                    }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.content) }} 
                  />
                  <Text type="secondary" style={{ ...textType, fontSize: '12px', marginTop: 8, display: 'block' }}>
                    Nhận lúc: {new Date(item.received_at).toLocaleString()}
                  </Text>
                </Card>
              )}
              locale={{ emptyText: <Text style={textType}>Hộp thư đang trống...</Text> }}
            />
          </Spin>
        </Content>
      </Layout>
    </>
  );
}
export default App;