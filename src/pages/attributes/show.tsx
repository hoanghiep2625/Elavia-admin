import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";

export const AttributeShow = () => {
  const { queryResult } = useShow();
  const record = queryResult?.data?.data;

  return (
    <Show>
      <p>
        <strong>Name:</strong> {record?.name}
      </p>
      <p>
        <strong>Slug:</strong> {record?.slug}
      </p>
      <p>
        <strong>Values:</strong> {record?.values?.join(", ")}
      </p>

      <p>
        <strong>Ngày tạo:</strong>{" "}
        {record?.createdAt ? new Date(record.createdAt).toLocaleString() : "-"}
      </p>
      <p>
        <strong>Ngày sửa:</strong>{" "}
        {record?.updatedAt ? new Date(record.updatedAt).toLocaleString() : "-"}
      </p>
    </Show>
  );
};
