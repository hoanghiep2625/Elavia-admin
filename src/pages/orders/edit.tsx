import React, { useState, useEffect } from "react";
import { Edit, useForm } from "@refinedev/antd";
import {
  Form,
  Input,
  Row,
  Col,
  Card,
  Select,
  Typography,
  List,
  Tag,
  Space,
  Button,
  Modal,
  Timeline,
  message,
  Popconfirm,
  Input as AntdInput,
} from "antd";
import { useCustom, useUpdate, useOne } from "@refinedev/core";
import { HistoryOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

const getStatusColor = (status: string) => {
  switch (status) {
    case "Chờ xác nhận":
      return "orange";
    case "Đã xác nhận":
      return "blue";
    case "Người bán huỷ":
    case "Người mua huỷ":
      return "red";
    case "Đang giao hàng":
      return "cyan";
    case "Giao hàng thành công":
      return "green";
    case "Đã nhận hàng":
      return "lime";
    case "Giao hàng thất bại":
      return "volcano";
    case "Chờ thanh toán":
      return "gold";
    case "Đã thanh toán":
      return "purple";
    case "Thanh toán khi nhận hàng":
      return "geekblue";
    case "Huỷ do quá thời gian thanh toán":
      return "magenta";
    case "Giao dịch bị từ chối do nhà phát hành":
      return "red";
    case "Khiếu nại":
      return "orange";
    case "Đang xử lý khiếu nại":
      return "processing";
    case "Khiếu nại được giải quyết":
      return "success";
    case "Khiếu nại bị từ chối":
      return "error";
    default:
      return "default";
  }
};

export const OrderEdit = () => {
  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: "orders",
    action: "edit",
    onMutationSuccess: () => {
      message.success("Cập nhật đơn hàng thành công");
      // Refresh lịch sử sau khi cập nhật
      if (order?.orderId) {
        refetchHistory();
      }
    },
  });

  const order = queryResult?.data?.data;

  // Hook để cancel order
  const { mutate: cancelOrder } = useUpdate();

  // State cho lịch sử trạng thái
  const [showHistory, setShowHistory] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Lấy lịch sử trạng thái
  const { data: historyData, refetch: refetchHistory } = useCustom({
    url: `/admin/orders/${order?.orderId}/status-history`,
    method: "get",
    queryOptions: {
      enabled: !!order?.orderId && showHistory,
      onSuccess: () => setLoadingHistory(false),
      onError: () => setLoadingHistory(false),
    },
  });

  useEffect(() => {
    if (historyData?.data?.data?.statusHistory) {
      setStatusHistory(historyData.data.data.statusHistory);
    }
  }, [historyData]);

  // State cho modal hủy đơn hàng
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // State cho xử lý hoàn tiền
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [checkStatusLoading, setCheckStatusLoading] = useState(false);
  const [refundForm] = Form.useForm();

  // Hàm xử lý hoàn tiền tự động
  const handleAutoRefund = async (orderId: string) => {
    try {
      setRefundLoading(true);
      const response = await axios.patch(
        `http://localhost:8080/api/admin/refunds/${orderId}`,
        {
          action: "auto_refund",
          adminNote: "Hoàn tiền tự động qua API",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.data.success) {
        message.success("Hoàn tiền tự động thành công!");
        queryResult?.refetch(); // Refresh order data
      } else {
        message.error(`Hoàn tiền thất bại: ${response.data.message}`);
      }
    } catch (error: any) {
      console.error("Auto refund error:", error);
      message.error(
        error.response?.data?.message || "Lỗi khi hoàn tiền tự động"
      );
    } finally {
      setRefundLoading(false);
    }
  };

  // Hàm kiểm tra trạng thái hoàn tiền
  const checkRefundStatus = async (orderId: string) => {
    try {
      setCheckStatusLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/admin/refunds/${orderId}/status`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.data.success) {
        message.success("Đã cập nhật trạng thái hoàn tiền!");
        queryResult?.refetch(); // Refresh order data
      } else {
        message.warning("Không có cập nhật trạng thái mới");
      }
    } catch (error: any) {
      console.error("Check refund status error:", error);
      message.error("Lỗi khi kiểm tra trạng thái hoàn tiền");
    } finally {
      setCheckStatusLoading(false);
    }
  };

  // Hàm xử lý hoàn tiền thủ công
  const handleManualRefund = async (values: any) => {
    try {
      setRefundLoading(true);
      const response = await axios.patch(
        `http://localhost:8080/api/admin/refunds/${order?.orderId}`,
        {
          action: values.action,
          adminNote: values.adminNote,
          refundMethod: values.refundMethod,
          refundTransactionId: values.refundTransactionId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.data.success) {
        message.success("Xử lý hoàn tiền thành công!");
        setRefundModalVisible(false);
        refundForm.resetFields();
        queryResult?.refetch(); // Refresh order data
      } else {
        message.error(`Xử lý hoàn tiền thất bại: ${response.data.message}`);
      }
    } catch (error: any) {
      console.error("Manual refund error:", error);
      message.error("Lỗi khi xử lý hoàn tiền");
    } finally {
      setRefundLoading(false);
    }
  };

  // Hàm xử lý hủy đơn hàng
  const handleCancelOrder = () => {
    if (!order?._id || !cancelReason.trim()) {
      message.error("Vui lòng nhập lý do hủy đơn hàng");
      return;
    }

    cancelOrder(
      {
        resource: "orders",
        id: order._id,
        values: {
          paymentStatus: "Người bán huỷ",
          shippingStatus: "Người bán huỷ",
          note: "Đơn hàng được hủy bởi admin",
          reason: cancelReason,
        },
      },
      {
        onSuccess: (data: any) => {
          message.success("Hủy đơn hàng thành công");

          // Hiển thị thông tin hoàn tiền nếu có
          if (data?.refundInfo?.requiresRefund) {
            Modal.info({
              title: "Thông tin hoàn tiền",
              content: (
                <div>
                  <p>
                    <strong>Số tiền:</strong>{" "}
                    {order?.finalAmount?.toLocaleString("vi-VN")}đ
                  </p>
                  <p>
                    <strong>Phương thức thanh toán:</strong>{" "}
                    {order?.paymentMethod}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong> {data.refundInfo.message}
                  </p>
                  {data.refundInfo.instructions && (
                    <p>
                      <strong>Hướng dẫn:</strong> {data.refundInfo.instructions}
                    </p>
                  )}
                </div>
              ),
              width: 500,
            });
          }

          setShowCancelModal(false);
          setCancelReason("");
          // Refresh data
          queryResult?.refetch();
          if (order?.orderId) {
            refetchHistory();
          }
        },
        onError: (error: any) => {
          message.error(`Lỗi khi hủy đơn hàng: ${error.message}`);
        },
      }
    );
  };

  // Custom save function để gửi note và reason
  const handleSave = () => {
    formProps.form?.validateFields().then((values: any) => {
      const updateData = {
        ...values,
        // Gửi note và reason nếu có
        note: values.note || "",
        reason: values.reason || "",
      };

      formProps.onFinish?.(updateData);
    });
  };

  // Logic trạng thái được phép chuyển đổi cho admin (không bao gồm khiếu nại, đã nhận hàng và các trạng thái hủy)
  const allowedShippingStatusTransitions: Record<string, string[]> = {
    "Chờ xác nhận": ["Đã xác nhận"], // Loại bỏ option hủy - chỉ hủy qua nút riêng
    "Đã xác nhận": ["Đang giao hàng"], // Loại bỏ option hủy - chỉ hủy qua nút riêng
    "Đang giao hàng": ["Giao hàng thành công", "Giao hàng thất bại"], // Loại bỏ option hủy - chỉ hủy qua nút riêng
    "Giao hàng thành công": [], // Admin không thể chuyển sang "Đã nhận hàng" - chỉ user/cronjob
    "Đã nhận hàng": [], // Trạng thái cuối
    "Giao hàng thất bại": [], // Không cho phép hủy từ trạng thái này - chỉ hủy qua nút riêng
    "Khiếu nại": ["Đang xử lý khiếu nại"], // Chỉ khi user đã khiếu nại
    "Đang xử lý khiếu nại": [
      "Khiếu nại được giải quyết",
      "Khiếu nại bị từ chối",
    ], // Admin xử lý khiếu nại
    "Khiếu nại được giải quyết": [],
    "Khiếu nại bị từ chối": [],
    "Người mua huỷ": [], // Trạng thái cuối - đã hủy
    "Người bán huỷ": [], // Trạng thái cuối - đã hủy
  };

  // Helper function để check xem order có thể cancel hay không (cho admin)
  const canCancelOrder = (order: any) => {
    // Không thể hủy nếu đã bị hủy hoặc đã hoàn thành
    if (
      order?.paymentStatus === "Người bán huỷ" ||
      order?.paymentStatus === "Người mua huỷ" ||
      order?.shippingStatus === "Người bán huỷ" ||
      order?.shippingStatus === "Người mua huỷ" ||
      order?.shippingStatus === "Đã nhận hàng" ||
      order?.shippingStatus === "Giao hàng thành công" ||
      order?.shippingStatus === "Khiếu nại" ||
      order?.shippingStatus === "Đang xử lý khiếu nại" ||
      order?.shippingStatus === "Khiếu nại được giải quyết" ||
      order?.shippingStatus === "Khiếu nại bị từ chối"
    ) {
      return false;
    }

    // Admin chỉ có thể hủy trước khi giao hàng thành công
    const allowedShippingStatuses = [
      "Chờ xác nhận",
      "Đã xác nhận",
      "Đang giao hàng",
      "Giao hàng thất bại",
    ];

    return allowedShippingStatuses.includes(order?.shippingStatus);
  };

  // Helper function để check xem shipping status có thể thay đổi hay không
  const canChangeShippingStatus = (currentStatus: string) => {
    return (allowedShippingStatusTransitions[currentStatus] || []).length > 0;
  };

  // Call API user
  const userId = order?.user?._id;
  const { data: userData } = useOne({
    resource: "users",
    id: userId,
    queryOptions: { enabled: !!userId },
  });
  const userInfo = userData?.data;

  // Địa chỉ API
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // Lưu id đã chọn
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");

  // Lấy dữ liệu tỉnh/thành phố
  useEffect(() => {
    axios
      .get(
        "https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json"
      )
      .then((res) => setCities(res.data));
  }, []);

  // Khi có dữ liệu order, set lại các select
  useEffect(() => {
    if (order?.receiver?.cityName) {
      const city = cities.find((c) => c.Name === order.receiver.cityName);
      if (city) setSelectedCity(city.Id);
    }
  }, [order, cities]);

  useEffect(() => {
    if (selectedCity) {
      const city = cities.find((c) => c.Id === selectedCity);
      setDistricts(city?.Districts || []);
      // Nếu có sẵn districtName thì set
      if (order?.receiver?.districtName) {
        const district = city?.Districts?.find(
          (d: any) => d.Name === order.receiver.districtName
        );
        if (district) setSelectedDistrict(district.Id);
      }
    } else {
      setDistricts([]);
      setSelectedDistrict("");
    }
    setWards([]);
    setSelectedWard("");
  }, [selectedCity, cities, order]);

  useEffect(() => {
    if (selectedDistrict) {
      const district = districts.find((d) => d.Id === selectedDistrict);
      setWards(district?.Wards || []);
      // Nếu có sẵn wardName thì set
      if (order?.receiver?.wardName) {
        const ward = district?.Wards?.find(
          (w: any) => w.Name === order.receiver.wardName
        );
        if (ward) setSelectedWard(ward.Id);
      }
    } else {
      setWards([]);
      setSelectedWard("");
    }
  }, [selectedDistrict, districts, order]);

  // Khi chọn select thì cập nhật form
  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    const city = cities.find((c) => c.Id === value);
    formProps.form?.setFieldsValue({
      receiver: {
        ...formProps.form?.getFieldValue("receiver"),
        cityName: city?.Name || "",
        districtName: "",
        wardName: "",
      },
    });
    setSelectedDistrict("");
    setSelectedWard("");
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    const district = districts.find((d) => d.Id === value);
    formProps.form?.setFieldsValue({
      receiver: {
        ...formProps.form?.getFieldValue("receiver"),
        districtName: district?.Name || "",
        wardName: "",
      },
    });
    setSelectedWard("");
  };

  const handleWardChange = (value: string) => {
    setSelectedWard(value);
    const ward = wards.find((w) => w.Id === value);
    formProps.form?.setFieldsValue({
      receiver: {
        ...formProps.form?.getFieldValue("receiver"),
        wardName: ward?.Name || "",
      },
    });
  };

  return (
    <Edit
      saveButtonProps={{
        ...saveButtonProps,
        onClick: handleSave,
      }}
      title="Chỉnh sửa đơn hàng"
    >
      <Form {...formProps} layout="vertical">
        <Row gutter={24}>
          {/* Thông tin người đặt */}
          <Col span={12}>
            <Card title="Thông tin người đặt">
              <div style={{ marginLeft: 16 }}>
                <div style={{ marginBottom: 8 }}>
                  <strong>Họ tên:</strong>
                  <div>{userInfo?.name || order?.user?.name || "Chưa có"}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Email:</strong>
                  <div>{order?.user?.email || "Chưa có"}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Số điện thoại:</strong>
                  <div>
                    {userInfo?.phone || order?.user?.phone || "Chưa có"}
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Thông tin người nhận (có thể sửa) */}
          <Col span={12}>
            <Card title="Thông tin người nhận (có thể sửa)">
              <Form.Item
                label="Tên khách hàng"
                name={["receiver", "name"]}
                rules={[
                  { required: true, message: "Vui lòng nhập tên khách hàng" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Số điện thoại"
                name={["receiver", "phone"]}
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Số điện thoại phải có 10 chữ số",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Địa chỉ"
                name={["receiver", "address"]}
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
              >
                <Input placeholder="Số nhà, đường..." />
              </Form.Item>
              <Row gutter={8}>
                <Col span={8}>
                  <Form.Item
                    label="Tỉnh/Thành phố"
                    name={["receiver", "cityName"]}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn tỉnh/thành phố",
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Chọn tỉnh/thành phố"
                      value={selectedCity}
                      onChange={handleCityChange}
                      filterOption={(input, option) => {
                        const label =
                          typeof option?.children === "string"
                            ? option.children
                            : Array.isArray(option?.children)
                            ? option.children.join(" ")
                            : "";
                        return label
                          .toLowerCase()
                          .includes(input.toLowerCase());
                      }}
                    >
                      {cities.map((c) => (
                        <Select.Option key={c.Id} value={c.Id}>
                          {c.Name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Quận/Huyện"
                    name={["receiver", "districtName"]}
                    rules={[
                      { required: true, message: "Vui lòng chọn quận/huyện" },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Chọn quận/huyện"
                      value={selectedDistrict}
                      onChange={handleDistrictChange}
                      disabled={!selectedCity}
                      filterOption={(input, option) => {
                        const label =
                          typeof option?.children === "string"
                            ? option.children
                            : Array.isArray(option?.children)
                            ? option.children.join(" ")
                            : "";
                        return label
                          .toLowerCase()
                          .includes(input.toLowerCase());
                      }}
                    >
                      {districts.map((d) => (
                        <Select.Option key={d.Id} value={d.Id}>
                          {d.Name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Phường/Xã"
                    name={["receiver", "wardName"]}
                    rules={[
                      { required: true, message: "Vui lòng chọn phường/xã" },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Chọn phường/xã"
                      value={selectedWard}
                      onChange={handleWardChange}
                      disabled={!selectedDistrict}
                      filterOption={(input, option) => {
                        const label =
                          typeof option?.children === "string"
                            ? option.children
                            : Array.isArray(option?.children)
                            ? option.children.join(" ")
                            : "";
                        return label
                          .toLowerCase()
                          .includes(input.toLowerCase());
                      }}
                    >
                      {wards.map((w) => (
                        <Select.Option key={w.Id} value={w.Id}>
                          {w.Name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Thông tin đơn hàng */}
        <Card style={{ marginTop: 24 }} title="Thông tin đơn hàng">
          <Row gutter={24}>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontWeight: 600, color: "#1677ff" }}>
                  Mã đơn hàng
                </span>
                <br />
                <Text strong>{order?.orderId || "--"}</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontWeight: 600, color: "#1677ff" }}>
                  Tổng tiền
                </span>
                <br />
                <Text strong>
                  {order?.finalAmount?.toLocaleString("vi-VN") + "đ" || "--"}
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontWeight: 600 }}>Phương thức thanh toán</span>
                <br />
                <Text>
                  {order?.paymentMethod === "COD"
                    ? "Thanh toán khi nhận hàng"
                    : order?.paymentMethod || "--"}
                </Text>
              </div>
            </Col>
          </Row>
          <Form.Item label="Sản phẩm">
            <List
              dataSource={order?.items || []}
              renderItem={(item: any) => {
                // Lấy dữ liệu từ snapshot productInfo trước, fallback về productVariantId
                const productData = item.productInfo || item.productVariantId;
                const productName =
                  item.productInfo?.productName ||
                  item.productInfo?.product?.name ||
                  item.productName ||
                  "Không có tên";
                const productImage = productData?.images?.main?.url;
                const productColor = productData?.color;

                // Tìm giá theo size từ snapshot
                const sizeData = productData?.sizes?.find(
                  (s: any) => s.size === item.size
                );
                const price = sizeData?.price || item.price || 0;

                return (
                  <List.Item>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 16 }}
                    >
                      <img
                        src={productImage}
                        alt={productName}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "1px solid #eee",
                        }}
                      />
                      <div>
                        <div>
                          <Text strong>{productName}</Text>
                        </div>
                        <div>
                          <span>
                            Size: <b>{item.size}</b> | SL:{" "}
                            <b>{item.quantity}</b> | Giá:{" "}
                            <b>{price?.toLocaleString("vi-VN")}đ</b>
                          </span>
                        </div>
                        <div>
                          <span>
                            Màu:{" "}
                            <Tag
                              color="default"
                              style={{
                                background:
                                  typeof productColor === "string"
                                    ? productColor
                                    : productColor?.baseColor || "#f0f0f0",
                                color: "#000",
                              }}
                            >
                              {typeof productColor === "string"
                                ? productColor
                                : productColor?.colorName || "Không có"}
                            </Tag>
                          </span>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
              locale={{ emptyText: "Không có sản phẩm" }}
            />
          </Form.Item>
        </Card>

        {/* Trạng thái đơn hàng */}
        <Row gutter={24} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Card title="Trạng thái thanh toán">
              <div style={{ marginBottom: 16 }}>
                <Text>Trạng thái hiện tại: </Text>
                <Tag color={getStatusColor(order?.paymentStatus)}>
                  {order?.paymentStatus || "Chưa xác định"}
                </Tag>
              </div>

              {/* Hiển thị thông tin hoàn tiền nếu có */}
              {order?.paymentDetails?.refundRequested && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    backgroundColor: "#fff7e6",
                    border: "1px solid #ffd591",
                    borderRadius: 6,
                  }}
                >
                  <Text strong style={{ color: "#d46b08" }}>
                    🔄 Thông tin hoàn tiền:
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Text>Trạng thái: </Text>
                    <Tag
                      color={
                        order.paymentDetails.refundStatus === "Chờ xử lý"
                          ? "orange"
                          : order.paymentDetails.refundStatus === "Đã duyệt"
                          ? "blue"
                          : order.paymentDetails.refundStatus ===
                            "Đã hoàn thành"
                          ? "green"
                          : "red"
                      }
                    >
                      {order.paymentDetails.refundStatus || "Chờ xử lý"}
                    </Tag>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary">
                      Số tiền: {order?.finalAmount?.toLocaleString("vi-VN")}đ
                    </Text>
                  </div>
                  {order.paymentDetails.refundRequestedAt && (
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary">
                        Yêu cầu lúc:{" "}
                        {new Date(
                          order.paymentDetails.refundRequestedAt
                        ).toLocaleString("vi-VN")}
                      </Text>
                    </div>
                  )}

                  {/* Nút xử lý hoàn tiền cho admin */}
                  {order.paymentDetails.refundStatus === "Chờ xử lý" && (
                    <div style={{ marginTop: 12 }}>
                      <Space>
                        {/* Nút hoàn tiền tự động cho MoMo/ZaloPay */}
                        {(order.paymentMethod === "MoMo" ||
                          order.paymentMethod === "zalopay") && (
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => handleAutoRefund(order.orderId)}
                            loading={refundLoading}
                          >
                            🤖 Hoàn tiền tự động
                          </Button>
                        )}
                        <Button
                          size="small"
                          onClick={() => setRefundModalVisible(true)}
                        >
                          ⚙️ Xử lý thủ công
                        </Button>
                        <Button
                          size="small"
                          type="link"
                          onClick={() => checkRefundStatus(order.orderId)}
                          loading={checkStatusLoading}
                        >
                          🔍 Kiểm tra trạng thái
                        </Button>
                      </Space>
                    </div>
                  )}

                  {/* Hiển thị thông tin hoàn tiền đã hoàn thành */}
                  {order.paymentDetails.refundStatus === "Đã hoàn thành" && (
                    <div style={{ marginTop: 8 }}>
                      {order.paymentDetails.refundMethod && (
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary">
                            Phương thức: {order.paymentDetails.refundMethod}
                          </Text>
                        </div>
                      )}
                      {order.paymentDetails.refundId && (
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary">
                            Mã hoàn tiền: {order.paymentDetails.refundId}
                          </Text>
                        </div>
                      )}
                      {order.paymentDetails.refundCompletedAt && (
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary">
                            Hoàn thành lúc:{" "}
                            {new Date(
                              order.paymentDetails.refundCompletedAt
                            ).toLocaleString("vi-VN")}
                          </Text>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <Text type="secondary">
                Trạng thái thanh toán được tự động quản lý bởi hệ thống và không
                thể chỉnh sửa trực tiếp.
              </Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Trạng thái giao hàng">
              {!canChangeShippingStatus(order?.shippingStatus) ? (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Text>Trạng thái hiện tại: </Text>
                    <Tag color={getStatusColor(order?.shippingStatus)}>
                      {order?.shippingStatus || "Chưa xác định"}
                    </Tag>
                  </div>
                  <Text type="secondary">
                    Trạng thái này không thể thay đổi nữa.
                  </Text>
                </div>
              ) : (
                <Form.Item
                  label="Trạng thái giao hàng"
                  name="shippingStatus"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn trạng thái giao hàng",
                    },
                  ]}
                >
                  <Select
                    placeholder="Chọn trạng thái giao hàng"
                    defaultValue={order?.shippingStatus}
                  >
                    {/* Trạng thái hiện tại */}
                    <Select.Option value={order?.shippingStatus}>
                      <Tag
                        color={getStatusColor(order?.shippingStatus)}
                        style={{ marginRight: 8 }}
                      >
                        ●
                      </Tag>
                      {order?.shippingStatus} (hiện tại)
                    </Select.Option>

                    {/* Các trạng thái được phép chuyển đổi */}
                    {(
                      allowedShippingStatusTransitions[order?.shippingStatus] ||
                      []
                    ).map((status) => (
                      <Select.Option key={status} value={status}>
                        <Tag
                          color={getStatusColor(status)}
                          style={{ marginRight: 8 }}
                        >
                          ●
                        </Tag>
                        {status}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
            </Card>
          </Col>
        </Row>

        {/* Note và Reason cho admin */}
        <Row gutter={24} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Form.Item label="Ghi chú" name="note">
              <AntdInput.TextArea
                rows={3}
                placeholder="Ghi chú thay đổi (tùy chọn)"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Lý do" name="reason">
              <AntdInput.TextArea
                rows={3}
                placeholder="Lý do thay đổi (tùy chọn)"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row style={{ marginTop: 24 }}>
          <Col span={24}>
            <Space>
              <Button
                type="default"
                icon={<HistoryOutlined />}
                onClick={() => {
                  setShowHistory(true);
                  setLoadingHistory(true);
                  if (order?.orderId) {
                    refetchHistory();
                  }
                }}
              >
                Xem lịch sử trạng thái
              </Button>

              {canCancelOrder(order) && (
                <Button danger onClick={() => setShowCancelModal(true)}>
                  Hủy đơn hàng
                </Button>
              )}
            </Space>
          </Col>
        </Row>

        {/* Modal hiển thị lịch sử trạng thái */}
        <Modal
          title={
            <Space>
              <HistoryOutlined />
              Lịch sử trạng thái đơn hàng: {order?.orderId}
            </Space>
          }
          open={showHistory}
          onCancel={() => setShowHistory(false)}
          footer={[
            <Button key="close" onClick={() => setShowHistory(false)}>
              Đóng
            </Button>,
          ]}
          width={800}
          loading={loadingHistory}
        >
          {loadingHistory ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Text type="secondary">Đang tải lịch sử...</Text>
            </div>
          ) : statusHistory.length > 0 ? (
            <Timeline
              mode="left"
              items={statusHistory.map((history: any, index: number) => ({
                color: getStatusColor(history.to),
                label: (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(history.updatedAt).toLocaleString("vi-VN")}
                  </Text>
                ),
                children: (
                  <Card size="small" style={{ marginBottom: 8 }}>
                    <div>
                      <Text strong>
                        {history.type === "payment"
                          ? "Thanh toán"
                          : "Giao hàng"}
                        :
                      </Text>
                      <Tag
                        color={getStatusColor(history.from)}
                        style={{ margin: "0 8px" }}
                      >
                        {history.from}
                      </Tag>
                      →
                      <Tag
                        color={getStatusColor(history.to)}
                        style={{ margin: "0 8px" }}
                      >
                        {history.to}
                      </Tag>
                    </div>
                    {history.note && (
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary">Ghi chú: {history.note}</Text>
                      </div>
                    )}
                    {history.reason && (
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary">Lý do: {history.reason}</Text>
                      </div>
                    )}
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {history.isAutomatic ? "🤖 Tự động" : "👤 Thủ công"}
                        {history.updatedBy &&
                          ` • Bởi: ${history.updatedBy.email || "Hệ thống"}`}
                      </Text>
                    </div>
                  </Card>
                ),
              }))}
            />
          ) : (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Text type="secondary">Chưa có lịch sử thay đổi trạng thái</Text>
            </div>
          )}
        </Modal>

        {/* Modal hủy đơn hàng */}
        <Modal
          title="Hủy đơn hàng"
          open={showCancelModal}
          onCancel={() => {
            setShowCancelModal(false);
            setCancelReason("");
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setShowCancelModal(false);
                setCancelReason("");
              }}
            >
              Hủy
            </Button>,
            <Button
              key="confirm"
              type="primary"
              danger
              onClick={handleCancelOrder}
              disabled={!cancelReason.trim()}
            >
              Xác nhận hủy đơn hàng
            </Button>,
          ]}
          width={500}
        >
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              Bạn có chắc chắn muốn hủy đơn hàng{" "}
              <Text strong>{order?.orderId}</Text> không?
            </Text>
          </div>
          <div>
            <Text strong style={{ color: "#f5222d" }}>
              Lý do hủy đơn hàng:
            </Text>
            <AntdInput.TextArea
              rows={4}
              placeholder="Nhập lý do hủy đơn hàng (bắt buộc)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </div>
        </Modal>

        {/* Modal xử lý hoàn tiền thủ công */}
        <Modal
          title="Xử lý hoàn tiền thủ công"
          open={refundModalVisible}
          onCancel={() => {
            setRefundModalVisible(false);
            refundForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={refundForm}
            layout="vertical"
            onFinish={handleManualRefund}
          >
            <Form.Item
              label="Hành động"
              name="action"
              rules={[{ required: true, message: "Vui lòng chọn hành động" }]}
            >
              <Select placeholder="Chọn hành động">
                <Select.Option value="approve">Duyệt hoàn tiền</Select.Option>
                <Select.Option value="reject">Từ chối hoàn tiền</Select.Option>
                <Select.Option value="completed">
                  Đánh dấu đã hoàn thành
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.action !== currentValues.action
              }
            >
              {({ getFieldValue }) => {
                const action = getFieldValue("action");
                return action === "completed" ? (
                  <>
                    <Form.Item
                      label="Phương thức hoàn tiền"
                      name="refundMethod"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập phương thức hoàn tiền",
                        },
                      ]}
                    >
                      <Select placeholder="Chọn phương thức hoàn tiền">
                        <Select.Option value="bank_transfer">
                          Chuyển khoản ngân hàng
                        </Select.Option>
                        <Select.Option value="momo_manual">
                          MoMo thủ công
                        </Select.Option>
                        <Select.Option value="zalopay_manual">
                          ZaloPay thủ công
                        </Select.Option>
                        <Select.Option value="cash">Tiền mặt</Select.Option>
                        <Select.Option value="other">Khác</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      label="Mã giao dịch hoàn tiền"
                      name="refundTransactionId"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập mã giao dịch hoàn tiền",
                        },
                      ]}
                    >
                      <Input placeholder="Nhập mã giao dịch hoàn tiền" />
                    </Form.Item>
                  </>
                ) : null;
              }}
            </Form.Item>

            <Form.Item
              label="Ghi chú admin"
              name="adminNote"
              rules={[{ required: true, message: "Vui lòng nhập ghi chú" }]}
            >
              <AntdInput.TextArea
                rows={4}
                placeholder="Nhập ghi chú về việc xử lý hoàn tiền"
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  onClick={() => {
                    setRefundModalVisible(false);
                    refundForm.resetFields();
                  }}
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={refundLoading}
                >
                  Xác nhận xử lý
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Form>
    </Edit>
  );
};
