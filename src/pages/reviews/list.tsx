import { DeleteButton, List, ShowButton } from "@refinedev/antd";
import { Button, Input, Space, Table, Tag, Rate, Image, Select, Tooltip } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import { useCustom } from "@refinedev/core";
import { useNavigate } from "react-router";
import { Modal, Form, message } from "antd";
import { useEffect } from "react";
import { Typography } from "antd";

const { Text } = Typography;
type Review = {
  _id: string;
  comment?: string;
  reply?: {
    comment?: string;
    createdAt?: string;
    updatedAt?: string;
    repliedBy?: string;
  };
  [key: string]: any; // để tránh lỗi nếu có thêm field
};

export const ReviewList = () => {
  const token = localStorage.getItem("token"); 
const [searchProductInput, setSearchProductInput] = useState("");
const [searchCustomerInput, setSearchCustomerInput] = useState("");
const [searchProduct, setSearchProduct] = useState("");
const [searchCustomer, setSearchCustomer] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const {
    data: reviewData,
    isLoading: isReviewLoading,
    refetch: refetchReviews,
  } = useCustom({
    url: "/admin/reviews",
    method: "get",
    config: {
      query: {
        page: pagination.current,
        limit: pagination.pageSize,
        populate: "productVariantId,userId", // Lấy dữ liệu populate ở backend
        productName: searchProduct,
        customerName: searchCustomer,
      },
    },
  });

  console.log("Review data with populated fields:", reviewData);
const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
const [currentReview, setCurrentReview] = useState<Review | null>(null);
const [form] = Form.useForm();

const openReplyModal = (review: any) => {
  setCurrentReview(review);
  form.setFieldsValue({ comment: review?.reply?.comment || "" });
  setIsReplyModalOpen(true);
};

const handleReplySubmit = async () => {
  try {
    const values = await form.validateFields();

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/reviews/${
        currentReview?._id
      }/reply`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: values.comment }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Lỗi khi phản hồi");

    message.success("Phản hồi thành công");
    setIsReplyModalOpen(false);
    refetchReviews();
  } catch (err) {
    message.error(
      typeof err === "object" && err !== null && "message" in err
        ? (err as { message?: string }).message || "Lỗi phản hồi"
        : "Lỗi phản hồi"
    );
  }
};

const handleDeleteReply = async () => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/reviews/${
        currentReview?._id
      }/reply`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Lỗi khi xoá phản hồi");

    message.success("Đã xoá phản hồi");
    setIsReplyModalOpen(false);
    refetchReviews();
  } catch (err) {
    message.error(
      typeof err === "object" && err !== null && "message" in err
        ? (err as { message?: string }).message || "Lỗi xoá phản hồi"
        : "Lỗi xoá phản hồi"
    );
  }
};
  return (
    <List canCreate={false}>
      {/* Bộ lọc tìm kiếm */}
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Input
          placeholder="Tìm theo tên sản phẩm"
          style={{ width: 200 }}
          value={searchProductInput}
          onChange={(e) => setSearchProductInput(e.target.value)}
        />
        <Input
          placeholder="Tìm theo tên khách hàng"
          style={{ width: 200 }}
          value={searchCustomerInput}
          onChange={(e) => setSearchCustomerInput(e.target.value)}
        />
        <Button
          type="primary"
          onClick={() => {
            setSearchProduct(searchProductInput);
            setSearchCustomer(searchCustomerInput);
            refetchReviews();
          }}
        >
          Tìm kiếm
        </Button>
      </div>

      <Table
        rowKey="_id"
        dataSource={
          Array.isArray(reviewData?.data?.data) ? reviewData.data.data : []
        }
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: reviewData?.data?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} đánh giá`,
        }}
        onChange={(p) => setPagination(p as any)}
        loading={isReviewLoading}
      >
        <Table.Column
          title="STT"
          align="center"
          render={(_, __, index) =>
            pagination.pageSize * (pagination.current - 1) + index + 1
          }
          width={70}
        />
        <Table.Column
          title="Ảnh sản phẩm"
          render={(record) => {
            const images = [];

            const mainImg = record.productVariantId?.images?.main?.url;
            if (mainImg) {
              images.push(mainImg);
            }

            const galleryImgs = Array.isArray(
              record.productVariantId?.images?.product
            )
              ? record.productVariantId.images.product.map((img: any) => img.url)
              : [];

            images.push(...galleryImgs);

            if (images.length === 0) {
              return <Image src="/fallback-image.png" width={50} />;
            }

            return (
              <Image.PreviewGroup>
                <Image
                  src={images[0]}
                  width={50}
                  height={50}
                  style={{ objectFit: "cover", cursor: "pointer" }}
                  fallback="/fallback-image.png"
                />

                {images.slice(1).map((url, idx) => (
                  <Image
                    key={idx}
                    src={url}
                    style={{ display: "none" }}
                    fallback="/fallback-image.png"
                  />
                ))}
              </Image.PreviewGroup>
            );
          }}
        />
        <Table.Column
          dataIndex="productVariantId"
          title="Sản phẩm"
          render={(value, record) =>
            record.productVariantId?.productId?.name || "Không xác định"
          }
        />
        <Table.Column
          dataIndex="userId"
          title="Khách hàng"
          render={(value, record) => record.userId?.name || "Không xác định"}
        />
        <Table.Column
          dataIndex="rating"
          title="Điểm"
          render={(rating) => (
            <div className="flex items-center">
              <Rate
                disabled
                value={rating}
                className="text-yellow-400"
                style={{ fontSize: 22 }} // tăng kích thước sao
              />
            </div>
          )}
        />
        <Table.Column
          dataIndex="comment"
          title="Bình luận"
          render={(comment, record) => (
            <Tooltip title={comment}>
              <Text ellipsis style={{ display: "block", maxWidth: 100 }}>
                {comment}
              </Text>
            </Tooltip>
          )}
        />
        <Table.Column
          title="Ảnh đánh giá"
          dataIndex="images"
          render={(images) => {
            if (!Array.isArray(images) || images.length === 0) {
              return <i>Không có ảnh</i>;
            }

            return (
              <Image.PreviewGroup>
                <Image
                  src={images[0].url}
                  width={50}
                  height={50}
                  style={{ objectFit: "cover", cursor: "pointer" }}
                  fallback="/fallback-image.png"
                />
                {/* Ẩn các ảnh còn lại để preview group có dữ liệu */}
                {images.slice(1).map((img) => (
                  <Image
                    key={img.public_id || img.url}
                    src={img.url}
                    style={{ display: "none" }}
                    fallback="/fallback-image.png"
                  />
                ))}
              </Image.PreviewGroup>
            );
          }}
        />

        <Table.Column
          title="Phản hồi quản lý"
          render={(record) => {
            const reply = record.reply;

            return (
              <div style={{ maxWidth: 200 }}>
                {reply?.comment ? (
                  <>
                    <Tooltip title={reply.comment}>
                      <Text
                        ellipsis
                        style={{ display: "block", maxWidth: 100 }}
                      >
                        {reply.comment}
                      </Text>
                    </Tooltip>
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      {dayjs(reply.updatedAt || reply.createdAt).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </div>
                  </>
                ) : (
                  <i style={{ color: "#aaa" }}>Chưa có phản hồi</i>
                )}
                <div>
                  <Button
                    size="small"
                    type="link"
                    onClick={() => openReplyModal(record)}
                  >
                    {reply?.comment ? "Sửa" : "Phản hồi"}
                  </Button>
                </div>
              </div>
            );
          }}
        />

        <Table.Column
          title="Trạng thái"
          dataIndex="status"
          render={(status, record) => {
            return (
              <Select
                className="review-status-select"
                value={status}
                onChange={async (value) => {
                  try {
                    await fetch(
                      `${import.meta.env.VITE_API_URL}/admin/reviews/${
                        record._id
                      }`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ status: value }),
                      }
                    );
                    refetchReviews(); // reload bảng
                  } catch (err) {
                    console.error("Cập nhật trạng thái thất bại:", err);
                  }
                }}
                style={{ width: 120 }}
              >
                <Select.Option value="approved">Đã duyệt</Select.Option>
                <Select.Option value="rejected">Từ chối</Select.Option>
              </Select>
            );
          }}
        />

        <Table.Column
          dataIndex="createdAt"
          title="Ngày tạo"
          render={(date) =>
            date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"
          }
        />
        <Table.Column
          title="Hành động"
          width={120}
          render={(_, record) => (
            <Space size="small">
              <DeleteButton
                hideText
                size="small"
                recordItemId={record._id}
                onSuccess={() => {
                  refetchReviews();
                }}
              />
            </Space>
          )}
        />
      </Table>
      <Modal
        title="Phản hồi đánh giá"
        open={isReplyModalOpen}
        onCancel={() => setIsReplyModalOpen(false)}
        onOk={handleReplySubmit}
        okText="Lưu"
        footer={[
          <Button key="cancel" onClick={() => setIsReplyModalOpen(false)}>
            Hủy
          </Button>,
          currentReview?.reply?.comment && (
            <Button key="delete" danger onClick={handleDeleteReply}>
              Xoá phản hồi
            </Button>
          ),
          <Button key="submit" type="primary" onClick={handleReplySubmit}>
            Lưu
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="comment"
            label="Nội dung phản hồi"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung phản hồi" },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Nhập nội dung phản hồi..." />
          </Form.Item>
        </Form>
      </Modal>
    </List>
  );
};
