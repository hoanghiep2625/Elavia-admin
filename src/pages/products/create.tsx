import React, { useState, useEffect } from "react";
import { Create, useForm, useTable } from "@refinedev/antd";
import { Form, Input, TreeSelect } from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Hàm tạo SKU ngẫu nhiên cho sản phẩm
const generateSKU = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length: 7 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

const buildTreeData = (
  categories: any[],
  parentId: string | null = null
): any[] => {
  const filtered = categories.filter((item) => item.parentId === parentId);
  return filtered.map((item) => ({
    title: item.name,
    value: item._id,
    key: item._id,
    children: buildTreeData(categories, item._id),
  }));
};

export const ProductCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "products",
  });

  const { tableProps: categoryTableProps } = useTable({
    resource: "categories",
    syncWithLocation: true,
  });

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (categoryTableProps?.dataSource) {
      const raw = Array.isArray(categoryTableProps.dataSource)
        ? categoryTableProps.dataSource
        : (categoryTableProps.dataSource as any)?.data ?? [];
      setCategories(raw);
    }
  }, [categoryTableProps?.dataSource]);

  const treeData = buildTreeData(categories);

  useEffect(() => {
    formProps.form?.setFieldsValue({
      sku: generateSKU(),
    });
  }, [formProps.form]);

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item name="sku" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          label="Tên sản phẩm"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
        >
          <Input placeholder="Nhập tên sản phẩm" />
        </Form.Item>

        <Form.Item
          label="Danh mục"
          name="categoryId"
          rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
        >
          <TreeSelect
            treeData={treeData}
            placeholder="Chọn danh mục"
            allowClear
            treeDefaultExpandedKeys={[]}
          />
        </Form.Item>

        <Form.Item
          label="Mô tả ngắn"
          name="shortDescription"
          rules={[{ required: true, message: "Vui lòng nhập mô tả ngắn" }]}
        >
          <Input.TextArea rows={2} placeholder="Nhập mô tả ngắn" />
        </Form.Item>

        <Form.Item label="Mô tả chi tiết" name="description">
          <ReactQuill
            theme="snow"
            onChange={(value) =>
              formProps.form?.setFieldsValue({ description: value })
            }
            value={formProps.form?.getFieldValue("description") || ""}
          />
        </Form.Item>
      </Form>
    </Create>
  );
};
