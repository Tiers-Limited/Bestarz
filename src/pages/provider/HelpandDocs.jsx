import React from "react";
import { Card, Typography } from "antd";
import { BookOpen, HelpCircle, FileText } from "lucide-react";
import ProviderLayout from "../../components/ProviderLayout";

const { Title, Paragraph } = Typography;

const ProviderHelpandDocs = () => {
  return (
    <ProviderLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <Title level={2} className="text-white mb-2">
            Help & Documentation
          </Title>
          <Paragraph className="text-gray-400">
            Browse our guides, FAQs, and documentation to get the most out of the platform.
          </Paragraph>
        </div>

        {/* Help Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glow-border hover-lift">
            <BookOpen size={28} className="text-blue-400 mb-4" />
            <Title level={4} className="text-white">
              Getting Started
            </Title>
            <Paragraph className="text-gray-400">
              Learn how to set up your account, manage customers, and start taking bookings.
            </Paragraph>
          </Card>

          <Card className="glow-border hover-lift">
            <HelpCircle size={28} className="text-green-400 mb-4" />
            <Title level={4} className="text-white">
              FAQs
            </Title>
            <Paragraph className="text-gray-400">
              Find answers to the most common questions about using the platform.
            </Paragraph>
          </Card>

          <Card className="glow-border hover-lift">
            <FileText size={28} className="text-yellow-400 mb-4" />
            <Title level={4} className="text-white">
              Documentation
            </Title>
            <Paragraph className="text-gray-400">
              Explore detailed documentation for advanced features and integrations.
            </Paragraph>
          </Card>
        </div>
      </div>
    </ProviderLayout>
  );
};

export default ProviderHelpandDocs;
