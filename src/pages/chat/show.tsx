import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Input,
  Button,
  List,
  Avatar,
  Typography,
  Space,
  Tag,
  Select,
  Row,
  Col,
  Divider,
  message as antMessage,
  Upload,
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  PictureOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { useGo } from "@refinedev/core";
import dayjs from "dayjs";
import { useConversation, useAdmins } from "../../hooks/useChat";
import { axiosInstance } from "../../axiosInstance";
import ProductSelector from "../../components/ProductSelector";

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

const ChatDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const go = useGo();
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Lấy ID trực tiếp từ URL
  const urlId = window.location.pathname.split("/").pop();

  // Use custom hooks
  const {
    conversation,
    messages,
    loading,
    sendMessage: sendMessageHook,
    assignConversation,
    closeConversation,
    reload: refreshMessages,
  } = useConversation(urlId || id);

  const { admins } = useAdmins();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-refresh messages
  useEffect(() => {
    if (conversation && !loading && conversation.status !== "closed") {
      // Chỉ polling khi cuộc trò chuyện đang active
      const interval = setInterval(() => {
        if (refreshMessages) {
          refreshMessages();
        }
      }, 5000); // Polling mỗi 5 giây

      setPollingInterval(interval);

      return () => {
        clearInterval(interval);
        setPollingInterval(null);
      };
    } else if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [conversation, loading, refreshMessages]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault(); // Prevent form submission
    }

    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const result = await sendMessageHook(newMessage);
      if (result) {
        setNewMessage("");
        scrollToBottom(); // Scroll to bottom after sending
      }
    } finally {
      setSending(false);
    }
  };

  // Upload và gửi ảnh
  const handleImageUpload = async (file: File) => {
    if (!conversation) return false;

    // Kiểm tra loại file
    if (!file.type.startsWith("image/")) {
      antMessage.error("Vui lòng chọn file ảnh!");
      return false;
    }

    // Kiểm tra kích thước file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      antMessage.error("File ảnh không được vượt quá 5MB!");
      return false;
    }

    try {
      setUploading(true);
      antMessage.loading("Đang upload ảnh...", 0);

      // Upload ảnh lên server
      const formData = new FormData();
      formData.append("image", file);

      const uploadResponse = await axiosInstance.post(
        "/chat/upload-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Image uploaded:", uploadResponse.data);

      // Gửi tin nhắn với ảnh sử dụng hook
      const result = await sendMessageHook(
        uploadResponse.data.imageUrl,
        "image"
      );

      if (result) {
        antMessage.destroy();
        antMessage.success("Gửi ảnh thành công!");
        scrollToBottom();
      }

      return false; // Prevent default upload behavior
    } catch (error: any) {
      console.error("Error uploading image:", error);
      antMessage.destroy();
      antMessage.error(`Lỗi upload ảnh: ${error.message}`);
      return false;
    } finally {
      setUploading(false);
    }
  };

  // Gửi sản phẩm
  const handleSendProduct = async (product: any, variant: any, size: any) => {
    if (!conversation) return;

    try {
      setSending(true);

      // Tạo object chứa thông tin sản phẩm
      const productData = {
        productId: product._id,
        variantId: variant._id,
        sizeData: size,
        name: product.name,
        description: product.description,
        image: variant.images?.main?.url || "/images/no-image.png",
        price: size.price,
        color: variant.color.colorName,
        size: size.size,
        sku: variant.sku,
      };

      const result = await sendMessageHook(
        JSON.stringify(productData),
        "product"
      );

      if (result) {
        antMessage.success("Gửi sản phẩm thành công!");
        scrollToBottom();
      }
    } catch (error: any) {
      console.error("Error sending product:", error);
      antMessage.error(`Lỗi gửi sản phẩm: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  // Quick reply function
  const handleQuickReply = (message: string) => {
    setNewMessage(message);
  };

  // Quick reply suggestions
  const quickReplies = [
    "Chào bạn! Tôi có thể giúp gì cho bạn?",
    "Cảm ơn bạn đã liên hệ với chúng tôi.",
    "Tôi sẽ kiểm tra và phản hồi bạn ngay.",
    "Bạn có thể cung cấp thêm thông tin không?",
    "Vấn đề này sẽ được xử lý trong 24h.",
    "Cảm ơn bạn đã kiên nhẫn chờ đợi.",
    "Có điều gì khác tôi có thể hỗ trợ không?",
    "Chúc bạn một ngày tốt lành!",
  ];

  const formatTime = (dateString: string) => {
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
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

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>Đang tải...</div>
      </Card>
    );
  }

  if (!conversation) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          Không tìm thấy cuộc trò chuyện
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <Card style={{ marginBottom: "16px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() =>
                  go({
                    to: "/chat",
                    type: "push",
                  })
                }
              >
                Quay lại
              </Button>
              <Title level={4} style={{ margin: 0 }}>
                Chat với {conversation.userId.name}
              </Title>
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
          </Col>
          <Col>
            <Space>
              <Select
                style={{ width: 200 }}
                placeholder="Phân công admin"
                value={conversation.adminId?._id}
                onChange={(value) => assignConversation(value)}
              >
                <Option value="">Không phân công</Option>
                {admins.map((admin: any) => (
                  <Option key={admin._id} value={admin._id}>
                    {admin.name}
                  </Option>
                ))}
              </Select>
              {conversation.status !== "closed" && (
                <Button danger onClick={closeConversation}>
                  Đóng cuộc trò chuyện
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        {/* Messages Area */}
        <Col span={18}>
          <Card>
            <div
              style={{
                height: "500px",
                overflowY: "auto",
                marginBottom: "16px",
              }}
            >
              <List
                dataSource={messages}
                renderItem={(message) => (
                  <List.Item style={{ border: "none", padding: "8px 0" }}>
                    <div style={{ width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            message.senderType === "admin"
                              ? "flex-end"
                              : "flex-start",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "70%",
                            padding: "12px",
                            borderRadius: "12px",
                            backgroundColor:
                              message.senderType === "admin"
                                ? "#1890ff"
                                : message.senderType === "system"
                                ? "#f0f0f0"
                                : "#fff",
                            color:
                              message.senderType === "admin" ? "#fff" : "#000",
                            border:
                              message.senderType === "user"
                                ? "1px solid #d9d9d9"
                                : "none",
                          }}
                        >
                          <div>
                            {message.type === "image" ? (
                              <div>
                                <img
                                  src={message.content}
                                  alt="Ảnh đã gửi"
                                  style={{
                                    maxWidth: "100%",
                                    height: "auto",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    window.open(message.content, "_blank")
                                  }
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/images/image-error.png";
                                    target.alt = "Lỗi tải ảnh";
                                  }}
                                />
                                <div
                                  style={{
                                    fontSize: "12px",
                                    marginTop: "4px",
                                    opacity: 0.8,
                                  }}
                                >
                                  Hình ảnh
                                </div>
                              </div>
                            ) : message.type === "product" ? (
                              <div style={{ maxWidth: "320px" }}>
                                {(() => {
                                  try {
                                    const productData = JSON.parse(
                                      message.content
                                    );
                                    const finalPrice =
                                      productData.price *
                                      (1 - (productData.discount || 0) / 100);
                                    return (
                                      <div
                                        style={{
                                          border: "2px solid #e8f4fd",
                                          borderRadius: "16px",
                                          padding: "16px",
                                          backgroundColor: "#fafcff",
                                          cursor: "pointer",
                                          transition: "all 0.3s ease",
                                          boxShadow:
                                            "0 2px 8px rgba(0,0,0,0.06)",
                                        }}
                                        onClick={() => {
                                          // Navigate to product edit page
                                          window.open(
                                            `/products/edit/${productData.productId}`,
                                            "_blank"
                                          );
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.borderColor =
                                            "#1890ff";
                                          e.currentTarget.style.boxShadow =
                                            "0 4px 16px rgba(24,144,255,0.15)";
                                          e.currentTarget.style.transform =
                                            "translateY(-2px)";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.borderColor =
                                            "#e8f4fd";
                                          e.currentTarget.style.boxShadow =
                                            "0 2px 8px rgba(0,0,0,0.06)";
                                          e.currentTarget.style.transform =
                                            "translateY(0)";
                                        }}
                                      >
                                        {/* Header */}
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            marginBottom: "12px",
                                            paddingBottom: "8px",
                                            borderBottom: "1px solid #e8f4fd",
                                          }}
                                        >
                                          <span
                                            style={{
                                              fontSize: "11px",
                                              fontWeight: "600",
                                              color: "#1890ff",
                                              textTransform: "uppercase",
                                              letterSpacing: "0.5px",
                                            }}
                                          >
                                            Sản phẩm đã gửi
                                          </span>
                                          {productData.discount > 0 && (
                                            <div
                                              style={{
                                                marginLeft: "auto",
                                                backgroundColor: "#ff4d4f",
                                                color: "white",
                                                fontSize: "10px",
                                                fontWeight: "bold",
                                                padding: "2px 6px",
                                                borderRadius: "12px",
                                              }}
                                            >
                                              -{productData.discount}%
                                            </div>
                                          )}
                                        </div>

                                        {/* Product content */}
                                        <div
                                          style={{
                                            display: "flex",
                                            gap: "12px",
                                          }}
                                        >
                                          <div style={{ position: "relative" }}>
                                            <img
                                              src={productData.image}
                                              alt={productData.name}
                                              style={{
                                                width: "70px",
                                                height: "70px",
                                                borderRadius: "12px",
                                                objectFit: "cover",
                                                border: "2px solid #f0f9ff",
                                                boxShadow:
                                                  "0 2px 8px rgba(0,0,0,0.1)",
                                              }}
                                              onError={(e) => {
                                                const target =
                                                  e.target as HTMLImageElement;
                                                target.src =
                                                  "/images/no-image.png";
                                              }}
                                            />
                                          </div>

                                          <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                              style={{
                                                fontWeight: "bold",
                                                marginBottom: "8px",
                                                fontSize: "14px",
                                                color: "#262626",
                                                lineHeight: "1.4",
                                              }}
                                            >
                                              {productData.name}
                                            </div>

                                            {/* Variant tags */}
                                            <div
                                              style={{
                                                display: "flex",
                                                gap: "6px",
                                                marginBottom: "10px",
                                                flexWrap: "wrap",
                                              }}
                                            >
                                              <span
                                                style={{
                                                  backgroundColor: "#e6f7ff",
                                                  color: "#0050b3",
                                                  fontSize: "11px",
                                                  fontWeight: "500",
                                                  padding: "3px 8px",
                                                  borderRadius: "8px",
                                                  border: "1px solid #91d5ff",
                                                }}
                                              >
                                                {productData.color}
                                              </span>
                                              <span
                                                style={{
                                                  backgroundColor: "#f6ffed",
                                                  color: "#389e0d",
                                                  fontSize: "11px",
                                                  fontWeight: "500",
                                                  padding: "3px 8px",
                                                  borderRadius: "8px",
                                                  border: "1px solid #b7eb8f",
                                                }}
                                              >
                                                {productData.size}
                                              </span>
                                            </div>

                                            {/* Price */}
                                            <div
                                              style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                              }}
                                            >
                                              <span
                                                style={{
                                                  fontSize: "16px",
                                                  fontWeight: "bold",
                                                  color: "#ff4d4f",
                                                }}
                                              >
                                                {finalPrice.toLocaleString(
                                                  "vi-VN"
                                                )}
                                                đ
                                              </span>
                                              {productData.discount > 0 && (
                                                <span
                                                  style={{
                                                    fontSize: "12px",
                                                    textDecoration:
                                                      "line-through",
                                                    color: "#8c8c8c",
                                                    fontWeight: "normal",
                                                  }}
                                                >
                                                  {productData.price.toLocaleString(
                                                    "vi-VN"
                                                  )}
                                                  đ
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Footer */}
                                        <div
                                          style={{
                                            marginTop: "12px",
                                            paddingTop: "12px",
                                            borderTop: "1px solid #e8f4fd",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                          }}
                                        >
                                          <span
                                            style={{
                                              fontSize: "11px",
                                              color: "#8c8c8c",
                                              fontStyle: "italic",
                                            }}
                                          >
                                            Click để xem chi tiết
                                          </span>
                                          <div
                                            style={{
                                              width: "20px",
                                              height: "20px",
                                              borderRadius: "50%",
                                              backgroundColor: "#f0f9ff",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              fontSize: "12px",
                                              color: "#1890ff",
                                            }}
                                          >
                                            →
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  } catch (error) {
                                    return (
                                      <div
                                        style={{
                                          backgroundColor: "#fff2f0",
                                          border: "1px solid #ffccc7",
                                          borderRadius: "8px",
                                          padding: "12px",
                                          color: "#ff4d4f",
                                        }}
                                      >
                                        ⚠️ Lỗi hiển thị sản phẩm
                                      </div>
                                    );
                                  }
                                })()}
                              </div>
                            ) : (
                              message.content
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              marginTop: "4px",
                              opacity: 0.7,
                            }}
                          >
                            {message.senderType === "admin" &&
                              `${message.senderId?.name || "Admin"} • `}
                            {formatTime(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {conversation.status !== "closed" && (
              <div style={{ marginBottom: "16px" }}>
                <Text strong style={{ marginBottom: "8px", display: "block" }}>
                  Câu trả lời nhanh:
                </Text>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      size="small"
                      onClick={() => handleQuickReply(reply)}
                      style={{
                        borderRadius: "16px",
                        border: "1px solid #d9d9d9",
                        backgroundColor: "#fafafa",
                        color: "#666",
                        height: "auto",
                        padding: "4px 12px",
                        fontSize: "12px",
                        lineHeight: "1.4",
                      }}
                      ghost
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            {conversation.status !== "closed" && (
              <div>
                <form onSubmit={handleSendMessage}>
                  <TextArea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div
                    style={{
                      marginTop: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Space>
                      <Upload
                        beforeUpload={handleImageUpload}
                        showUploadList={false}
                        accept="image/*"
                      >
                        <Button
                          icon={<PictureOutlined />}
                          loading={uploading}
                          disabled={uploading}
                        >
                          Gửi ảnh
                        </Button>
                      </Upload>
                      <Button
                        icon={<ShoppingOutlined />}
                        onClick={() => setShowProductSelector(true)}
                        disabled={sending}
                      >
                        Gửi sản phẩm
                      </Button>
                    </Space>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSendMessage}
                      loading={sending}
                      disabled={!newMessage.trim()}
                      htmlType="submit"
                    >
                      Gửi tin nhắn
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </Card>
        </Col>

        {/* Info Sidebar */}
        <Col span={6}>
          <Card title="Thông tin khách hàng">
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text strong>Tên:</Text>
                <br />
                <Text>{conversation.userId.name}</Text>
              </div>
              <div>
                <Text strong>Email:</Text>
                <br />
                <Text>{conversation.userId.email}</Text>
              </div>
              {conversation.userId.phone && (
                <div>
                  <Text strong>Số điện thoại:</Text>
                  <br />
                  <Text>{conversation.userId.phone}</Text>
                </div>
              )}
              <Divider />
              <div>
                <Text strong>Ngày tạo:</Text>
                <br />
                <Text>{formatTime(conversation.createdAt)}</Text>
              </div>
              <div>
                <Text strong>Tin nhắn cuối:</Text>
                <br />
                <Text>{formatTime(conversation.lastMessageAt)}</Text>
              </div>
              {conversation.adminId && (
                <div>
                  <Text strong>Admin phụ trách:</Text>
                  <br />
                  <Text>{conversation.adminId.name}</Text>
                </div>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Product Selector Modal */}
      <ProductSelector
        visible={showProductSelector}
        onClose={() => setShowProductSelector(false)}
        onSelectProduct={handleSendProduct}
      />
    </div>
  );
};

export default ChatDetail;
