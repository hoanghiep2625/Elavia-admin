import { Create, useForm } from "@refinedev/antd";
import { DatePicker, Form, Input, InputNumber, Select, Switch } from "antd";
import { useState } from "react";
import { handleVoucherError } from "./helpers";

export const VoucherCreate = () => {
  const { formProps, saveButtonProps } = useForm({
    onMutationError: (error) => {
      handleVoucherError(error);
    },
  });
  const [voucherType, setVoucherType] = useState<string>("");

  // Custom validation cho code: chuyển về uppercase và check unique
  const validateCode = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error("Mã giảm giá là bắt buộc"));
    }
    if (value.length < 2) {
      return Promise.reject(new Error("Mã giảm giá cần tối thiểu 2 ký tự"));
    }
    // Chuyển về uppercase
    formProps.form?.setFieldValue("code", value.toUpperCase());
    return Promise.resolve();
  };

  // Custom validation cho value theo type
  const validateValue = (_: any, value: number) => {
    if (value === undefined || value === null) {
      return Promise.reject(new Error("Giá trị giảm là bắt buộc"));
    }
    if (value < 0) {
      return Promise.reject(new Error("Giá trị giảm phải lớn hơn hoặc bằng 0"));
    }
    if (voucherType === "percent" && value > 100) {
      return Promise.reject(
        new Error("Giá trị phần trăm không được vượt quá 100%")
      );
    }
    return Promise.resolve();
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form layout="vertical" {...formProps}>
        <Form.Item
          label="Mã giảm giá"
          name="code"
          rules={[{ validator: validateCode }]}
        >
          <Input
            placeholder="Ví dụ: SALE50, FREESHIP"
            style={{ textTransform: "uppercase" }}
          />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={2} placeholder="Mô tả về voucher này..." />
        </Form.Item>

        <Form.Item label="Loại" name="type" rules={[{ required: true }]}>
          <Select
            placeholder="Chọn loại voucher"
            options={[
              { label: "Giảm tiền cố định", value: "fixed" },
              { label: "Giảm theo %", value: "percent" },
            ]}
            onChange={(value) => {
              setVoucherType(value);
              // Reset value khi đổi type để trigger validation lại
              formProps.form?.setFieldValue("value", undefined);
            }}
          />
        </Form.Item>

        <Form.Item
          label={`Giá trị giảm ${
            voucherType === "percent" ? "(0-100%)" : "(VNĐ)"
          }`}
          name="value"
          rules={[{ validator: validateValue }]}
        >
          <InputNumber
            addonAfter={voucherType === "percent" ? "%" : "₫"}
            style={{ width: "100%" }}
            placeholder={
              voucherType === "percent" ? "0-100" : "10000, 50000..."
            }
            min={0}
            max={voucherType === "percent" ? 100 : undefined}
          />
        </Form.Item>

        <Form.Item
          label="Giảm tối đa"
          name="maxDiscount"
          tooltip="Chỉ áp dụng cho voucher giảm theo %. Ví dụ: Giảm 20% tối đa 100.000đ"
        >
          <InputNumber
            addonAfter="₫"
            style={{ width: "100%" }}
            placeholder="100000, 200000..."
            min={0}
            disabled={voucherType !== "percent"}
          />
        </Form.Item>

        <Form.Item
          label="Đơn tối thiểu"
          name="minOrderValue"
          tooltip="Giá trị đơn hàng tối thiểu để áp dụng voucher"
        >
          <InputNumber
            addonAfter="₫"
            style={{ width: "100%" }}
            placeholder="500000, 1000000..."
            min={0}
          />
        </Form.Item>

        <Form.Item
          label="Số lượt dùng"
          name="quantity"
          tooltip="Tổng số lần voucher có thể được sử dụng"
        >
          <InputNumber
            min={1}
            placeholder="1, 10, 100..."
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          label="Ngày hết hạn"
          name="expiresAt"
          tooltip="Để trống nếu voucher không có thời hạn"
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Chọn ngày hết hạn"
            showTime={{ format: "HH:mm" }}
            format="DD/MM/YYYY HH:mm"
          />
        </Form.Item>

        <Form.Item
          label="Hoạt động"
          name="isActive"
          valuePropName="checked"
          tooltip="Bật/tắt voucher. Chỉ voucher hoạt động mới có thể được sử dụng"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Create>
  );
};
