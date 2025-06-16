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
} from "antd";
import { Pie, Column } from "@ant-design/plots";

const { Title } = Typography;

const hardcodeStats = {
  totalUsers: 2,
  totalProducts: 4,
  totalCategories: 12,
  totalOrders: 15,
  totalRevenue: 29241,
  outOfStockProducts: 15,
  inStockProducts: 125,
  orderStatusStats: [
    { _id: "Đã giao", count: 600 },
    { _id: "Đang xử lý", count: 250 },
    { _id: "Đã hủy", count: 80 },
    { _id: "Đang vận chuyển", count: 50 },
  ],
};

const hardcodeUserStats = {
  userRoles: [
    { _id: "3", count: 5 }, // Admin
    { _id: "1", count: 2 }, // User
  ],
};

const hardcodeProductStats = {
  productByCategory: [
    { _id: "Áo", count: 4 },
    { _id: "Quần", count: 1 },
    { _id: "Áo croptop", count: 2 },
    { _id: "Áo sơ mi", count: 2 },
  ],
  inStockProducts: 335,
};

const orderStatusData = hardcodeStats.orderStatusStats.map((status) => ({
  type: status._id,
  value: status.count,
}));

const productByCategoryData = hardcodeProductStats.productByCategory.map(
  (cat) => ({
    category: cat._id,
    count: cat.count,
  })
);

const adminCount =
  hardcodeUserStats.userRoles.find((r) => r._id === "3")?.count || 0;
const userCount =
  hardcodeUserStats.userRoles.find((r) => r._id === "1")?.count || 0;

const revenueData = [
  { month: "Tháng 1", revenue: 12223 },
  { month: "Tháng 2", revenue: 7831 },
  { month: "Tháng 3", revenue: 8906 },
  { month: "Tháng 4", revenue: 12086 },
  { month: "Tháng 5", revenue: 10924 },
  { month: "Tháng 6", revenue: 14254 },
];

const StatsDashboard = () => {
  return (
    <div style={{ padding: 32, background: "#f5f7fa", minHeight: "100vh" }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Bảng điều khiển thống kê
      </Title>
      {/* Tổng quan */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered style={{ background: "#e6f7ff" }}>
            <Statistic
              title="Tổng người dùng"
              value={hardcodeStats.totalUsers}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered style={{ background: "#fffbe6" }}>
            <Statistic
              title="Tổng sản phẩm"
              value={hardcodeStats.totalProducts}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered style={{ background: "#f6ffed" }}>
            <Statistic
              title="Tổng danh mục"
              value={hardcodeStats.totalCategories}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered style={{ background: "#fff0f6" }}>
            <Statistic
              title="Tổng đơn hàng"
              value={hardcodeStats.totalOrders}
              valueStyle={{ color: "#eb2f96" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card bordered>
            <Statistic
              title="Tổng doanh thu"
              value={hardcodeStats.totalRevenue}
              prefix="₫"
              valueStyle={{ color: "#722ed1" }}
            />
            <Divider />
            <Column
              height={200}
              data={revenueData}
              xField="month"
              yField="revenue"
              color="#722ed1"
              label={{ position: "middle", style: { fill: "#fff" } }}
              meta={{
                revenue: { alias: "Doanh thu" },
                month: { alias: "Tháng" },
              }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card bordered>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Sản phẩm hết hàng"
                  value={hardcodeStats.outOfStockProducts}
                  valueStyle={{ color: "#cf1322" }}
                  suffix={<Tag color="red">Hết hàng</Tag>}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Sản phẩm còn tồn"
                  value={hardcodeProductStats.inStockProducts}
                  valueStyle={{ color: "#389e0d" }}
                  suffix={<Tag color="green">Còn hàng</Tag>}
                />
              </Col>
            </Row>
            <Divider />
            <Pie
              data={orderStatusData}
              angleField="value"
              colorField="type"
              radius={0.8}
              label={{
                type: "outer",
                content: "{name} ({percentage})",
              }}
              legend={{ position: "bottom" }}
              color={["#1890ff", "#faad14", "#cf1322", "#52c41a"]}
            />
          </Card>
        </Col>
      </Row>

      {/* Thống kê vai trò người dùng */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card bordered>
            <Statistic
              title="Số lượng Admin"
              value={adminCount}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card bordered>
            <Statistic
              title="Số lượng User"
              value={userCount}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bảng sản phẩm theo danh mục */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card bordered title="Sản phẩm theo danh mục">
            <Table
              dataSource={productByCategoryData}
              columns={[
                {
                  title: "Danh mục",
                  dataIndex: "category",
                  key: "category",
                  render: (text) => <Tag color="blue">{text}</Tag>,
                },
                {
                  title: "Số lượng sản phẩm",
                  dataIndex: "count",
                  key: "count",
                  render: (count) => <b>{count}</b>,
                },
              ]}
              rowKey="category"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatsDashboard;
