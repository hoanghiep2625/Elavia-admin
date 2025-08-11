import React, { useState, useEffect } from "react";
import {
  List,
  Card,
  Badge,
  Select,
  Input,
  Button,
  Space,
  Tag,
  Avatar,
  Typography,
  Row,
  Col,
  Statistic,
  DatePicker,
  message as antMessage,
} from "antd";
import {
  MessageOutlined,
  UserOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useGo } from "@refinedev/core";
import type { RangePickerProps } from "antd/es/date-picker";
import dayjs from "dayjs";
import { useChatStats, useAdmins, useConversations } from "../../hooks/useChat";

// Types
interface User {
  _id: string;
  name: string;
  email: string;
}

interface Admin {
  _id: string;
  name: string;
  email: string;
}

interface Message {
  _id: string;
  content: string;
  senderType: "user" | "admin";
  createdAt: string;
}

interface Conversation {
  _id: string;
  userId: User;
  adminId?: Admin;
  status: "waiting" | "active" | "closed";
  priority: "urgent" | "high" | "medium" | "low";
  unreadCount: number;
  lastMessage?: Message;
  lastMessageAt: string;
  createdAt: string;
  tags: string[];
}

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ChatManagement: React.FC = () => {
  const go = useGo();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    adminId: "all",
    search: "",
    sortBy: "lastMessageAt",
    sortOrder: "desc",
  });

  // Use custom hooks
  const { stats } = useChatStats();
  const { admins } = useAdmins();
  const { conversations, loading, total, reload } = useConversations(
    filters,
    pagination
  );

  // Update pagination total when data changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, total }));
  }, [total]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "orange";
      case "active":
        return "green";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "red";
      case "high":
        return "volcano";
      case "medium":
        return "orange";
      case "low":
        return "blue";
      default:
        return "default";
    }
  };

  const formatTime = (dateString: string) => {
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
  };

  const getTimeAgo = (dateString: string) => {
    const now = dayjs();
    const time = dayjs(dateString);
    const diffMinutes = now.diff(time, "minutes");

    if (diffMinutes < 1) return "Vừa xong";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Quản lý Chat</Title>

      {/* Stats Cards */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: "24px" }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="Tổng cuộc trò chuyện"
                value={stats.totalConversations}
                prefix={<MessageOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Đang chờ"
                value={stats.waitingConversations}
                valueStyle={{ color: "#fa8c16" }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Đang xử lý"
                value={stats.activeConversations}
                valueStyle={{ color: "#52c41a" }}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Hôm nay"
                value={stats.todayConversations}
                prefix={<MessageOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title="Tin nhắn hôm nay" value={stats.todayMessages} />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Thời gian phản hồi"
                value={stats.avgResponseTimeMinutes}
                suffix="phút"
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: "16px" }}>
        <Row gutter={16} align="middle">
          <Col span={4}>
            <Select
              style={{ width: "100%" }}
              placeholder="Trạng thái"
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
            >
              <Option value="all">Tất cả</Option>
              <Option value="waiting">Chờ xử lý</Option>
              <Option value="active">Đang xử lý</Option>
              <Option value="closed">Đã đóng</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              style={{ width: "100%" }}
              placeholder="Độ ưu tiên"
              value={filters.priority}
              onChange={(value) => handleFilterChange("priority", value)}
            >
              <Option value="all">Tất cả</Option>
              <Option value="urgent">Khẩn cấp</Option>
              <Option value="high">Cao</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="low">Thấp</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              style={{ width: "100%" }}
              placeholder="Admin"
              value={filters.adminId}
              onChange={(value) => handleFilterChange("adminId", value)}
            >
              <Option value="all">Tất cả</Option>
              {admins.map((admin: Admin) => (
                <Option key={admin._id} value={admin._id}>
                  {admin.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Input
              placeholder="Tìm kiếm khách hàng..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </Col>
          <Col span={6}>
            <Space>
              <Select
                style={{ width: "120px" }}
                value={filters.sortBy}
                onChange={(value) => handleFilterChange("sortBy", value)}
              >
                <Option value="lastMessageAt">Tin nhắn cuối</Option>
                <Option value="createdAt">Ngày tạo</Option>
                <Option value="priority">Độ ưu tiên</Option>
              </Select>
              <Select
                style={{ width: "100px" }}
                value={filters.sortOrder}
                onChange={(value) => handleFilterChange("sortOrder", value)}
              >
                <Option value="desc">Mới nhất</Option>
                <Option value="asc">Cũ nhất</Option>
              </Select>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => reload()}
                loading={loading}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Conversations List */}
      <List
        loading={loading}
        dataSource={conversations}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} cuộc trò chuyện`,
          onChange: (page, size) => {
            setPagination((prev) => ({
              ...prev,
              current: page,
              pageSize: size || 10,
            }));
          },
        }}
        renderItem={(conversation: Conversation) => (
          <List.Item
            key={conversation._id}
            style={{
              padding: "16px",
              cursor: "pointer",
              backgroundColor:
                conversation.unreadCount > 0 ? "#f6ffed" : "white",
            }}
            onClick={() =>
              go({
                to: `/chat/show/${conversation._id}`,
                type: "push",
              })
            }
          >
            <List.Item.Meta
              avatar={
                <Badge count={conversation.unreadCount} size="small">
                  <Avatar icon={<UserOutlined />} />
                </Badge>
              }
              title={
                <Space>
                  <Text strong>{conversation.userId.name}</Text>
                  <Tag color={getStatusColor(conversation.status)}>
                    {conversation.status === "waiting" && "Chờ xử lý"}
                    {conversation.status === "active" && "Đang xử lý"}
                    {conversation.status === "closed" && "Đã đóng"}
                  </Tag>
                  <Tag color={getPriorityColor(conversation.priority)}>
                    {conversation.priority === "urgent" && "Khẩn cấp"}
                    {conversation.priority === "high" && "Cao"}
                    {conversation.priority === "medium" && "Trung bình"}
                    {conversation.priority === "low" && "Thấp"}
                  </Tag>
                </Space>
              }
              description={
                <div>
                  <div>
                    <Text type="secondary">{conversation.userId.email}</Text>
                    {conversation.adminId && (
                      <Text style={{ marginLeft: 16 }}>
                        Admin: {conversation.adminId.name}
                      </Text>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <div style={{ marginTop: 4 }}>
                      <Text ellipsis>
                        {conversation.lastMessage.senderType === "admin"
                          ? "👤 "
                          : "💬 "}
                        {conversation.lastMessage.content}
                      </Text>
                    </div>
                  )}
                  {conversation.tags.length > 0 && (
                    <div style={{ marginTop: 4 }}>
                      {conversation.tags.map((tag: string) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  )}
                </div>
              }
            />
            <div style={{ textAlign: "right" }}>
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {getTimeAgo(conversation.lastMessageAt)}
                </Text>
              </div>
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Tạo: {formatTime(conversation.createdAt)}
                </Text>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default ChatManagement;
