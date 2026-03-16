import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Card, Button, List, Typography, message, Badge, Space, Divider, Popconfirm, Switch, Slider, Spin, Modal, Input, Tooltip, Row, Col, Empty } from 'antd';
import { 
  CopyOutlined, ReloadOutlined, DeleteOutlined, SwapOutlined, 
  BulbOutlined, BulbFilled, SoundOutlined, LoadingOutlined,
  StarFilled, SaveOutlined, BookOutlined, EyeOutlined, PushpinOutlined, LogoutOutlined, MailOutlined, CheckOutlined, CloseOutlined
} from '@ant-design/icons';
import axios from 'axios';
import DOMPurify from 'dompurify';
import styled, { keyframes, createGlobalStyle } from 'styled-components';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const API_ENDPOINT = process.env.REACT_APP_API_URL;

// --- ❄️ HIỆU ỨNG TUYẾT RƠI ---
const snowfall = keyframes`0% { transform: translateY(0); } 100% { transform: translateY(110vh); }`;
const SnowflakeContainer = styled.div`position: fixed; top: -10px; width: 100%; height: 100%; pointer-events: none; z-index: 1000;`;
const Snowflake = styled.div`position: absolute; color: #fff; opacity: 0.8; animation: ${snowfall} linear infinite;`;
const GlobalStyle = createGlobalStyle`body { overflow-x: hidden; }`;

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function HomePage() {
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  // --- TRẠNG THÁI HỆ THỐNG ---
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true'); 
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('appVolume')) || 0.2);
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('isPremium') === 'true');
  const [savedAddresses, setSavedAddresses] = useState(() => JSON.parse(localStorage.getItem('savedAddresses')) || []);
  const [archivedEmails, setArchivedEmails] = useState(() => JSON.parse(localStorage.getItem('archivedEmails')) || []);
  const [viewingArchive, setViewingArchive] = useState(null);
  const [premiumModal, setPremiumModal] = useState(false);
  const [premiumCode, setPremiumCode] = useState("");

  // --- TRẠNG THÁI CHỈNH SỬA EMAIL (PREMIUM) ---
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const lastEmailCount = useRef(0);

  // Đồng bộ LocalStorage
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

  // Logic dọn dẹp khi Refresh trang/Vào trang
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const old = localStorage.getItem('currentEmail');
      // Xóa thư cũ trong DB để bảo mật và tiết kiệm dung lượng
      if (old && API_ENDPOINT) await axios.get(`${API_ENDPOINT}?addr=${old}&action=delete`).catch(() => {});
      
      const newM = createRandomEmail();
      setEmail(newM);
      setEditValue(newM.split('@')[0]);
      localStorage.setItem('currentEmail', newM);
      setLoading(false);
    };
    init();
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

  const handleRefreshEmail = async () => {
    setLoading(true);
    await axios.get(`${API_ENDPOINT}?addr=${email}&action=delete`).catch(() => {});
    const newM = createRandomEmail();
    setEmail(newM);
    setEditValue(newM.split('@')[0]);
    setEmails([]);
    setSelectedEmail(null);
    lastEmailCount.current = 0;
    setLoading(false);
    message.success("Đã đổi địa chỉ ngẫu nhiên!");
  };

  const handleClearInbox = async () => {
    setLoading(true);
    await axios.get(`${API_ENDPOINT}?addr=${email}&action=delete`).catch(() => {});
    setEmails([]);
    setSelectedEmail(null);
    lastEmailCount.current = 0;
    setLoading(false);
    message.warning("Đã dọn sạch hòm thư!");
  };

  const handleSaveCustomEmail = () => {
    if (!editValue.trim()) return message.error("Tên email không được để trống!");
    const customEmail = `${editValue.trim()}@tiepln.id.vn`;
    setEmail(customEmail);
    setEmails([]);
    setSelectedEmail(null);
    lastEmailCount.current = 0;
    setIsEditing(false);
    localStorage.setItem('currentEmail', customEmail);
    message.success(`Đã chuyển sang: ${customEmail}`);
  };

  const cardStyle = { borderRadius: '12px', background: darkMode ? '#1f1f1f' : '#fff', border: darkMode ? '1px solid #303030' : '1px solid #e8e8e8', transition: '0.3s' };
  const titleColor = { color: darkMode ? '#fff' : '#000' };

  return (
    <>
      <GlobalStyle />
      {!darkMode && <SnowflakeContainer>{Array.from({length: 30}).map((_, i) => <Snowflake key={i} style={{ left: `${Math.random() * 100}%`, animationDuration: `${Math.random() * 5 + 5}s` }}>❄</Snowflake>)}</SnowflakeContainer>}
      <Layout style={{ minHeight: '100vh', background: darkMode ? '#141414' : '#f0f2f5', transition: '0.3s' }}>
        <Header style={{ background: darkMode ? '#1f1f1f' : '#001529', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 20px', height: 'auto', flexWrap: 'wrap' }}>
          <Space size="large">
            <Title level={3} style={{ color: '#fff', margin: 0 }}>Temp Mail {isPremium && <StarFilled style={{ color: '#fadb14' }} />}</Title>
            {!isPremium ? (
              <Button type="primary" danger ghost size="small" onClick={() => setPremiumModal(true)}>Nâng cấp</Button>
            ) : (
              <Popconfirm title="Thoát Premium?" onConfirm={() => setIsPremium(false)}><Button type="default" danger size="small" icon={<LogoutOutlined />}>Rời Premium</Button></Popconfirm>
            )}
            <div style={{ display: 'flex', alignItems: 'center', width: 100 }}><SoundOutlined style={{ color: '#fff', marginRight: 8 }} /><Slider min={0} max={1} step={0.01} value={volume} onChange={setVolume} style={{ flex: 1 }} /></div>
            <Switch checked={darkMode} onChange={setDarkMode} checkedChildren={<BulbFilled />} unCheckedChildren={<BulbOutlined />} />
          </Space>
        </Header>

        <Content style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          {isPremium && savedAddresses.length > 0 && (
            <Card size="small" style={{ ...cardStyle, marginBottom: 16 }} title={<Text style={titleColor}><PushpinOutlined /> Đã ghim</Text>}>
              <Space wrap>{savedAddresses.map(h => <Badge key={h} count={<DeleteOutlined style={{ color: 'red' }} onClick={() => setSavedAddresses(savedAddresses.filter(a => a !== h))} />} offset={[-5, 5]}><Button type={email === h ? "primary" : "default"} size="small" onClick={() => { setEmail(h); setEditValue(h.split('@')[0]); setEmails([]); setSelectedEmail(null); }}>{h}</Button></Badge>)}</Space>
            </Card>
          )}

          <Card style={{ ...cardStyle, textAlign: 'center', marginBottom: 20 }} loading={loading}>
            {isPremium && isEditing ? (
              <div style={{ marginBottom: 16 }}>
                <Input 
                  value={editValue} 
                  onChange={e => setEditValue(e.target.value)} 
                  addonAfter="@tiepln.id.vn" 
                  style={{ maxWidth: 400, fontSize: '20px' }} 
                  onPressEnter={handleSaveCustomEmail}
                  autoFocus
                />
                <div style={{ marginTop: 8 }}>
                  <Button type="primary" size="small" icon={<CheckOutlined />} onClick={handleSaveCustomEmail} style={{ marginRight: 8 }}>Xác nhận</Button>
                  <Button size="small" icon={<CloseOutlined />} onClick={() => setIsEditing(false)}>Hủy</Button>
                </div>
              </div>
            ) : (
              <div onClick={() => isPremium && setIsEditing(true)} style={{ cursor: isPremium ? 'pointer' : 'default' }}>
                <Tooltip title={isPremium ? "Nhấp để sửa email theo ý muốn" : ""}>
                  <Title level={2} copyable={!isEditing && { text: email }} style={titleColor}>
                    {email} {isPremium && <small style={{ fontSize: '12px', color: '#1890ff', verticalAlign: 'middle' }}>(Sửa)</small>}
                  </Title>
                </Tooltip>
              </div>
            )}

            <Space wrap>
              <Button type="primary" icon={<CopyOutlined />} onClick={() => { navigator.clipboard.writeText(email); message.success("Đã copy!"); }}>Sao chép</Button>
              {isPremium && <Button icon={<PushpinOutlined />} onClick={() => setSavedAddresses([...new Set([email, ...savedAddresses])])}>Ghim</Button>}
              <Button icon={<SwapOutlined />} onClick={handleRefreshEmail}>Đổi ngẫu nhiên</Button>
              <Popconfirm title="Dọn dẹp hòm thư?" onConfirm={handleClearInbox}><Button danger icon={<DeleteOutlined />}>Dọn dẹp</Button></Popconfirm>
              <Button icon={<ReloadOutlined />} onClick={() => fetchEmails(true)} loading={fetching}>Làm mới</Button>
            </Space>
          </Card>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Card title={<Text style={titleColor}>Danh sách thư ({emails.length})</Text>} style={cardStyle}>
                <List 
                  dataSource={emails} 
                  locale={{ emptyText: <Empty description="Chưa có thư" /> }}
                  renderItem={(item) => (
                    <List.Item 
                      onClick={() => setSelectedEmail(item)} 
                      style={{ 
                        cursor: 'pointer', padding: '12px', borderRadius: '8px', marginBottom: '8px', 
                        background: selectedEmail?.id === item.id ? (darkMode ? '#303030' : '#e6f7ff') : 'transparent',
                        border: selectedEmail?.id === item.id ? '1px solid #1890ff' : '1px solid transparent'
                      }}
                    >
                      <List.Item.Meta 
                        avatar={<Badge dot={selectedEmail?.id !== item.id}><MailOutlined style={{ color: '#1890ff', fontSize: '20px' }} /></Badge>} 
                        title={<Text strong style={titleColor} ellipsis>{item.subject}</Text>} 
                        description={<Text type="secondary" style={{ fontSize: '11px' }}>{item.sender.split('<')[0]}</Text>} 
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} md={16}>
              <Card 
                title={<Text style={titleColor}>Chi tiết nội dung</Text>} 
                style={{ ...cardStyle, minHeight: '450px' }} 
                extra={selectedEmail && isPremium && <Button type="link" icon={<SaveOutlined />} onClick={() => { setArchivedEmails([{...selectedEmail, archiveId: Date.now()}, ...archivedEmails]); message.success("Đã lưu vào kho!"); }}>Lưu thư</Button>}
              >
                {selectedEmail ? (
                  <div>
                    <Title level={4} style={titleColor}>{selectedEmail.subject}</Title>
                    <Text type="secondary">Từ: {selectedEmail.sender}</Text>
                    <Divider />
                    <div 
                      style={{ padding: '16px', background: '#fff', borderRadius: '8px', color: '#333', overflowX: 'auto', minHeight: '300px' }} 
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedEmail.content) }} 
                    />
                  </div>
                ) : <Empty description="Chọn một thư từ danh sách bên trái để xem nội dung" style={{ marginTop: '100px' }} />}
              </Card>
            </Col>
          </Row>

          {isPremium && archivedEmails.length > 0 && (
            <><Divider style={titleColor}><BookOutlined /> Kho lưu trữ</Divider>
            <List 
              dataSource={archivedEmails} 
              renderItem={(item) => (
                <Card size="small" style={{ marginBottom: 8, ...cardStyle }} extra={<Space><Button size="small" icon={<EyeOutlined />} onClick={() => setViewingArchive(item)}>Xem</Button><Button size="small" danger onClick={() => setArchivedEmails(archivedEmails.filter(a => a.archiveId !== item.archiveId))} icon={<DeleteOutlined />} /></Space>}>
                  <Text strong style={titleColor}>{item.subject}</Text>
                  <div style={{ fontSize: '11px', color: 'gray' }}>Đến: {item.recipient}</div>
                </Card>
              )} 
            /></>
          )}
        </Content>

        <Modal title="Nâng cấp Premium" open={premiumModal} onOk={() => { if(premiumCode === "PREMIUM2024") { setIsPremium(true); setPremiumModal(false); message.success("Kích hoạt Premium thành công! ✨"); } else message.error("Mã kích hoạt không chính xác!"); }} onCancel={() => setPremiumModal(false)}><Input placeholder="Mã: PREMIUM2024" value={premiumCode} onChange={e => setPremiumCode(e.target.value)} /></Modal>
        <Modal title={viewingArchive?.subject} open={!!viewingArchive} onCancel={() => setViewingArchive(null)} footer={null} width={800}><div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(viewingArchive?.content || "") }} /></Modal>
      </Layout>
    </>
  );
}
export default HomePage;