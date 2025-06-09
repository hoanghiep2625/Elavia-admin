import React from "react";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export const CategoryEdit: React.FC = () => {
  const { formProps, saveButtonProps, queryResult, form } = useForm();
  const record = queryResult?.data?.data;

  const { selectProps } = useSelect({
    resource: "categories",
    optionLabel: "name",
    optionValue: "_id",
    defaultValue: record?.parentId,
  });

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if ("parentId" in changedValues) {
      const parentId = changedValues.parentId;
      if (parentId) {
        const parentOption = selectProps.options?.find(
          (option: any) => option.value === parentId
        );
        const newLevel = parentOption?.level ? parentOption.level + 1 : 2;
        form.setFieldValue("level", newLevel);
      } else {
        form.setFieldValue("level", 1);
      }
    }
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          label="Tên danh mục"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Edit>
  );
};
