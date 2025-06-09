// src/pages/orders/edit.tsx
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export const OrderEdit = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Trạng thái" name="status">
          <Select>
            <Select.Option value="Chờ xác nhận">Chờ xác nhận</Select.Option>
            <Select.Option value="Đang giao">Đang giao</Select.Option>
            <Select.Option value="Đã giao">Đã giao</Select.Option>
            <Select.Option value="Đã hủy">Đã hủy</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Edit>
  );
};
