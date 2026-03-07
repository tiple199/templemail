import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Card, Button, List, Typography, message, Badge, Space, Divider, Popconfirm, Switch, Slider, Spin, Modal, Input, Tooltip, Row, Col, Empty } from 'antd';
import { 
  CopyOutlined, ReloadOutlined, DeleteOutlined, SwapOutlined, 
  BulbOutlined, BulbFilled, SoundOutlined, LoadingOutlined,
  StarFilled, SaveOutlined, BookOutlined, EyeOutlined, PushpinOutlined, LogoutOutlined, MailOutlined
} from '@ant-design/icons';
import axios from 'axios';
import DOMPurify from 'dompurify';
import styled, { keyframes, createGlobalStyle } from 'styled-components';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const API_ENDPOINT = process.env.REACT_APP_API_URL;

const snowfall = keyframes`0% { transform: translateY(0); } 100% { transform: translateY(110vh); }`;
const SnowflakeContainer = styled.div`position: fixed; top: -10px; width: 100%; height: 100%; pointer-events: none; z-index: 1000;`;
const Snowflake = styled.div`position: absolute; color: #fff; opacity: 0.8; animation: ${snowfall} linear infinite;`;
const GlobalStyle = createGlobalStyle`body { overflow-x: hidden; }`;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function HomePage() {
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null); // State lưu thư đang được chọn để xem bên phải
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true'); 
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('appVolume')) || 0.2);
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('isPremium') === 'true');
  const [savedAddresses, setSavedAddresses] = useState(() => JSON.parse(localStorage.getItem('savedAddresses')) || []);
  const [archivedEmails, setArchivedEmails] = useState(() => JSON.parse(localStorage.getItem('archivedEmails')) || []);
  const [viewingArchive, setViewingArchive] = useState(null);
  const [premiumModal, setPremiumModal] = useState(false);
  const [premiumCode, setPremiumCode] = useState("");

  const lastEmailCount = useRef(0);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    localStorage.setItem('appVolume', volume);
    localStorage.setItem('isPremium', isPremium);
    localStorage.setItem('savedAddresses', JSON.stringify(savedAddresses));
    localStorage.setItem('archivedEmails', JSON.stringify(archivedEmails));
  }, [darkMode, volume, isPremium, savedAddresses, archivedEmails]);

  const createRandomEmail = () => `${Math.random().toString(36).substring(2, 8)}@tiepln.id.vn`;

  const playNotificationSound = useCallback(() => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
    audio.volume = volume; audio.play().catch(() => {});
  }, [volume]);

  // Tự động xóa khi refresh trang theo yêu cầu của bạn
  useEffect(() => {
    const initApp = async () => {
      const oldEmail = localStorage.getItem('currentEmail');
      if (oldEmail && API_ENDPOINT) {
        await axios.get(`${API_ENDPOINT}?addr=${oldEmail}&action=delete`).catch(() => {});
      }
      const newMail = createRandomEmail();
      setEmail(newMail);
      localStorage.setItem('currentEmail', newMail);
    };
    initApp();
  }, []);

  const fetchEmails = useCallback(async (isManual = false) => {
    if (!email) return;
    if (isManual) setFetching(true);
    try {
      const res = await axios.get(`${API_ENDPOINT}?addr=${email}`);
      if (res.data.length > lastEmailCount.current) {
        playNotificationSound();
        message.info("Bạn có thư mới! 📬");
      }
      setEmails(res.data);
      lastEmailCount.current = res.data.length;
    } catch (err) {}
    setFetching(false);
  }, [email, playNotificationSound]);

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(() => fetchEmails(false), 10000);
    return () => clearInterval(interval);
  }, [fetchEmails]);

  const cardStyle = { borderRadius: '12px', background: darkMode ? '#1f1f1f' : '#fff', border: darkMode ? '1px solid #303030' : '1px solid #e8e8e8', transition: '0.3s' };
  const titleColor = { color: darkMode ? '#fff' : '#000' };

  return (
    <>
      <GlobalStyle />
      {!darkMode && <SnowflakeContainer>{Array.from({length: 30}).map((_, i) => <Snowflake key={i} style={{ left: `${Math.random() * 100}%`, animationDuration: `${Math.random() * 5 + 5}s` }}>❄</Snowflake>)}</SnowflakeContainer>}
      <Layout style={{ minHeight: '100vh', background: darkMode ? '#141414' : '#f0f2f5', transition: '0.3s' }}>
        <Header style={{ background: darkMode ? '#1f1f1f' : '#001529', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 20px', height: 'auto' }}>
          <Space size="large">
            <Title level={3} style={{ color: '#fff', margin: 0 }}>Temp Mail {isPremium && <StarFilled style={{ color: '#fadb14' }} />}</Title>
            <Slider min={0} max={1} step={0.01} value={volume} onChange={setVolume} style={{ width: 80 }} />
            <Switch checked={darkMode} onChange={setDarkMode} checkedChildren={<BulbFilled />} unCheckedChildren={<BulbOutlined />} />
          </Space>
        </Header>

        <Content style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <Card style={{ ...cardStyle, textAlign: 'center', marginBottom: 20 }}>
            <Title level={2} copyable={{ text: email }} style={titleColor}>{email}</Title>
            <Space wrap>
              <Button type="primary" icon={<CopyOutlined />} onClick={() => { navigator.clipboard.writeText(email); message.success("Đã copy!"); }}>Sao chép</Button>
              <Button icon={<SwapOutlined />} onClick={async () => { setEmail(createRandomEmail()); setEmails([]); setSelectedEmail(null); }}>Đổi địa chỉ</Button>
              <Button icon={<ReloadOutlined />} onClick={() => fetchEmails(true)} loading={fetching}>Làm mới</Button>
            </Space>
          </Card>

          <Row gutter={16}>
            {/* CỘT BÊN TRÁI: DANH SÁCH THÔNG BÁO MAIL */}
            <Col xs={24} md={8}>
              <Card title={<Text style={titleColor}>Danh sách thư ({emails.length})</Text>} style={cardStyle}>
                <List
                  dataSource={emails}
                  locale={{ emptyText: <Empty description="Chưa có thư" /> }}
                  renderItem={(item) => (
                    <List.Item 
                      onClick={() => setSelectedEmail(item)}
                      style={{ 
                        cursor: 'pointer', 
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        background: selectedEmail?.id === item.id ? (darkMode ? '#303030' : '#e6f7ff') : 'transparent',
                        border: selectedEmail?.id === item.id ? '1px solid #1890ff' : '1px solid transparent'
                      }}
                    >
                      <List.Item.Meta
                        avatar={<Badge dot={selectedEmail?.id !== item.id}><MailOutlined style={{ fontSize: '20px', color: '#1890ff' }} /></Badge>}
                        title={<Text strong style={titleColor} ellipsis>{item.subject}</Text>}
                        description={<Text type="secondary" style={{ fontSize: '11px' }}>{item.sender.split('<')[0]}</Text>}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            {/* CỘT BÊN PHẢI: CHI TIẾT NỘI DUNG */}
            <Col xs={24} md={16}>
              <Card 
                title={<Text style={titleColor}>Chi tiết nội dung</Text>} 
                style={{ ...cardStyle, minHeight: '400px' }}
                extra={selectedEmail && isPremium && <Button type="link" onClick={() => archiveEmailContent(selectedEmail)}>Lưu thư</Button>}
              >
                {selectedEmail ? (
                  <div>
                    <Title level={4} style={titleColor}>{selectedEmail.subject}</Title>
                    <Text type="secondary">Từ: {selectedEmail.sender}</Text>
                    <Divider />
                    <div 
                      style={{ 
                        padding: '16px', 
                        background: '#fff', // Nền trắng để hiện HTML chuẩn
                        borderRadius: '8px', 
                        color: '#333', 
                        overflowX: 'auto',
                        minHeight: '300px'
                      }}
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedEmail.content) }} 
                    />
                  </div>
                ) : (
                  <Empty description="Chọn một thư để xem nội dung" style={{ marginTop: '100px' }} />
                )}
              </Card>
            </Col>
          </Row>
        </Content>

        {/* Modal Premium giữ nguyên của bạn */}
        <Modal title="Nâng cấp Premium" open={premiumModal} onOk={() => {if(premiumCode==="PREMIUM2024") setIsPremium(true); setPremiumModal(false);}} onCancel={() => setPremiumModal(false)}>
          <Input placeholder="Mã: PREMIUM2024" value={premiumCode} onChange={(e) => setPremiumCode(e.target.value)} />
        </Modal>
      </Layout>
    </>
  );
}

export default HomePage;