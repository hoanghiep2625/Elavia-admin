import { Create, useForm } from "@refinedev/antd";
import { DatePicker, Form, Input, InputNumber, Select, Switch } from "antd";

export const VoucherCreate = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form layout="vertical" {...formProps}>
        <Form.Item label="Mã giảm giá" name="code" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item label="Loại" name="type" rules={[{ required: true }]}>
          <Select
            options={[
              { label: "Giảm tiền cố định", value: "fixed" },
              { label: "Giảm theo %", value: "percent" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Giá trị giảm"
          name="value"
          rules={[{ required: true }]}
        >
          <InputNumber addonAfter="₫ / %" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Giảm tối đa" name="maxDiscount">
          <InputNumber addonAfter="₫" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Đơn tối thiểu" name="minOrderValue">
          <InputNumber addonAfter="₫" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Số lượt dùng" name="quantity">
          <InputNumber min={0} />
        </Form.Item>

        <Form.Item label="Ngày hết hạn" name="expiresAt">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Hoạt động" name="isActive" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Create>
  );
};
