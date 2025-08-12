import React, { useState } from "react";
import { List, useTable, DateField, TagField } from "@refinedev/antd";
import {
  Table,
  Space,
  Button,
  Tag,
  Typography,
  Card,
  Statistic,
  Row,
  Col,
  message,
  Modal,
  Input,
} from "antd";
import {
  EyeOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useCustom, useNavigation } from "@refinedev/core";
import { axiosInstance } from "../../axiosInstance";

const { Title, Text } = Typography;
const { TextArea } = Input;

export const RefundList: React.FC = () => {
  const { show } = useNavigation();
  const [processingRefund, setProcessingRefund] = useState<string | null>(null);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [refundNote, setRefundNote] = useState("");

  // Lấy danh sách đơn hàng cần hoàn tiền
  const {
    data: refundData,
    isLoading,
    error,
    refetch,
  } = useCustom({
    url: "/admin/refunds",
    method: "get",
  });

  // Thống kê hoàn tiền
  const refunds = Array.isArray(refundData?.data.data)
    ? refundData.data.data
    : [];
  const stats = {
    total: refunds.length,
    pending: refunds.filter(
      (r: any) =>
        !r.paymentDetails?.refundStatus ||
        r.paymentDetails?.refundStatus === "pending"
    ).length,
    processing: refunds.filter(
      (r: any) => r.paymentDetails?.refundStatus === "processing"
    ).length,
    completed: refunds.filter(
      (r: any) => r.paymentDetails?.refundStatus === "completed"
    ).length,
    failed: refunds.filter(
      (r: any) => r.paymentDetails?.refundStatus === "failed"
    ).length,
  };

  // Xử lý hoàn tiền thủ công
  const handleManualRefund = (record: any) => {
    setSelectedOrder(record);
    setRefundNote("");
    setRefundModalVisible(true);
  };

  const processManualRefund = async () => {
    if (!selectedOrder) return;

    try {
      setProcessingRefund(selectedOrder.orderId);

      const response = await axiosInstance.post(
        `/admin/refunds/${selectedOrder.orderId}/manual`,
        {
          note: refundNote,
        }
      );

      if (response.data.success) {
        message.success("Hoàn tiền thành công!");
        refetch(); // Reload data
        setRefundModalVisible(false);
      } else {
        message.error(`Hoàn tiền thất bại: ${response.data.message}`);
      }
    } catch (error: any) {
      message.error(
        `Lỗi khi xử lý hoàn tiền: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setProcessingRefund(null);
    }
  };

  const getRefundStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "orange";
      case "processing":
        return "blue";
      case "completed":
        return "green";
      case "failed":
        return "red";
      default:
        return "default";
    }
  };

  const getRefundStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "processing":
        return "Đang xử lý";
      case "completed":
        return "Hoàn thành";
      case "failed":
        return "Thất bại";
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "momo":
        return "MoMo";
      case "zalopay":
        return "ZaloPay";
      case "cod":
        return "COD";
      case "bank_transfer":
        return "Chuyển khoản";
      default:
        return method;
    }
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      render: (value: string, record: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => show("orders", record._id)}
        >
          #{value}
        </Button>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: ["user", "email"],
      key: "customerName",
      render: (value: string, record: any) => (
        <div>
          <Text strong>{record.receiver?.name || "N/A"}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {value || ""}
          </Text>
        </div>
      ),
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (value: string) => (
        <Tag color="blue">{getPaymentMethodText(value)}</Tag>
      ),
    },
    {
      title: "Số tiền hoàn",
      dataIndex: "finalAmount",
      key: "finalAmount",
      render: (value: number) => (
        <Text strong style={{ color: "#f50" }}>
          {value?.toLocaleString("vi-VN")} ₫
        </Text>
      ),
    },
    {
      title: "Trạng thái hoàn tiền",
      dataIndex: ["paymentDetails", "refundStatus"],
      key: "refundStatus",
      render: (value: string) => (
        <Tag color={getRefundStatusColor(value || "pending")}>
          {getRefundStatusText(value || "pending")}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => (
        <DateField value={value} format="DD/MM/YYYY HH:mm" />
      ),
    },
    {
      title: "Ngày yêu cầu hoàn tiền",
      dataIndex: ["paymentDetails", "refundRequestedAt"],
      key: "refundRequestedAt",
      render: (value: string) =>
        value ? <DateField value={value} format="DD/MM/YYYY HH:mm" /> : "-",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (record: any) => {
        const canRefund =
          record.paymentDetails?.refundStatus === "pending" ||
          record.paymentDetails?.refundStatus === "failed" ||
          record.paymentDetails?.refundStatus === "processing";
        const isProcessing = processingRefund === record.orderId;

        return (
          <Space>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => show("orders", record._id)}
            >
              Xem chi tiết
            </Button>
            {canRefund && (
              <Button
                type="default"
                icon={<ReloadOutlined />}
                size="small"
                loading={isProcessing}
                disabled={isProcessing}
                onClick={() => handleManualRefund(record)}
              >
                Xử lý hoàn tiền
              </Button>
            )}
          </Space>
        );
      },
    },
  ];
  if (error) {
    return (
      <Card>
        <Text type="danger">
          Lỗi khi tải dữ liệu hoàn tiền:{" "}
          {error?.message || "Vui lòng thử lại sau"}
        </Text>
      </Card>
    );
  }

  return (
    <List
      title="Quản lý hoàn tiền tự động"
      headerProps={{
        subTitle: "Danh sách các đơn hàng cần hoàn tiền tự động",
      }}
    >
      {/* Thống kê */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Tổng số yêu cầu"
              value={stats.total}
              prefix={<DollarOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Chờ xử lý"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Đang xử lý"
              value={stats.processing}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Hoàn thành"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Col>
        </Row>
        {stats.failed > 0 && (
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={6}>
              <Statistic
                title="Thất bại"
                value={stats.failed}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: "#f5222d" }}
              />
            </Col>
          </Row>
        )}
      </Card>

      <Table
        dataSource={refunds}
        columns={columns}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} yêu cầu`,
        }}
        scroll={{ x: 1000 }}
      />

      {/* Modal xác nhận hoàn tiền */}
      <Modal
        title="Xử lý hoàn tiền thủ công"
        open={refundModalVisible}
        onCancel={() => setRefundModalVisible(false)}
        onOk={processManualRefund}
        confirmLoading={!!processingRefund}
        okText="Xử lý hoàn tiền"
        cancelText="Hủy"
      >
        {selectedOrder && (
          <div>
            <p>
              <strong>Đơn hàng:</strong> #{selectedOrder.orderId}
            </p>
            <p>
              <strong>Khách hàng:</strong> {selectedOrder.receiver?.name}
            </p>
            <p>
              <strong>Số tiền:</strong>{" "}
              {selectedOrder.finalAmount?.toLocaleString("vi-VN")} ₫
            </p>
            <p>
              <strong>Phương thức:</strong>{" "}
              {getPaymentMethodText(selectedOrder.paymentMethod)}
            </p>
            <p>
              <strong>Trạng thái hiện tại:</strong>{" "}
              <Tag
                color={getRefundStatusColor(
                  selectedOrder.paymentDetails?.refundStatus || "pending"
                )}
              >
                {getRefundStatusText(
                  selectedOrder.paymentDetails?.refundStatus || "pending"
                )}
              </Tag>
            </p>

            <div style={{ marginTop: 16 }}>
              <Text strong>Ghi chú (tùy chọn):</Text>
              <TextArea
                rows={3}
                value={refundNote}
                onChange={(e) => setRefundNote(e.target.value)}
                placeholder="Nhập ghi chú về việc xử lý hoàn tiền..."
                style={{ marginTop: 8 }}
              />
            </div>
          </div>
        )}
      </Modal>
    </List>
  );
};

export default RefundList;
