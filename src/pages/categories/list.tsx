import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { Table, Input, Space } from "antd";
import { useState, useEffect, useMemo } from "react";

function removeVietnameseTones(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function flattenCategories(
  categories: any[],
  parentId: string | null = null,
  level = 0
): any[] {
  return categories
    .filter((cat) => cat.parentId === parentId)
    .flatMap((cat) => [
      { ...cat, level },
      ...flattenCategories(categories, cat._id, level + 1),
    ]);
}

// Hàm đệ quy tạo số thứ tự phân cấp
function flattenCategoriesWithIndex(
  categories: any[],
  parentId: string | null = null,
  level = 0,
  parentIndex: number[] = []
): any[] {
  let result: any[] = [];
  const children = categories.filter((cat) => cat.parentId === parentId);
  children.forEach((cat, idx) => {
    const currentIndex = [...parentIndex, idx + 1];
    const stt = currentIndex.join(".");
    result.push({ ...cat, level, stt });
    result = result.concat(
      flattenCategoriesWithIndex(categories, cat._id, level + 1, currentIndex)
    );
  });
  return result;
}

// Lấy đường dẫn cha (không bao gồm chính nó)
function getParentPath(cat: any, categories: any[]): string {
  const path = [];
  let current = categories.find((c) => c._id === cat.parentId);
  while (current) {
    path.unshift(current.name);
    current = categories.find((c) => c._id === current.parentId);
  }
  return path.join(" / ");
}

export const CategoryList = () => {
  const { tableProps } = useTable({
    resource: "categories",
    syncWithLocation: true,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const response = tableProps?.dataSource as any;
    if (response?.data && Array.isArray(response.data)) {
      setCategories(response.data);
    } else if (Array.isArray(response)) {
      setCategories(response);
    }
  }, [tableProps?.dataSource]);

  const filteredCategories = useMemo(() => {
    let data = flattenCategoriesWithIndex(categories);
    if (search) {
      const keyword = removeVietnameseTones(search.toLowerCase());
      data = data.filter((cat) =>
        removeVietnameseTones(
          (
            String(cat.name) +
            " " +
            getParentPath(cat, categories)
          ).toLowerCase()
        ).includes(keyword)
      );
    }
    return data;
  }, [categories, search]);

  function flattenCategories(
    categories: any[],
    parentId: string | null = null,
    level = 0,
    parentIndexPath: string[] = []
  ): any[] {
    return categories
      .filter((cat) => cat.parentId === parentId)
      .map((cat, i) => {
        const currentIndexPath = [...parentIndexPath, (i + 1).toString()];
        return [
          {
            ...cat,
            level,
            indexPath: currentIndexPath.join("."),
          },
          ...flattenCategories(
            categories,
            cat._id,
            level + 1,
            currentIndexPath
          ),
        ];
      })
      .flat();
  }
  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 80,
      align: "center" as const,
      dataIndex: "stt",
      render: (stt: string) => <span>{stt}</span>,
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => {
        let prefix = "";
        if (record.level === 1) prefix = "- ";
        if (record.level === 2) prefix = "-- ";
        return (
          <span style={{ paddingLeft: record.level * 24 }}>
            {prefix}
            {record.name}
          </span>
        );
      },
      width: 500,
    },
    {
      title: "Cấp",
      dataIndex: "level",
      key: "level",
      width: 120,
      align: "center" as const,
      render: (_: any, record: any) => <span>{(record.level ?? 0) + 1}</span>,
    },
    {
      title: "Danh mục cha",
      dataIndex: "parentId",
      key: "parent",
      width: 120,
      render: (_: any, record: any) => getParentPath(record, categories),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      align: "center" as const,
      render: (_: any, record: any) => (
        <Space>
          <EditButton hideText size="small" recordItemId={record._id} />
          <ShowButton hideText size="small" recordItemId={record._id} />
          <DeleteButton hideText size="small" recordItemId={record._id} />
        </Space>
      ),
    },
  ];

  return (
    <List title="Danh sách danh mục">
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Input.Search
          placeholder="Tìm kiếm danh mục"
          allowClear
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 320 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredCategories}
        rowKey="_id"
        pagination={false}
      />
    </List>
  );
};
function getCategoryPath(cat: any, categories: any[]) {
  if (!cat) return "";
  const path = [];
  let current = cat;
  while (current) {
    path.unshift(current.name);
    current = categories.find((c) => c._id === current.parentId);
  }
  return path.join(" / ");
}
