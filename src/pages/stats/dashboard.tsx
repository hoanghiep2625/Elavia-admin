import React from "react";
import {
  Card,
  Col,
  Row,
  Statistic,
  Table,
  Tag,
  Typography,
  Divider,
  Spin,
  Progress,
  Grid,
  Button,
  Select,
  DatePicker,
  Space,
  Tooltip,
  Alert,
} from "antd";
import { Pie } from "@ant-design/plots";
import { Column } from "@ant-design/plots";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";

const { Title } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Helper format
const formatVND = (n: any) =>
  n?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "0₫";

// API fetcher
const fetcher = (url: any) =>
  axios
    .get(`${import.meta.env.VITE_API_URL}${url}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
    .then((res) => res.data);

const StatsDashboard = () => {
  const screens = useBreakpoint();
  const queryClient = useQueryClient();

  const [type, setType] = React.useState("this_month");
  const [dateRange, setDateRange] = React.useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [showAllInventory, setShowAllInventory] = React.useState(false);

  // Hàm build URL cho dashboard và stats
  const buildUrl = (endpoint: any) => {
    const baseUrl = endpoint === "stats" ? "/admin/stats" : "/admin/dashboard";
    const params = new URLSearchParams();
    params.append("type", type);
    if (type === "custom_range" && dateRange) {
      params.append("from", dateRange[0].format("YYYY-MM-DD"));
      params.append("to", dateRange[1].format("YYYY-MM-DD"));
    }
    if (endpoint === "dashboard") {
      params.append("limit", "10"); // Giới hạn top products và customers
      params.append("threshold", "5"); // Ngưỡng cảnh báo tồn kho
    }
    return `${baseUrl}?${params.toString()}`;
  };

  // Các hook lấy dữ liệu
  const overview = useQuery({
    queryKey: ["dashboard-overview", type, dateRange],
    queryFn: () => fetcher(buildUrl("stats")),
    enabled: type !== "custom_range" || !!dateRange,
  });
  const userStats = useQuery({
    queryKey: ["dashboard-user-stats"],
    queryFn: () => fetcher("/admin/stats/users"),
  });
  const productStats = useQuery({
    queryKey: ["dashboard-product-stats"],
    queryFn: () => fetcher("/admin/stats/products"),
  });
  const dashboardStats = useQuery({
    queryKey: ["dashboard-stats", type, dateRange],
    queryFn: () => fetcher(buildUrl("dashboard")),
    enabled: type !== "custom_range" || !!dateRange,
  });
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetcher("/admin/categories"),
    refetchInterval: false,
  });
  const users = useQuery({
    queryKey: ["users"],
    queryFn: () => fetcher("/admin/users"),
    refetchInterval: false,
  });

  const loading =
    overview.isLoading ||
    userStats.isLoading ||
    productStats.isLoading ||
    dashboardStats.isLoading ||
    categories.isLoading ||
    users.isLoading;

  const error =
    overview.isError ||
    userStats.isError ||
    productStats.isError ||
    dashboardStats.isError ||
    categories.isError ||
    users.isError;

  

  

  const pieData =
    Array.isArray(overview.data?.orderStatusStats) && overview.data.orderStatusStats.length > 0
      ? overview.data.orderStatusStats.map((item: any) => ({
        type: item._id || "Không xác định",
        value: item.count || 0,
      }))
      : [{ type: "Không có dữ liệu", value: 100 }];

  const chartData = Array.isArray(dashboardStats.data?.sales) ? dashboardStats.data.sales : [];
  const topProductsData = Array.isArray(dashboardStats.data?.topProducts) ? dashboardStats.data.topProducts : [];
  const topCustomersData = Array.isArray(dashboardStats.data?.topCustomers) ? dashboardStats.data.topCustomers : [];
  const inventoryList = Array.isArray(dashboardStats.data?.inventoryAlert) ? dashboardStats.data.inventoryAlert : [];

  const barData = chartData.map((item: any) => ({
    label: item.label || "",
    revenue: item.totalRevenue || 0,
    time: item.label || "",
  }));


  const enhancedBarData =
    type === "today" && barData.length === 1
      ? [
        { label: dayjs().subtract(1, "day").format("DD/M/YYYY"), revenue: 0 },
        ...barData,
        { label: dayjs().add(1, "day").format("DD/M/YYYY"), revenue: 0 },
      ]
      : barData;

  const totalRevenue = Array.isArray(chartData)
    ? chartData.reduce((sum, item) => sum + (item.totalRevenue || 0), 0)
    : 0;

  const inventoryListFormatted =
    inventoryList.map((variant: any) => {
      const quantity =
        Array.isArray(variant.sizes)
          ? variant.sizes.reduce((sum: any, s: any) => sum + (s.stock || 0), 0)
          : 0;
      return {
        productName: variant.productId?.name || "Không rõ",
        quantity,
      };
    }) || [];

  const o = overview.data || {};
  const adminCount =
    Array.isArray(userStats.data?.userRoles)
      ? userStats.data.userRoles.find((r: any) => r._id === "0")?.count || 0
      : 0;
  const userCount =
    Array.isArray(userStats.data?.userRoles)
      ? userStats.data.userRoles.find((r: any) => r._id === "0")?.count || 0
      : 0;
  const expectedRevenue = o.expectedRevenue || 0;
  console.log("expectedRevenue", expectedRevenue)
  const inStock = productStats.data?.inStockProducts || 0;
  const outOfStock = o.outOfStockProducts || 0;

  const topProductsBarData = topProductsData.map((item: any) => ({
    product: item.productName || "Không rõ tên",
    quantity: item.quantitySold || 0,
    revenue: item.revenue || 0,
  }));

  const enrichedTopCustomersData = React.useMemo(() => {
    if (!users.data?.data || !Array.isArray(users.data.data) || !topCustomersData.length) return topCustomersData;
    const userMap = new Map(
      users.data.data.map((user: any) => [
        user._id,
        user.first_name
          ? `${user.first_name} ${user.name || ""}`.trim() || "Chưa có tên"
          : user.name || "Chưa có tên",
      ])
    );
    return topCustomersData.map((customer: any) => ({
      ...customer,
      name: userMap.get(customer._id) || customer.name || "Chưa có tên",
    }));
  }, [users.data, topCustomersData]);

  const topCustomersGroupData = React.useMemo(() => {
    if (!Array.isArray(enrichedTopCustomersData)) return [];
    return enrichedTopCustomersData.flatMap((c: any) => [
      { name: c.name, type: "Đơn hàng", value: c.totalOrders },
      { name: c.name, type: "Chi tiêu", value: c.totalSpent || 0 },
    ]);
  }, [enrichedTopCustomersData]);

  return (
    <div style={{ padding: screens.xs ? 8 : 32, background: "#f5f7fa", minHeight: "100vh" }}>
      {/* Header và Bộ lọc thời gian */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Bảng điều khiển thống kê</Title>
        <Col>
          <Space>
            <Select
              value={type}
              style={{ width: 180 }}
              onChange={(value) => {
                setType(value);
                if (value !== "custom_range") setDateRange(null);
                queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
                queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
              }}
            >
              <Option value="today">Hôm nay</Option>
              <Option value="this_week">Tuần này</Option>
              <Option value="this_month">Tháng này</Option>
              <Option value="this_year">Năm nay</Option>
              <Option value="custom_range">Tùy chọn thời gian</Option>
            </Select>
            {type === "custom_range" && (
              <RangePicker
                format="DD/MM/YYYY"
                value={dateRange}
                onChange={(dates) => {
                  setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs]);
                  queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
                  queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
                }}
              />
            )}
          </Space>
        </Col>
      </Row>

      {loading ? (
        <Spin size="large" />
      ) : error ? (
        <Alert message="Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau!" type="error" />
      ) : (
        <>
          {/* Tổng quan */}
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <Tooltip
                title={
                  <div>
                    <div><b>Tổng người dùng:</b> {o.totalUsers || 0}</div>
                    <div>Admin: {adminCount}</div>
                    <div>User: {userCount}</div>
                  </div>
                }
                placement="top"
              >
                <Card bordered style={{ background: "#e6f7ff", cursor: "pointer" }}>
                  <Statistic
                    title="Tổng người dùng"
                    value={o.totalUsers || 0}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Tooltip>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Tooltip
                title={
                  <div>
                    <div><b>Tổng sản phẩm:</b> {o.totalProducts || 0}</div>
                    <div>Còn: {inStock}</div>
                    <div>Hết: {outOfStock}</div>
                  </div>
                }
                placement="top"
              >
                <Card bordered style={{ background: "#fffbe6", cursor: "pointer" }}>
                  <Statistic
                    title="Tổng sản phẩm"
                    value={o.totalProducts || 0}
                    valueStyle={{ color: "#faad14" }}
                  />
                </Card>
              </Tooltip>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered style={{ background: "#f6ffed" }}>
                <Statistic title="Tổng danh mục" value={o.totalCategories || 0} valueStyle={{ color: "#52c41a" }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered style={{ background: "#fff0f6" }}>
                <Statistic title="Tổng đơn hàng" value={o.totalOrders || 0} valueStyle={{ color: "#eb2f96" }} />
              </Card>
            </Col>
          </Row>

          {/* Doanh thu & trạng thái đơn hàng */}
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24} md={12}>
              <Card bordered>
                <Statistic title="Tổng doanh thu" value={formatVND(totalRevenue)} valueStyle={{ color: "#722ed1" }} />
                <Divider />
                {/* <Statistic title="Doanh thu dự kiến" value={o.forecastRevenue || 0} /> */}

                <Column
                  height={480}
                  data={enhancedBarData}
                  xField="label"
                  yField="revenue"
                  color="#722ed1"
                  barWidth={10}
                  marginRatio={1.5}
                  label={{ position: "top", style: { fill: "#000", fontSize: 12 } }}
                  meta={{ revenue: { alias: "Doanh thu" }, label: { alias: "Thời gian" } }}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card bordered title="Trạng thái đơn hàng">
                <Pie
                  data={pieData}
                  angleField="value"
                  colorField="type"
                  radius={0.8}
                  label={{ type: "inner", content: "{value}", style: { fill: "#fff", fontSize: 12 } }}
                  legend={{ position: "bottom" }}
                  color={["#389e0d", "#faad14", "#cf1322", "#1890ff", "#eb2f96"]}
                  interactions={[{ type: "element-active" }]}
                />
              </Card>
            </Col>
          </Row>

          {/* Tồn kho */}
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24}>
              <Card bordered title="Cảnh báo tồn kho (≤ 5)">
                {inventoryListFormatted.length === 0 ? (
                  <Tag color="green">Không có sản phẩm sắp hết hàng</Tag>
                ) : (
                  <>
                    <Table
                      size="small"
                      dataSource={showAllInventory ? inventoryListFormatted : inventoryListFormatted.slice(0, 5)}
                      columns={[
                        {
                          title: "Tên sản phẩm",
                          dataIndex: "productName",
                          key: "productName",
                          render: (text) => <b>{text}</b>,
                        },
                        {
                          title: "Tồn kho",
                          dataIndex: "quantity",
                          key: "quantity",
                          render: (q) => (
                            <Progress
                              percent={Math.min((q / 5) * 100, 100)}
                              status={q <= 2 ? "exception" : "active"}
                              format={() => q}
                            />
                          ),
                        },
                      ]}
                      rowKey="productName"
                      pagination={false}
                    />
                    <div style={{ textAlign: "center", marginTop: 8 }}>
                      <Button type="link" onClick={() => setShowAllInventory((prev) => !prev)}>
                        {showAllInventory ? "Thu gọn" : "Xem thêm"}
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            </Col>
          </Row>

          {/* Top sản phẩm & Top khách hàng */}
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24} md={12}>
              <Card bordered title="Top sản phẩm bán chạy nhất">
                <Column
                  height={320}
                  data={topProductsBarData}
                  xField="product"
                  yField="quantity"
                  color="#faad14"
                  label={{
                    position: "top",
                    style: {
                      fill: "#000",
                      fontSize: 14,
                      fontWeight: "bold",
                    },
                  }}
                  meta={{
                    product: { alias: "Sản phẩm" },
                    quantity: { alias: "Số lượng bán" },
                  }}

                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card bordered title="Top khách hàng chi tiêu">
                <Column
                  height={320}
                  data={topCustomersGroupData}
                  isGroup
                  xField="name"
                  yField="value"
                  columnStyle={{ radius: [4, 4, 0, 0] }}
                  label={{
                    position: "top",
                    style: { fill: "#000", fontSize: 12 },
                  }}
                  meta={{
                    name: { alias: "Khách hàng" },
                    value: { alias: "Giá trị" },
                    type: { alias: "Loại" },
                  }}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default StatsDashboard;