import React from "react";
import { Layout, Menu, Button, Avatar, Dropdown, Space } from "antd";
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
  FileText,
  User,
  MessageCircle,
  BellRing,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMessage } from "../context/messages/MessageContext";

const { Sider, Content, Header } = Layout;

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {user,signOut}=useAuth();

  const {unreadCount, enableNotifications}=useMessage();

  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <LayoutDashboard size={18} />,
      label: "Dashboard",
    },

    {
      key: "/admin/profile",
      icon: <User size={18} />,
      label: "Profile",
    },
    {
      key: "/admin/providers",
      icon: <Users size={18} />,
      label: "Providers",
    },
    {
      key: "/admin/clients",
      icon: <Users size={18} />,
      label: "Clients",
    },
    {
      key: "/admin/payments",
      icon: <DollarSign size={18} />,
      label: "Payments",
    },
    {
      key: "/admin/analytics",
      icon: <BarChart3 size={18} />,
      label: "Analytics",
    },
    {
      key: "/admin/security",
      icon: <Shield size={18} />,
      label: "Security",
    },
    {
      key: "/admin/docs",
      icon: <FileText size={18} />,
      label: "Help & Docs",
    },

    {
      key: "/admin/messages",
      icon: <MessageCircle size={18} />,
      label: "Messages",
    },
    {
      key: "/admin/platform-settings",
      icon: <Settings size={18} />,
      label: "Settings",
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      label: "Admin Profile",
      icon: <User size={16} />,
    },
    {
      key: "platform",
      label: "Platform Settings",
      icon: <Settings size={16} />,
    },
    {
      key: "help",
      label: "Help Center",
      icon: <HelpCircle size={16} />,
    },
    {
      key: "divider",
      type: "divider",
    },
    {
      key: "logout",
      label: "Sign Out",
      icon: <LogOut size={16} />,
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      navigate("/");
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
          position: "fixed",
          height: "100vh",
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
          style={{ height: "64px", lineHeight: "64px" }}
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
                onClick={() => {
                  navigate("/admin/docs");
                }}
              >
                Help
              </Button>
              <Button
                type="text"
                icon={<BellRing size={16} />}
                className="text-gray-300 hover:text-white"
                onClick={enableNotifications}
                title="Enable notifications"
              />
              <Button
                type="text"
                icon={<Bell size={16} />}
                className="text-gray-300 hover:text-white"
                onClick={() => navigate("/admin/messages")}
              >
                {unreadCount}
              </Button>
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: ({ key }) => {
                    if (key === "logout") {

                      signOut();
                      navigate("/");
                    } else if (key === "profile") {
                      navigate("/admin/profile");
                    } else if (key === "platform") {
                      navigate("/admin/platform-settings");
                    } else if (key === "help") {
                      navigate("/admin/docs");
                    }
                  },
                }}
                trigger={["click"]}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              >
                <div className="flex items-center cursor-pointer hover-lift">
                  <Avatar style={{ backgroundColor: "#8B5CF6" }}>AD</Avatar>
                  <span className="text-white ml-2">Admin</span>
                </div>
              </Dropdown>
            </Space>
          </div>
        </Header>

        <Content className="bg-black">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
