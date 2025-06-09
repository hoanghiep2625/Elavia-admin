import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select, DatePicker, Table, Tag } from "antd";

export const UserEdit = () => {
  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: "users",
  });

  const user = queryResult?.data?.data;

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          sex: "1",
          role: "3",
        }}
      >
        <Form.Item label="Họ và tên" name="name">
          <Input />
        </Form.Item>

        <Form.Item label="Email" name="email">
          <Input disabled />
        </Form.Item>

        <Form.Item label="Số điện thoại" name="phone">
          <Input />
        </Form.Item>

        <Form.Item label="Ngày sinh" name="date">
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item label="Giới tính" name="sex">
          <Select>
            <Select.Option value="1">Nam</Select.Option>
            <Select.Option value="0">Nữ</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Vai trò" name="role">
          <Select>
            <Select.Option value="1">Khách hàng</Select.Option>
            <Select.Option value="2">Người bán</Select.Option>
            <Select.Option value="3">Quản trị viên</Select.Option>
          </Select>
        </Form.Item>

        {/* DANH SÁCH ĐỊA CHỈ */}
        {user?.shipping_addresses && (
          <>
            <h3 style={{ marginTop: 24, marginBottom: 8 }}>
              Địa chỉ giao hàng
            </h3>
            <Table
              dataSource={user.shipping_addresses}
              rowKey={(record) => record._id?.$oid || record._id}
              pagination={false}
              bordered
            >
              <Table.Column
                title="Người nhận"
                dataIndex="receiver_name"
                key="receiver_name"
              />
              <Table.Column
                title="Số điện thoại"
                dataIndex="phone"
                key="phone"
              />
              <Table.Column
                title="Địa chỉ"
                key="address"
                render={(_, record: any) =>
                  `${record.address}, ${record.commune?.name}, ${record.district?.name}, ${record.city?.name}`
                }
              />
              <Table.Column
                title="Mặc định"
                key="isDefault"
                render={(_, record: any) =>
                  record.isDefault ? <Tag color="green">Mặc định</Tag> : "-"
                }
              />
            </Table>
          </>
        )}
      </Form>
    </Edit>
  );
};
