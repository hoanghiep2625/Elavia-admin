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
} from "antd";
import { Pie } from "@ant-design/plots";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import ColumnChart from "@ant-design/plots/es/components/column";

const { Title } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Helper format
const formatVND = (n: number) =>
  n?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "0₫";

// API fetcher
const fetcher = (url: string) =>
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

  // Hàm build URL cho salesChart
  const buildSalesChartUrl = () => {
    if (type === "custom_range" && dateRange) {
      const from = dateRange[0].format("YYYY-MM-DD");
      const to = dateRange[1].format("YYYY-MM-DD");
      return `/admin/dashboard/sales-chart?type=custom_range&from=${from}&to=${to}`;
    }
    return `/admin/dashboard/sales-chart?type=${type}`;
  };

  // Hàm build URL cho salesBreakdown
  const buildSalesBreakdownUrl = () => {
    if (type === "custom_range" && dateRange) {
      const from = dateRange[0].format("YYYY-MM-DD");
      const to = dateRange[1].format("YYYY-MM-DD");
      return `/admin/dashboard/sales-breakdown?type=custom_range&from=${from}&to=${to}`;
    }
    return `/admin/dashboard/sales-breakdown?type=${type}`;
  };

  // Các hook lấy dữ liệu
  const overview = useQuery({ queryKey: ["dashboard-overview"], queryFn: () => fetcher("/admin/stats") });
  const userStats = useQuery({ queryKey: ["dashboard-user-stats"], queryFn: () => fetcher("/admin/stats/users") });
  const productStats = useQuery({ queryKey: ["dashboard-product-stats"], queryFn: () => fetcher("/admin/stats/products") });
  const salesChart = useQuery({
    queryKey: ["dashboard-sales-chart", type, dateRange],
    queryFn: () => fetcher(buildSalesChartUrl()),
    enabled: type !== "custom_range" || !!dateRange,
  });
  const orderStatus = useQuery({ queryKey: ["dashboard-order-status-summary"], queryFn: () => fetcher("/admin/dashboard/order-status-summary") });
  const inventoryAlert = useQuery({ queryKey: ["dashboard-inventory-alert"], queryFn: () => fetcher("/admin/dashboard/inventory-alert") });
  const categories = useQuery({ queryKey: ["categories"], queryFn: () => fetcher("/admin/categories"), refetchInterval: false });
  const salesBreakdown = useQuery({
    queryKey: ["dashboard-sales-breakdown", type, dateRange],
    queryFn: () => fetcher(buildSalesBreakdownUrl()),
    enabled: type !== "custom_range" || !!dateRange,
  });
  const topProducts = useQuery({
    queryKey: ["dashboard-top-products"],
    queryFn: () => fetcher("/admin/dashboard/top-products?limit=10"),
  });
  const topCustomers = useQuery({
    queryKey: ["dashboard-top-customers"],
    queryFn: () => fetcher("/admin/dashboard/top-customers?limit=10"),
  });

  const loading =
    overview.isLoading ||
    userStats.isLoading ||
    productStats.isLoading ||
    salesChart.isLoading ||
    orderStatus.isLoading ||
    categories.isLoading;

  const catMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    (categories.data?.data || categories.data || []).forEach?.((c: any) => {
      map[c._id] = c.name;
    });
    return map;
  }, [categories.data]);

  const productByCategory =
    Array.isArray(productStats.data?.productByCategory)
      ? productStats.data.productByCategory.map((item: any) => ({
          ...item,
          categoryName: catMap[item._id] || item._id || "Không rõ",
        }))
      : [];

  const pieData =
    Array.isArray(overview.data?.orderStatusStats)
      ? overview.data.orderStatusStats.map((item: any) => ({
          type: item._id,
          value: item.count,
        }))
      : [];

  const chartData = Array.isArray(salesChart.data?.data) ? salesChart.data.data : [];

  const barData = chartData.map((item: any) => {
    const label =
      item._id?.day
        ? `${item._id.day}/${item._id.month || ""}`
        : item._id?.month
        ? `Tháng ${item._id.month}`
        : item._id?.year || "";
    return {
      label,
      revenue: item.totalRevenue || 0,
    };
  });

  const totalRevenue = Array.isArray(chartData)
    ? chartData.reduce((sum, item) => sum + (item.totalRevenue || 0), 0)
    : 0;

  const inventoryList =
    Array.isArray(inventoryAlert.data?.data)
      ? inventoryAlert.data.data.map((variant: any) => {
          const quantity =
            Array.isArray(variant.sizes)
              ? variant.sizes.reduce((sum: number, s: any) => sum + (s.stock || 0), 0)
              : 0;
          return {
            productName: variant.productId?.name || "Không rõ",
            quantity,
          };
        })
      : [];

  const o = overview.data || {};
  const adminCount =
    Array.isArray(userStats.data?.userRoles)
      ? userStats.data.userRoles.find((r: any) => r._id === "3")?.count || 0
      : 0;
  const userCount =
    Array.isArray(userStats.data?.userRoles)
      ? userStats.data.userRoles.find((r: any) => r._id === "1")?.count || 0
      : 0;

  const inStock = productStats.data?.inStockProducts || 0;
  const outOfStock = o.outOfStockProducts || 0;

  const refetchAll = () => {
    queryClient.invalidateQueries();
  };

  // Chuẩn bị dữ liệu cho biểu đồ cột danh mục
  const categoryBarData = productByCategory.map((item: any) => ({
    category: item.categoryName,
    count: item.count,
  }));

  const topProductsBarData = Array.isArray(topProducts.data?.data)
    ? topProducts.data.data.map((item: any) => ({
        product: item.productName,
        quantity: item.quantitySold,
        revenue: item.revenue ?? 0, // Sửa: nếu không có revenue thì mặc định là 0
      }))
    : [];

  return (
    <div style={{ padding: screens.xs ? 8 : 32, background: "#f5f7fa", minHeight: "100vh" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Bảng điều khiển thống kê
        </Title>
        <Button onClick={refetchAll}>Làm mới</Button>
      </Row>

      {loading ? (
        <Spin size="large" />
      ) : (
        <>
          <Row justify="end" style={{ marginTop: 24, marginBottom: 12 }}>
            <Col>
              <Space>
                <Select
                  value={type}
                  style={{ width: 180 }}
                  onChange={(value) => {
                    setType(value);
                    if (value !== "custom_range") setDateRange(null);
                    // Chỉ invalidate các query liên quan đến doanh thu
                    queryClient.invalidateQueries({ queryKey: ["dashboard-sales-chart"] });
                    queryClient.invalidateQueries({ queryKey: ["dashboard-sales-breakdown"] });
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
                      // Chỉ invalidate các query liên quan đến doanh thu
                      queryClient.invalidateQueries({ queryKey: ["dashboard-sales-chart"] });
                      queryClient.invalidateQueries({ queryKey: ["dashboard-sales-breakdown"] });
                    }}
                  />
                )}
              </Space>
            </Col>
          </Row>

          {/* Tổng quan */}
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <Card bordered style={{ background: "#e6f7ff" }}>
                <Statistic title="Tổng người dùng" value={o.totalUsers || 0} valueStyle={{ color: "#1890ff" }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered style={{ background: "#fffbe6" }}>
                <Statistic title="Tổng sản phẩm" value={o.totalProducts || 0} valueStyle={{ color: "#faad14" }} />
              </Card>
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

          {/* Doanh thu & đơn hàng theo trạng thái */}
          <Row gutter={[24, 24]} style={{ marginTop: 24, marginBottom: 12 }}>
            <Col xs={24} md={12}>
              <Card bordered>
                <Statistic title="Tổng doanh thu" value={formatVND(totalRevenue)} valueStyle={{ color: "#722ed1" }} />
                <Divider />
                <ColumnChart
                  height={220}
                  data={barData}
                  xField="label"
                  yField="revenue"
                  color="#722ed1"
                  label={{ position: "middle", style: { fill: "#fff" } }}
                  meta={{ revenue: { alias: "Doanh thu" }, label: { alias: "Thời gian" } }}
                />
                {/* Thêm bảng Chi tiết doanh thu ngay dưới biểu đồ */}
                <Card
                  bordered
                  style={{ marginTop: 24 }}
                  title={
                    type === "custom_range" && dateRange
                      ? `Chi tiết doanh thu (${dateRange[0].format("DD/MM/YYYY")} → ${dateRange[1].format("DD/MM/YYYY")})`
                      : `Chi tiết doanh thu (${
                          {
                            today: "Hôm nay",
                            this_week: "Tuần này",
                            this_month: "Tháng này",
                            this_year: "Năm nay",
                          }[type]
                        })`
                  }
                >
                  <Table
                    dataSource={Array.isArray(salesBreakdown.data?.data) ? salesBreakdown.data.data.map((item: any, idx: number) => ({
                      ...item,
                      key: idx,
                      timeLabel:
                        type === "custom_range" && dateRange
                          ? `${dateRange[0].format("DD/MM/YYYY")} → ${dateRange[1].format("DD/MM/YYYY")}`
                          : item._id?.day
                          ? `${item._id.day}/${item._id.month}/${item._id.year}`
                          : item._id?.month
                          ? `Tháng ${item._id.month}/${item._id.year}`
                          : item._id?.year || "Không rõ",
                    })) : []}
                    columns={[
                      {
                        title: "Thời gian",
                        dataIndex: "timeLabel",
                        key: "timeLabel",
                      },
                      {
                        title: "Doanh thu",
                        dataIndex: "totalRevenue",
                        key: "totalRevenue",
                        render: (value) => <b>{formatVND(value)}</b>,
                      },
                      {
                        title: "Số đơn hàng",
                        dataIndex: "orderCount",
                        key: "orderCount",
                        render: (value) => <Tag color="blue">{value}</Tag>,
                      },
                    ]}
                    pagination={false}
                    bordered
                  />
                </Card>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card bordered>
                <Pie
                  data={pieData}
                  angleField="value"
                  colorField="type"
                  radius={0.8}
                  label={{ type: "outer", content: "{name} ({percentage})" }}
                  legend={{ position: "bottom" }}
                  color={["#389e0d", "#faad14", "#cf1322", "#1890ff", "#eb2f96"]}
                />
                <Divider />
              </Card>
            </Col>
          </Row>

          {/* Sản phẩm theo danh mục - thay bảng bằng biểu đồ cột */}
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card bordered title="Sản phẩm theo danh mục">
                <ColumnChart
                  height={320}
                  data={categoryBarData}
                  xField="category"
                  yField="count"
                  color="#1890ff"
                  label={{
                    position: "middle",
                    style: { fill: "#fff", fontSize: 14 },
                  }}
                  meta={{
                    category: { alias: "Danh mục" },
                    count: { alias: "Số lượng sản phẩm" },
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Thống kê user, tồn kho */}
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24} md={8}>
              <Card bordered>
                <Statistic title="Số lượng Admin" value={adminCount} valueStyle={{ color: "#722ed1" }} />
                <Divider />
                <Statistic title="Số lượng User" value={userCount} valueStyle={{ color: "#1890ff" }} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered>
                <Statistic title="Sản phẩm còn hàng" value={inStock} valueStyle={{ color: "#389e0d" }} suffix={<Tag color="green">Còn hàng</Tag>} />
                <Divider />
                <Statistic title="Sản phẩm hết hàng" value={outOfStock} valueStyle={{ color: "#cf1322" }} suffix={<Tag color="red">Hết hàng</Tag>} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered title="Cảnh báo tồn kho (≤ 5)">
                {inventoryList.length === 0 ? (
                  <Tag color="green">Không có sản phẩm sắp hết hàng</Tag>
                ) : (
                  <>
                    <Table
                      size="small"
                      dataSource={showAllInventory ? inventoryList : inventoryList.slice(0, 2)}
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
                      <Button
                        type="link"
                        onClick={() => setShowAllInventory((prev) => !prev)}
                      >
                        {showAllInventory ? "Thu gọn" : "Xem thêm"}
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            </Col>
          </Row>

          {/* Top sản phẩm bán chạy nhất và Top khách hàng mua nhiều nhất */}
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24} md={12}>
              <Card bordered title="Top sản phẩm bán chạy nhất">
                <ColumnChart
                  height={320}
                  data={topProductsBarData}
                  xField="product"
                  yField="quantity"
                  color="#faad14"
                  label={{
                    position: "middle",
                    style: { fill: "#fff", fontSize: 14 },
                  }}
                  meta={{
                    product: { alias: "Sản phẩm" },
                    quantity: { alias: "Số lượng bán" },
                  }}
                  tooltip={{
                    customContent: (title: string, items: any[]) => {
                      if (!items?.length) return null;
                      const { data } = items[0];
                      return (
                        `<div>
                          <b>${data.product}</b><br/>
                          Số lượng bán: <b>${data.quantity}</b><br/>
                          Doanh thu: <b>${formatVND(data.revenue)}</b>
                        </div>`
                      );
                    },
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card bordered title="Top khách hàng mua nhiều nhất">
                <Table
                  dataSource={Array.isArray(topCustomers.data?.data) ? topCustomers.data.data : []}
                  columns={[
                    {
                      title: "Tên khách hàng",
                      dataIndex: "name",
                      key: "name",
                      render: (text) => <b>{text}</b>,
                    },
                    {
                      title: "Email",
                      dataIndex: "email",
                      key: "email",
                    },
                    {
                      title: "Số đơn hàng",
                      dataIndex: "totalOrders",
                      key: "totalOrders",
                      render: (value) => <Tag color="purple">{value}</Tag>,
                    },
                    {
                      title: "Tổng chi tiêu",
                      dataIndex: "totalSpent",
                      key: "totalSpent",
                      render: (value) => <b>{formatVND(value)}</b>,
                    },
                  ]}
                  rowKey="email"
                  pagination={false}
                />
              </Card>
            </Col>
          </Row>

          {/* Doanh thu chi tiết theo thời gian */}
        

        </>
      )}
    </div>
  );
};

export default StatsDashboard;


