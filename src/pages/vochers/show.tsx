import { Show, DateField, TagField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Descriptions } from "antd";

export const VoucherShow = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Descriptions
        title="Chi tiết Voucher"
        layout="vertical"
        bordered
        column={2}
      >
        <Descriptions.Item label="Mã giảm giá">
          {record?.code}
        </Descriptions.Item>
        <Descriptions.Item label="Mô tả">
          {record?.description || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Loại">
          {record?.type === "fixed"
            ? "Giảm tiền cố định"
            : "Giảm theo phần trăm"}
        </Descriptions.Item>

        <Descriptions.Item label="Giá trị giảm">
          {record?.type === "fixed"
            ? record?.maxDiscount != null
              ? `${record.maxDiscount.toLocaleString()}₫`
              : "-"
            : record?.value != null
            ? `${record.value}%`
            : "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Giảm tối đa">
          {record?.maxDiscount != null
            ? `${record.maxDiscount.toLocaleString()}₫`
            : "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Đơn hàng tối thiểu">
          {record?.minOrderValue != null
            ? record.minOrderValue.toLocaleString()
            : "0"}
          ₫
        </Descriptions.Item>

        <Descriptions.Item label="Số lượt còn lại">
          {record?.quantity}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày hết hạn">
          {record?.expiresAt ? (
            <DateField value={record.expiresAt} format="DD/MM/YYYY" />
          ) : (
            "Không giới hạn"
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái">
          <TagField
            value={record?.isActive ? "Hoạt động" : "Ngưng"}
            color={record?.isActive ? "green" : "red"}
          />
        </Descriptions.Item>

        <Descriptions.Item label="Người đã dùng">
          {(record?.usedBy?.length || 0) > 0
            ? `${record?.usedBy?.length} người dùng`
            : "Chưa ai dùng"}
        </Descriptions.Item>
      </Descriptions>
    </Show>
  );
};
