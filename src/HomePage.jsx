import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Card, Button, List, Typography, message, Badge, Space, Divider, Popconfirm, Switch, Slider, Spin, Modal, Input, Tooltip } from 'antd';
import { CopyOutlined, ReloadOutlined, DeleteOutlined, SwapOutlined, BulbOutlined, BulbFilled, SoundOutlined, LoadingOutlined, StarFilled, SaveOutlined, BookOutlined, EyeOutlined, PushpinOutlined, LogoutOutlined } from '@ant-design/icons';
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

function HomePage() {
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState([]);
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

  // Lưu trạng thái hệ thống
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    localStorage.setItem('appVolume', volume);
    localStorage.setItem('isPremium', isPremium);
    localStorage.setItem('savedAddresses', JSON.stringify(savedAddresses));
    localStorage.setItem('archivedEmails', JSON.stringify(archivedEmails));
  }, [darkMode, volume, isPremium, savedAddresses, archivedEmails]);

  const playNotificationSound = useCallback(() => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
    audio.volume = volume; audio.play().catch(() => {});
  }, [volume]);

  const handleRefreshEmail = async () => {
    setLoading(true);
    try {
      await axios.get(`${API_ENDPOINT}?addr=${email}&action=delete`);
      setEmail(`${Math.random().toString(36).substring(2, 8)}@tiepln.id.vn`);
      setEmails([]);
      lastEmailCount.current = 0;
      message.success("Đã đổi địa chỉ!");
    } catch (e) { message.error("Lỗi kết nối API!"); }
    setLoading(false);
  };

  const fetchEmails = useCallback(async (isManual = false) => {
    if (!email) return;
    if (isManual) setFetching(true);
    try {
      const res = await axios.get(`${API_ENDPOINT}?addr=${email}`);
      if (res.data.length > lastEmailCount.current) {
        playNotificationSound();
        message.info("Có thư mới!");
      }
      setEmails(res.data);
      lastEmailCount.current = res.data.length;
    } catch (err) {
      if (isManual) message.error("Không thể tải danh sách thư.");
    }
    setFetching(false);
  }, [email, playNotificationSound]);

  useEffect(() => {
    setEmail(`${Math.random().toString(36).substring(2, 8)}@tiepln.id.vn`);
  }, []);

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(() => fetchEmails(false), 10000);
    return () => clearInterval(interval);
  }, [fetchEmails]);

  return (
    <>
      <GlobalStyle />
      {!darkMode && <SnowflakeContainer>{Array.from({length: 30}).map((_, i) => <Snowflake key={i} style={{left: `${Math.random()*100}%`, animationDuration: `${Math.random()*5+5}s`, animationDelay: `${Math.random()*5}s`}}>❄</Snowflake>)}</SnowflakeContainer>}
      <Layout style={{minHeight: '100vh', background: darkMode ? '#141414' : '#f0f2f5'}}>
        <Header style={{background: darkMode ? '#1f1f1f' : '#001529', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 20px', height: 'auto'}}>
          <Space size="large">
            <Title level={3} style={{color: '#fff', margin: 0}}>Temp Mail {isPremium && <StarFilled style={{color: '#fadb14'}} />}</Title>
            {!isPremium ? <Button type="primary" danger ghost size="small" onClick={() => setPremiumModal(true)}>Nâng cấp</Button> : <Button type="default" danger size="small" icon={<LogoutOutlined />} onClick={() => setIsPremium(false)}>Thoát Premium</Button>}
            <Slider min={0} max={1} step={0.01} value={volume} onChange={setVolume} style={{width: 80}} />
            <Switch checked={darkMode} onChange={setDarkMode} checkedChildren={<BulbFilled />} unCheckedChildren={<BulbOutlined />} />
          </Space>
        </Header>
        <Content style={{padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%'}}>
          {isPremium && savedAddresses.length > 0 && (
            <Card size="small" title="Địa chỉ đã ghim" style={{marginBottom: 16, background: darkMode ? '#1f1f1f' : '#fff'}}>
              <Space wrap>{savedAddresses.map(h => <Badge key={h} count={<DeleteOutlined style={{color: 'red'}} onClick={() => setSavedAddresses(savedAddresses.filter(a => a !== h))} />}><Button size="small" onClick={() => setEmail(h)}>{h}</Button></Badge>)}</Space>
            </Card>
          )}
          <Card loading={loading} style={{textAlign: 'center', background: darkMode ? '#1f1f1f' : '#fff'}}>
            <Title level={2} copyable={{text: email}} style={{color: darkMode ? '#fff' : '#000'}}>{email}</Title>
            <Space wrap>
              <Button type="primary" icon={<CopyOutlined />} onClick={() => {navigator.clipboard.writeText(email); message.success("Đã copy!");}}>Copy</Button>
              {isPremium && <Button icon={<PushpinOutlined />} onClick={() => setSavedAddresses([...new Set([email, ...savedAddresses])])}>Ghim</Button>}
              <Button icon={<SwapOutlined />} onClick={handleRefreshEmail}>Đổi</Button>
              <Button icon={<ReloadOutlined />} onClick={() => fetchEmails(true)} loading={fetching}>Làm mới</Button>
            </Space>
          </Card>
          <Divider style={{color: darkMode ? '#fff' : '#000'}}>Hộp thư đến <Badge count={emails.length} /></Divider>
          <List dataSource={emails} renderItem={(item) => (
            <Card size="small" title={`Từ: ${item.sender}`} extra={isPremium && <Button type="link" onClick={() => setArchivedEmails([{...item, archiveId: Date.now()}, ...archivedEmails])}>Lưu</Button>} style={{marginBottom: 12, background: darkMode ? '#1f1f1f' : '#fff'}}>
              <Text strong style={{color: darkMode ? '#fff' : '#000'}}>{item.subject}</Text>
              <div style={{marginTop: 8, padding: 12, background: darkMode ? '#141414' : '#fafafa', borderRadius: 8, overflowX: 'auto'}} dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(item.content)}} />
            </Card>
          )} />
          {isPremium && archivedEmails.length > 0 && (
             <><Divider style={{color: darkMode ? '#fff' : '#000'}}>Kho lưu trữ</Divider>
             <List dataSource={archivedEmails} renderItem={(item) => <Card size="small" extra={<Space><Button size="small" icon={<EyeOutlined />} onClick={() => setViewingArchive(item)}>Xem</Button><Button size="small" danger icon={<DeleteOutlined />} onClick={() => setArchivedEmails(archivedEmails.filter(a => a.archiveId !== item.archiveId))} /></Space>} style={{marginBottom: 8}}><Text>{item.subject}</Text></Card>} /></>
          )}
        </Content>
        <Modal title="Nâng cấp" open={premiumModal} onOk={() => {if(premiumCode==="PREMIUM2024"){setIsPremium(true); setPremiumModal(false);}else message.error("Sai mã!");}} onCancel={() => setPremiumModal(false)}><Input placeholder="PREMIUM2024" value={premiumCode} onChange={e => setPremiumCode(e.target.value)} /></Modal>
        <Modal title={viewingArchive?.subject} open={!!viewingArchive} onCancel={() => setViewingArchive(null)} footer={null} width={700}><div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(viewingArchive?.content || "")}} /></Modal>
      </Layout>
    </>
  );
}
export default HomePage;