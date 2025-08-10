// src/pages/orders/edit.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, useForm } from "@refinedev/antd";
import { useOne } from "@refinedev/core";
import {
  Form,
  Input,
  Select,
  Typography,
  Row,
  Col,
  Card,
  Tag,
  List,
} from "antd";

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
  });

  const order = queryResult?.data?.data;

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

  // Map receiver sang user nếu user không có name/phone/address
  const initialValues = {
    ...order,
    user: {
      ...order?.user,
      name: order?.user?.name || order?.receiver?.name || "",
      phone: order?.user?.phone || order?.receiver?.phone || "",
      address: order?.user?.address || order?.receiver?.address || "",
    },
  };

  return (
    <Edit saveButtonProps={saveButtonProps} title="Chỉnh sửa đơn hàng">
      <Form {...formProps} layout="vertical">
        <Row gutter={24}>
          {/* Thông tin người đặt */}
          <Col span={12}>
            <Card title="Thông tin người đặt">
              <div style={{ marginLeft: 16 }}>
                <div style={{ marginBottom: 8 }}>
                  <strong>Họ tên:</strong>
                  <div>
                    {[userInfo?.first_name, userInfo?.name]
                      .filter(Boolean)
                      .join(" ") || "--"}
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Email:</strong>
                  <div>{userInfo?.email || order?.user?.email || "--"}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Số điện thoại:</strong>
                  <div>{userInfo?.phone || order?.user?.phone || "--"}</div>
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
                                  productColor?.actualColor || "#f0f0f0",
                                color: "#000",
                                border: "none",
                                minWidth: 60,
                              }}
                            >
                              {productColor?.colorName || "--"}
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
            <Form.Item
              label="Trạng thái thanh toán"
              name="paymentStatus"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn trạng thái thanh toán",
                },
              ]}
            >
              <Select placeholder="Chọn trạng thái thanh toán">
                {[
                  "Chờ thanh toán",
                  "Đã thanh toán",
                  "Thanh toán khi nhận hàng",
                  "Huỷ do quá thời gian thanh toán",
                  "Người mua huỷ",
                  "Người bán huỷ",
                ].map((status) => (
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
          </Col>
          <Col span={12}>
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
              <Select placeholder="Chọn trạng thái giao hàng">
                {[
                  "Chờ xác nhận",
                  "Đã xác nhận",
                  "Đang giao hàng",
                  "Giao hàng thành công",
                  "Giao hàng thất bại",
                  "Đã nhận hàng",
                  "Khiếu nại",
                  "Đang xử lý khiếu nại",
                  "Khiếu nại được giải quyết",
                  "Khiếu nại bị từ chối",
                  "Người mua huỷ",
                  "Người bán huỷ",
                ].map((status) => (
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
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
