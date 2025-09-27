import React from "react";
import { Layout, Menu, Button, Avatar, Dropdown, Space } from "antd";
import {
  LayoutDashboard,
  User,
  Calendar,
  DollarSign,
  Star,
  LogOut,
  Bell,
  ExternalLink,
  Users,
  FileText,
  HelpCircle,
  Package,
  MessageCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getInitials } from "../utils/helper";
import { useMessage } from "../context/messages/MessageContext";

const { Sider, Content, Header } = Layout;

const ProviderLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, signOut } = useAuth();

  const {unreadCount}=useMessage();

  console.log(user, "user");

  const menuItems = [
    {
      key: "/provider/dashboard",
      icon: <LayoutDashboard size={18} />,
      label: "Dashboard",
    },
    {
      key: "/provider/profile",
      icon: <User size={18} />,
      label: "Profile",
    },
    {
      key: "/provider/bookings",
      icon: <Calendar size={18} />,
      label: "Bookings",
    },

    {
      key: "/provider/services-rates",
      icon: <Package size={18} />,
      label: "Service Rates",
    },
    {
      key: "/provider/customers",
      icon: <Users size={18} />,
      label: "Customers",
    },
    {
      key: "/provider/earnings",
      icon: <DollarSign size={18} />,
      label: "Earnings",
    },
    {
      key: "/provider/subscription",
      icon: <Star size={18} />,
      label: "Subscription",
    },

    {
      key: "/provider/messages",
      icon: <MessageCircle size={18} />,
      label: "Messages",
    },
    {
      key: "/provider/docs",
      icon: <FileText size={18} />,
      label: "Help & Docs",
    },

  ];

  const userMenuItems = [
    {
      key: "profile",
      label: "Profile Settings",
      icon: <User size={16} />,
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
              <span className="text-white text-lg">Provider Portal</span>
            </div>
            <Space size="large">
              <Button
                type="text"
                icon={<ExternalLink size={16} />}
                onClick={() =>
                  window.open(`/provider/${user?.slug}`, "_blank")
                }
                className="text-gray-300 hover:text-white"
              >
                Public Page
              </Button>
              <Button
                type="text"
                icon={<HelpCircle size={16} />}
                className="text-gray-300 hover:text-white glow-button"
                onClick={() => {
                  navigate("/provider/docs");
                }}
              >
                Help
              </Button>
              <Button
                type="text"
                icon={<Bell size={16} />}
                className="text-gray-300 hover:text-white"
                onClick={() => navigate("/provider/messages")}
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
                    } else if (key === "notifications") {
                      navigate("/provider/messages");
                    } else if (key === "help") {
                      navigate("/provider/docs");
                    } else if (key === "profile") {
                      navigate("/provider/profile");
                    }
                  },
                }}
                trigger={["click"]}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              >
                <div className="flex items-center cursor-pointer hover-lift">
                  <Avatar
                    src={user?.profileImage || null}
                    style={{
                      backgroundColor: user?.profileImage
                        ? "transparent"
                        : "#3B82F6",
                    }}
                  >
                    {!user?.profileImage &&
                      getInitials(user?.firstName, user?.lastName)}
                  </Avatar>

                  <span className="text-white ml-2">
                    {user?.firstName} {user?.lastName}
                  </span>
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

export default ProviderLayout;
