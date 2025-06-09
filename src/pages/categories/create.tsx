import React, { useEffect, useState } from "react";
import { Create, useTable, useForm } from "@refinedev/antd";
import { Form, Input, Select, TreeSelect } from "antd";

// Hàm dựng cây TreeSelect từ danh sách danh mục
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

export const CategoryCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "categories",
  });

  const { tableProps } = useTable({
    resource: "categories",
    syncWithLocation: false,
    pagination: { pageSize: 1000 }, // lấy toàn bộ danh mục
  });

  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [treeData, setTreeData] = useState<any[]>([]);

  useEffect(() => {
    const raw = Array.isArray(tableProps.dataSource)
      ? tableProps.dataSource
      : (tableProps.dataSource as any)?.data ?? [];

    setCategories(raw);
    setTreeData(buildTreeData(raw));
  }, [tableProps.dataSource]);

  const handleLevelChange = (value: number) => {
    setSelectedLevel(value);
    formProps.form?.setFieldsValue({ parentId: undefined }); // reset parent khi đổi cấp
  };

  const customOnFinish = async (values: any) => {
    const updatedValues = {
      ...values,
      parentId: selectedLevel > 1 ? values.parentId : null,
      level: selectedLevel,
    };
    await formProps.onFinish?.(updatedValues);
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={customOnFinish}
        initialValues={{ level: 1 }}
      >
        <Form.Item
          label="Tên danh mục"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
        >
          <Input placeholder="Nhập tên danh mục" />
        </Form.Item>

        <Form.Item
          label="Cấp độ"
          name="level"
          rules={[{ required: true, message: "Vui lòng chọn cấp độ" }]}
        >
          <Select onChange={handleLevelChange}>
            <Select.Option value={1}>Cấp 1</Select.Option>
            <Select.Option value={2}>Cấp 2</Select.Option>
            <Select.Option value={3}>Cấp 3</Select.Option>
          </Select>
        </Form.Item>

        {selectedLevel > 1 && (
          <Form.Item
            label="Danh mục cha"
            name="parentId"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn danh mục cha phù hợp với cấp độ",
              },
              {
                validator: (_, value) => {
                  if (!value)
                    return Promise.reject("Vui lòng chọn danh mục cha");
                  const parent = categories.find((cat) => cat._id === value);
                  if (!parent) return Promise.reject("Danh mục không tồn tại");
                  if (parent.level !== selectedLevel - 1) {
                    return Promise.reject(
                      `Danh mục cha phải ở cấp ${selectedLevel - 1}`
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <TreeSelect
              treeData={treeData}
              placeholder="Chọn danh mục cha"
              allowClear
              showSearch
              treeLine
              treeDefaultExpandAll={false}
            />
          </Form.Item>
        )}
      </Form>
    </Create>
  );
};
