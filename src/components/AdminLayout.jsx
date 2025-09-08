import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Shield,
  LogOut,
  Bell,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider, Content, Header } = Layout;

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <LayoutDashboard size={18} />,
      label: 'Dashboard',
    },
    {
      key: '/admin/providers',
      icon: <Users size={18} />,
      label: 'Providers',
    },
    {
      key: '/admin/clients',
      icon: <Users size={18} />,
      label: 'Clients',
    },
    {
      key: '/admin/payments',
      icon: <DollarSign size={18} />,
      label: 'Payments',
    },
    {
      key: '/admin/analytics',
      icon: <BarChart3 size={18} />,
      label: 'Analytics',
    },
    {
      key: '/admin/security',
      icon: <Shield size={18} />,
      label: 'Security',
    },
    {
      key: '/admin/docs',
      icon: <FileText size={18} />,
      label: 'Documentation',
    },
    {
      key: '/admin/settings',
      icon: <Settings size={18} />,
      label: 'Settings',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Admin Profile',
      icon: <Users size={16} />,
    },
    {
      key: 'system',
      label: 'System Settings',
      icon: <Settings size={16} />,
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
            Best<span className="text-green-400">★</span>rz
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
              <span className="text-white text-lg">Admin Portal</span>
            </div>
            <Space size="large">
              <Button 
                type="text" 
                icon={<HelpCircle size={16} />}
                className="text-gray-300 hover:text-white glow-button"
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
                      navigate('/');
                    }
                  }
                }}
                trigger={['click']}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              >
                <div className="flex items-center cursor-pointer hover-lift">
                  <Avatar style={{ backgroundColor: '#8B5CF6' }}>AD</Avatar>
                  <span className="text-white ml-2">Admin</span>
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

export default AdminLayout;