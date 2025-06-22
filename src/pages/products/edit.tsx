import { Edit, useForm, useTable } from "@refinedev/antd";
import {
  Form,
  Input,
  TreeSelect,
  Table,
  Radio,
  Image,
  Select,
  Switch,
} from "antd";
import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { useCustom } from "@refinedev/core";

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

  useEffect(() => {
    const raw = Array.isArray(categoryTableProps.dataSource)
      ? categoryTableProps.dataSource
      : (categoryTableProps.dataSource as any)?.data ?? [];

    const tree = buildTreeData(raw);
    setTreeData(tree);

    let categoryValue = formProps?.initialValues?.categoryId;
    if (
      categoryValue &&
      typeof categoryValue === "object" &&
      categoryValue._id
    ) {
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
  const { data: variantData, isLoading: isVariantLoading } = useCustom({
    url: `/admin/variants/${variantId}`,
    method: "get",
    queryOptions: {
      enabled: !!variantId,
    },
  });

  useEffect(() => {
    if (!variantData?.data) return;
    const data = variantData.data;
    formProps.form?.setFieldsValue({
      name: data.name,
      sku: data.sku,
      categoryId: data.categoryId,
      shortDescription: data.shortDescription,
      description: data.description,
      representativeVariantId: data.representativeVariantId,
    });
    setIsReady(true);
  }, [variantData?.data, formProps.form]);

  const ProductVariantsSelect = ({ productId }: { productId: string }) => {
    const { data, isLoading } = useCustom({
      url: `/admin/variants-product/${productId}`,
      method: "get",
    });

    const variants = data?.data?.data || data?.data || [];

    return (
      <Form.Item label="Chọn sản phẩm đại diện" name="representativeVariantId">
        <Select
          loading={isLoading}
          placeholder="Chọn variant đại diện"
          style={{ width: "100%" }}
          allowClear
          optionLabelProp="label"
        >
          {variants.map((variant: any) => (
            <Select.Option
              key={variant._id}
              value={variant._id}
              label={
                <span>
                  <img
                    className="flex center"
                    src={variant.images?.main?.url}
                    alt=""
                    style={{
                      width: 30,
                      height: 30,
                      objectFit: "cover",
                      marginRight: 8,
                      borderRadius: 4,
                    }}
                  />
                  {variant.color?.colorName || variant.sku} -{" "}
                  {variant.price?.toLocaleString()}₫
                </span>
              }
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Image src={variant.images?.main?.url} alt="" width={30} />
                <div>
                  <div>
                    <b>{variant.color?.colorName || variant.sku}</b>
                  </div>
                  <div style={{ color: "#888" }}>
                    {variant.price?.toLocaleString()}₫
                  </div>
                </div>
              </div>
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    );
  };

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
        <Form.Item name="representativeVariantId" hidden>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item
          label="Trạng thái"
          name="status"
          valuePropName="checked"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
        <Form.Item shouldUpdate>
          {() => {
            const productId = formProps.form?.getFieldValue("_id");
            return productId ? (
              <ProductVariantsSelect productId={productId} />
            ) : null;
          }}
        </Form.Item>
      </Form>
    </Edit>
  );
};
