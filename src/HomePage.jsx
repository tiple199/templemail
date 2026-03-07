import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Card, Button, List, Typography, message, Badge, Space, Divider, Popconfirm, Switch, Slider, Spin, Modal, Input, Tooltip } from 'antd';
import { 
  CopyOutlined, ReloadOutlined, DeleteOutlined, SwapOutlined, 
  BulbOutlined, BulbFilled, SoundOutlined, LoadingOutlined,
  StarFilled, SaveOutlined, BookOutlined, EyeOutlined, PushpinOutlined, LogoutOutlined
} from '@ant-design/icons';
import axios from 'axios';
import DOMPurify from 'dompurify'; // Cực kỳ quan trọng để render HTML an toàn
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
  position: fixed; top: -10px; width: 100%; height: 100%; pointer-events: none; z-index: 1000;
`;

const Snowflake = styled.div`
  position: absolute; color: #fff; opacity: 0.8; animation: ${snowfall} linear infinite;
`;

const GlobalStyle = createGlobalStyle`
  body { overflow-x: hidden; }
`;

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function HomePage() {
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true'); 
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('appVolume')) || 0.2);
  
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('isPremium') === 'true');
  const [premiumModal, setPremiumModal] = useState(false);
  const [premiumCode, setPremiumCode] = useState("");
  const [savedAddresses, setSavedAddresses] = useState(() => JSON.parse(localStorage.getItem('savedAddresses')) || []);
  const [archivedEmails, setArchivedEmails] = useState(() => JSON.parse(localStorage.getItem('archivedEmails')) || []);
  const [viewingArchive, setViewingArchive] = useState(null);

  const lastEmailCount = useRef(0);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    localStorage.setItem('appVolume', volume);
    localStorage.setItem('isPremium', isPremium);
    localStorage.setItem('savedAddresses', JSON.stringify(savedAddresses));
    localStorage.setItem('archivedEmails', JSON.stringify(archivedEmails));
  }, [darkMode, volume, isPremium, savedAddresses, archivedEmails]);

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
    audio.play().catch(() => {});
  }, [volume]);

  const handleVerifyPremium = () => {
    if (premiumCode.trim().toUpperCase() === "PREMIUM2024") {
      setIsPremium(true);
      message.success("Kích hoạt Premium thành công!");
      setPremiumModal(false);
      setPremiumCode("");
    } else {
      message.error("Mã không đúng!");
    }
  };

  const handleExitPremium = () => {
    setIsPremium(false);
    message.warning("Đã về chế độ miễn phí.");
  };

  const saveCurrentAddress = () => {
    if (savedAddresses.includes(email)) return message.warning("Đã ghim rồi!");
    setSavedAddresses([email, ...savedAddresses]);
    message.success("Đã ghim địa chỉ!");
  };

  const removeSavedAddress = (addr) => setSavedAddresses(savedAddresses.filter(a => a !== addr));

  const archiveEmailContent = (item) => {
    setArchivedEmails([{ ...item, archiveId: Date.now() }, ...archivedEmails]);
    message.success("Đã lưu thư!");
  };

  const handleRefreshEmail = async () => {
    setLoading(true);
    await axios.get(`${API_ENDPOINT}?addr=${email}&action=delete`).catch(() => {});
    const newMail = createRandomEmail();
    setEmail(newMail);
    setEmails([]);
    lastEmailCount.current = 0;
    setLoading(false);
  };

  useEffect(() => { setEmail(createRandomEmail()); }, []);

  const fetchEmails = useCallback(async (isManual = false) => {
    if (!email) return;
    if (isManual) setFetching(true);
    try {
      const res = await axios.get(`${API_ENDPOINT}?addr=${email}`);
      const newEmails = res.data;
      if (newEmails.length > lastEmailCount.current) {
        playNotificationSound();
        message.info("Thư mới! 📬");
      }
      setEmails(newEmails);
      lastEmailCount.current = newEmails.length;
    } catch (err) {}
    setFetching(false);
  }, [email, playNotificationSound]);

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(() => fetchEmails(false), 10000);
    return () => clearInterval(interval);
  }, [fetchEmails]);

  const layoutStyle = darkMode ? { minHeight: '100vh', background: '#141414' } : { minHeight: '100vh', background: '#f0f2f5' };
  const cardStyle = darkMode ? { borderRadius: '12px', background: '#1f1f1f', border: '1px solid #303030' } : { borderRadius: '12px', background: '#fff', border: '1px solid #e8e8e8' };
  const titleColor = darkMode ? { color: '#fff' } : { color: '#000' };

  return (
    <>
      <GlobalStyle />
      {!darkMode && <SnowflakeContainer>{createSnowflakes()}</SnowflakeContainer>}
      <Layout style={layoutStyle}>
        <Header style={{ background: darkMode ? '#1f1f1f' : '#001529', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'auto', padding: '10px 20px', flexWrap: 'wrap' }}>
          <Space size="large">
            <Title level={3} style={{ color: '#fff', margin: 0 }}>Temp Mail {isPremium && <StarFilled style={{ color: '#fadb14', marginLeft: 8 }} />}</Title>
            {!isPremium ? <Button type="primary" danger ghost size="small" onClick={() => setPremiumModal(true)}>Nâng cấp</Button> : <Button type="default" danger size="small" icon={<LogoutOutlined />} onClick={handleExitPremium}>Thoát Premium</Button>}
            <div style={{ display: 'flex', alignItems: 'center', width: '100px' }}><SoundOutlined style={{ color: '#fff', marginRight: 8 }} /><Slider min={0} max={1} step={0.01} value={volume} onChange={setVolume} style={{ flex: 1 }} /></div>
            <Switch checked={darkMode} onChange={setDarkMode} checkedChildren={<BulbFilled />} unCheckedChildren={<BulbOutlined />} />
          </Space>
        </Header>
        <Content style={{ padding: '20px', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
          {isPremium && savedAddresses.length > 0 && (
            <Card size="small" style={{ ...cardStyle, marginBottom: 16 }} title={<Text style={titleColor}><PushpinOutlined /> Địa chỉ đã ghim</Text>}>
              <Space wrap>{savedAddresses.map(h => (<Badge key={h} count={<DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} onClick={() => removeSavedAddress(h)} />} offset={[-5, 5]}><Button type={email === h ? "primary" : "default"} size="small" onClick={() => { setEmail(h); setEmails([]); lastEmailCount.current = 0; }}>{h}</Button></Badge>))}</Space>
            </Card>
          )}
          <Card style={{ ...cardStyle, textAlign: 'center' }} loading={loading}>
            <Title level={2} copyable={{ text: email }} style={titleColor}>{email}</Title>
            <Space wrap>
              <Button type="primary" icon={<CopyOutlined />} onClick={() => { navigator.clipboard.writeText(email); message.success("Copy!"); playNotificationSound(); }}>Copy</Button>
              {isPremium && <Button icon={<PushpinOutlined />} onClick={saveCurrentAddress}>Ghim địa chỉ</Button>}
              <Button icon={<SwapOutlined />} onClick={handleRefreshEmail} loading={loading}>Đổi</Button>
              <Button icon={<ReloadOutlined />} onClick={() => fetchEmails(true)} loading={fetching}>Mới</Button>
            </Space>
          </Card>
          <Divider orientation="left" style={titleColor}>Hộp thư đến <Badge count={emails.length} /></Divider>
          <Spin spinning={fetching} indicator={antIcon} tip="Đang kiểm tra...">
            <List dataSource={emails} renderItem={(item) => (
              <Card style={{ marginBottom: '12px', background: darkMode ? '#1f1f1f' : '#fff', border: darkMode ? '1px solid #303030' : '1px solid #e8e8e8' }} size="small" title={<Text strong style={titleColor}>Từ: {item.sender}</Text>} extra={isPremium && <Button type="link" icon={<SaveOutlined />} onClick={() => archiveEmailContent(item)}>Lưu thư</Button>}>
                <Text strong style={titleColor}>{item.subject}</Text>
                {/* 🛡️ DÒNG QUAN TRỌNG: Render HTML OpenAI */}
                <div style={{ marginTop: '8px', padding: '12px', background: darkMode ? '#141414' : '#fafafa', borderRadius: '8px', color: darkMode ? '#d9d9d9' : '#333', overflowX: 'auto' }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.content) }} />
              </Card>
            )} />
          </Spin>
        </Content>
        <Modal title="Premium" open={premiumModal} onOk={handleVerifyPremium} onCancel={() => setPremiumModal(false)}><Input placeholder="Mã: PREMIUM2024" value={premiumCode} onChange={(e) => setPremiumCode(e.target.value)} /></Modal>
      </Layout>
    </>
  );
}
export default HomePage;