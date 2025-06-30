import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export const AttributeEdit = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
          <Input disabled />
        </Form.Item>
        <Form.Item name="values" label="Values (comma separated)">
          <Select mode="tags" tokenSeparators={[","]} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
