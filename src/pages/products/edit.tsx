import { Edit, useForm, useTable } from "@refinedev/antd";
import { Form, Input, TreeSelect } from "antd";
import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";

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

export const ProductEdit = ({ variantId }: { variantId: string }) => {
  const { formProps, saveButtonProps } = useForm({
    resource: "products",
    action: "edit",
    meta: {
      updateResource: "admin/products",
    },
  });

  const { tableProps: categoryTableProps } = useTable({
    resource: "categories",
    syncWithLocation: false,
    pagination: { pageSize: 1000 },
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

    // Nếu categoryId là object, lấy _id
    let categoryValue = formProps?.initialValues?.categoryId;
    if (categoryValue && typeof categoryValue === "object" && categoryValue._id) {
      categoryValue = categoryValue._id;
    }

    if (categoryValue) {
      formProps.form?.setFieldsValue({
        categoryId: categoryValue,
      });
    }

    setIsReady(true);
  }, [categoryTableProps.dataSource, formProps.initialValues]);

  // Lấy dữ liệu variant và set vào form
  useEffect(() => {
    if (!variantId) return;
    const fetchVariant = async () => {
      try {
        const res = await axios.get(`http://localhost:5175/api/admin/variants/${variantId}`);
        const data = res.data;
        // Set các trường vào form, chú ý trường categoryId
        formProps.form?.setFieldsValue({
          name: data.name,
          sku: data.sku,
          categoryId: data.categoryId,
          shortDescription: data.shortDescription,
          description: data.description,
        });
        setIsReady(true);
      } catch (err) {
        setIsReady(true);
      }
    };
    fetchVariant();
  }, [variantId, formProps.form]);

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
            treeDefaultExpandedKeys={[]}
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
