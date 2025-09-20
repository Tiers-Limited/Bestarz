import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Settings, 
  LogOut,
  Bell,
  HelpCircle,
  FileText,
  MessageCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Sider, Content, Header } = Layout;

const ClientLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user,signOut } = useAuth();


  // ✅ Client-specific sidebar menu
  const menuItems = [
    {
      key: '/client/dashboard',
      icon: <LayoutDashboard size={18} />,
      label: 'Dashboard',
    },
    {
      key: '/client/providers',
      icon: <Users size={18} />,
      label: 'Providers',
    },
    {
      key: '/client/payments',
      icon: <DollarSign size={18} />,
      label: 'Payments',
    },

    {
      key: '/client/messages',
      icon: <MessageCircle size={18} />,
      label: 'Messages',
    },
    {
      key: '/client/docs',
      icon: <FileText size={18} />,
      label: 'Documentation',
    },

    {
      key: '/client/settings',
      icon: <Settings size={18} />,
      label: 'Settings',
    },
  ];

  // ✅ Client-focused dropdown menu
  const userMenuItems = [
    {
      key: 'profile',
      label: 'My Profile',
      icon: <Users size={16} />,
    },
    {
      key: 'help',
      label: 'Help Center',
      icon: <HelpCircle size={16} />,
    },
    {
      key: 'divider',
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Sign Out',
      icon: <LogOut size={16} />,
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      navigate('/');
    } else {
      navigate(key);
    }
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        width={240}
        className="bg-black border-r border-gray-800"
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
    <div className="p-6">
  <div className="bestarz-logo text-2xl text-center mb-8">
    Best<span className="bestarz-star">★</span>rz
  </div>
</div>

        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-r-0 bg-black"
        />
      </Sider>

      <Layout style={{ marginLeft: 240 }}>
        <Header 
          className="bg-black border-b border-gray-800 px-6"
          style={{ height: '64px', lineHeight: '64px' }}
        >
          <div className="flex justify-between items-center">
            <div>
              <span className="text-white text-lg">Client Portal</span>
            </div>
            <Space size="large">
              <Button 
                type="text" 
                icon={<HelpCircle size={16} />}
                className="text-gray-300 hover:text-white glow-button"

                onClick={()=>{
                  navigate('/client/docs');
                }}
              >
                Help
              </Button>
              <Button 
                type="text" 
                icon={<Bell size={16} />}
                className="text-gray-300 hover:text-white"
              >
                5
              </Button>
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: ({ key }) => {
                    if (key === 'logout') {

                      signOut();
                      navigate('/');
                    }
                    else if (key === 'help') {
                      navigate('/client/docs');
                    }
                    else if (key === 'profile') {
                      navigate('/client/settings');
                    }
                  }
                }}
                trigger={['click']}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              >
                <div className="flex items-center cursor-pointer hover-lift">
                  <Avatar style={{ backgroundColor: '#8B5CF6' }}>CL</Avatar>
                  <span className="text-white ml-2">Client</span>
                </div>
              </Dropdown>
            </Space>
          </div>
        </Header>
        
        <Content className="bg-black">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ClientLayout;
