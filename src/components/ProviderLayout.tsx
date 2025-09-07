import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd';
import { 
  LayoutDashboard, 
  User, 
  Calendar, 
  DollarSign, 
  Settings, 
  Star,
  LogOut,
  Bell,
  ExternalLink
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider, Content, Header } = Layout;

interface ProviderLayoutProps {
  children: React.ReactNode;
}

const ProviderLayout: React.FC<ProviderLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/provider/dashboard',
      icon: <LayoutDashboard size={18} />,
      label: 'Dashboard',
    },
    {
      key: '/provider/profile',
      icon: <User size={18} />,
      label: 'Profile',
    },
    {
      key: '/provider/bookings',
      icon: <Calendar size={18} />,
      label: 'Bookings',
    },
    {
      key: '/provider/earnings',
      icon: <DollarSign size={18} />,
      label: 'Earnings',
    },
    {
      key: '/provider/subscription',
      icon: <Star size={18} />,
      label: 'Subscription',
    },
    {
      key: '/provider/settings',
      icon: <Settings size={18} />,
      label: 'Settings',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile Settings',
      icon: <User size={16} />,
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: <Bell size={16} />,
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

  const handleMenuClick = ({ key }: { key: string }) => {
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
        className="bg-gray-900"
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
            Best<span className="text-green-400">★</span>rz
          </div>
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-r-0"
          style={{ backgroundColor: 'transparent' }}
        />
      </Sider>

      <Layout style={{ marginLeft: 240 }}>
        <Header 
          className="bg-gray-800 border-b border-gray-700 px-6"
          style={{ height: '64px', lineHeight: '64px' }}
        >
          <div className="flex justify-between items-center">
            <div>
              <span className="text-white text-lg">Provider Portal</span>
            </div>
            <Space size="large">
              <Button 
                type="text" 
                icon={<ExternalLink size={16} />}
                onClick={() => window.open('/provider/dj-master/book', '_blank')}
                className="text-gray-300 hover:text-white"
              >
                Public Page
              </Button>
              <Button 
                type="text" 
                icon={<Bell size={16} />}
                className="text-gray-300 hover:text-white"
              >
                3
              </Button>
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: ({ key }) => {
                    if (key === 'logout') {
                      navigate('/');
                    }
                  }
                }}
                trigger={['click']}
              >
                <div className="flex items-center cursor-pointer">
                  <Avatar style={{ backgroundColor: '#3B82F6' }}>DM</Avatar>
                  <span className="text-white ml-2">DJ Master</span>
                </div>
              </Dropdown>
            </Space>
          </div>
        </Header>
        
        <Content className="bg-gray-900">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProviderLayout;