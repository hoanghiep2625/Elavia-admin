import React from "react";
import { useCustom } from "@refinedev/core";
import { Card, Col, Row, Statistic, Table } from "antd";
import { Pie } from "@ant-design/plots";

const StatsDashboard = () => {
  // Fetch dữ liệu từ API
  const { data: statsData, isLoading: isStatsLoading } = useCustom({
    url: "admin/stats",
    method: "get",
  });

  const { data: userStatsData, isLoading: isUserStatsLoading } = useCustom({
    url: "admin/stats/users",
    method: "get",
  });

  const { data: productStatsData, isLoading: isProductStatsLoading } =
    useCustom({
      url: "admin/stats/products",
      method: "get",
    });

  const stats = statsData?.data || {};
  const userStats = userStatsData?.data || {};
  const productStats = productStatsData?.data || {};

  type OrderStatus = { _id: string; count: number };
  type ProductCategory = { _id: string; count: number };
  type UserRole = { _id: string; count: number };

  const orderStatusData =
    stats.orderStatusStats?.map((status: OrderStatus) => ({
      type: status._id,
      value: status.count,
    })) || [];

  const productByCategoryData =
    productStats.productByCategory?.map((category: ProductCategory) => ({
      category: category._id,
      count: category.count,
    })) || [];

  const adminCount =
    userStats.userRoles?.find((role: UserRole) => role._id === "3")?.count || 0;
  const userCount =
    userStats.userRoles?.find((role: UserRole) => role._id === "1")?.count || 0;

  if (isStatsLoading || isUserStatsLoading || isProductStatsLoading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số người dùng"
              value={stats.totalUsers || 0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số sản phẩm"
              value={stats.totalProducts || 0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số danh mục"
              value={stats.totalCategories || 0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số đơn hàng"
              value={stats.totalOrders || 0}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col span={12}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalRevenue || 0}
              prefix="₫"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="Sản phẩm hết hàng"
              value={stats.outOfStockProducts || 0}
            />
            <Statistic
              title="Sản phẩm còn tồn kho"
              value={productStats.inStockProducts || 0}
              style={{ marginTop: "16px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Thống kê vai trò người dùng */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col span={12}>
          <Card>
            <Statistic title="Số lượng Admin" value={adminCount} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic title="Số lượng User" value={userCount} />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ trạng thái đơn hàng */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col span={12}>
          <Card title="Trạng thái đơn hàng">
            <Pie
              data={
                orderStatusData.length > 0
                  ? orderStatusData
                  : [{ type: "No Data", value: 1 }]
              }
              angleField="value"
              colorField="type"
              radius={0.8}
              label={{
                type: "outer",
                content: "{name} ({percentage})",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bảng sản phẩm theo danh mục */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col span={24}>
          <Card title="Sản phẩm theo danh mục">
            <Table
              dataSource={productByCategoryData}
              columns={[
                {
                  title: "Danh mục",
                  dataIndex: "category",
                  key: "category",
                },
                {
                  title: "Số lượng sản phẩm",
                  dataIndex: "count",
                  key: "count",
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
