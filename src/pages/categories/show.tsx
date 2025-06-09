import { Show, TextField } from "@refinedev/antd";
import { useShow, useOne } from "@refinedev/core";
import { Typography } from "antd";

const { Title } = Typography;

export const CategoryShow = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  const { data: parentData } = useOne({
    resource: "categories",
    id: record?.parentId,
    queryOptions: { enabled: !!record?.parentId },
  });

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>ID</Title>
      <TextField value={record?._id} />
      <Title level={5}>Tên danh mục</Title>
      <TextField value={record?.name} />
      <Title level={5}>Cấp độ</Title>
      <TextField value={record?.level} />
      <Title level={5}>Danh mục cha</Title>
      <TextField value={parentData?.data?.name ?? "—"} />
    </Show>
  );
};
