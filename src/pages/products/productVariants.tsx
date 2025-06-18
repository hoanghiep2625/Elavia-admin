import { useParams } from "react-router-dom";
import { List, useTable } from "@refinedev/antd";
import { Card, Image, Table } from "antd";

export const ProductVariants = () => {
  const { id } = useParams();
  
  const { tableProps } = useTable({
    resource: "product-variants",
    filters: {
      permanent: [
        {
          field: "productId",
          operator: "eq",
          value: id,
        },
      ],
    },
  });

  return (
    <List>
      <Card title="Danh sách biến thể">
        <Table {...tableProps}>
          <Table.Column
            title="Hình ảnh"
            dataIndex={["images", "main", "url"]}
            render={(url: any) => (
              <Image
                src={url}
                alt="Ảnh sản phẩm"
                width={100}
                height={100}
                style={{ objectFit: "cover" }}
              />
            )}
          />
          <Table.Column title="SKU" dataIndex="sku" />
          <Table.Column title="Giá" dataIndex="price" />
          <Table.Column 
            title="Màu sắc" 
            dataIndex={["color", "colorName"]} 
          />
          <Table.Column
            title="Kích thước & Số lượng"
            dataIndex="sizes"
            render={(sizes) => (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {sizes.map((size: any) => (
                  <li key={size.size}>
                    {size.size}: {size.stock}
                  </li>
                ))}
              </ul>
            )}
          />
        </Table>
      </Card>
    </List>
  );
};