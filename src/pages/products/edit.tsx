import { Edit, useForm, useTable } from "@refinedev/antd";
import { Form, Input, TreeSelect } from "antd";
import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Hàm dựng cấu trúc cây danh mục
const buildTreeData = (
  categories: any[],
  parentId: string | null = null
): any[] => {
  return categories
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      title: item.name,
      value: item._id,
      key: item._id,
      children: buildTreeData(categories, item._id),
    }));
};

export const ProductEdit = () => {
  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: "products",
    action: "edit",
    meta: {
      updateResource: "admin/products",
    },
  });

  const { tableProps: categoryTableProps } = useTable({
    resource: "categories",
    syncWithLocation: false,
    pagination: { pageSize: 1000 }, // lấy tất cả danh mục
  });

  const [treeData, setTreeData] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Lấy danh sách danh mục và dựng treeData
  useEffect(() => {
    const raw = Array.isArray(categoryTableProps.dataSource)
      ? categoryTableProps.dataSource
      : (categoryTableProps.dataSource as any)?.data ?? [];

    const tree = buildTreeData(raw);
    setTreeData(tree);

    // Sau khi treeData có và form đã có dữ liệu -> set categoryId vào form
    if (formProps?.initialValues?.categoryId) {
      formProps.form?.setFieldsValue({
        categoryId: formProps.initialValues.categoryId,
      });
    }

    setIsReady(true);
  }, [categoryTableProps.dataSource, formProps.initialValues]);

  if (!isReady) return <div>Đang tải dữ liệu sản phẩm...</div>;

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Tên sản phẩm"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="SKU"
          name="sku"
          rules={[{ required: true, message: "Vui lòng nhập SKU" }]}
        >
          <Input disabled />
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
            showSearch
            treeDefaultExpandAll={false}
            treeLine
            treeDefaultExpandedKeys={[]} // Đảm bảo không expand toàn bộ
          />
        </Form.Item>

        <Form.Item
          label="Mô tả ngắn"
          name="shortDescription"
          rules={[{ required: true, message: "Vui lòng nhập mô tả ngắn" }]}
        >
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item label="Mô tả chi tiết" name="description">
          <ReactQuill
            theme="snow"
            value={formProps.form?.getFieldValue("description") || ""}
            onChange={(value) => {
              formProps.form?.setFieldsValue({ description: value });
            }}
          />
        </Form.Item>
      </Form>
    </Edit>
  );
};
