import { useForm, Edit } from "@refinedev/antd";
import {
  Form,
  Input,
  Upload,
  Button,
  Select,
  Divider,
  Row,
  Col,
  Space,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useApiUrl } from "@refinedev/core";
import { useEffect } from "react";
import axios from "axios";
import { axiosInstance } from "../../axiosInstance";

const uploadProps = {
  beforeUpload: () => false,
  multiple: false,
};

export const SiteSettingsPage = () => {
  const apiUrl = useApiUrl();

  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: "site-settings",
    action: "edit",
    id: "singleton",
  });

  const record = queryResult?.data?.data;

  // Function to transform record into the format expected by Upload
  const transformInitialValues = (record: any) => {
    if (!record) return {};
    return {
      ...record,
      logo: record.logo
        ? [
            {
              uid: "1",
              url: record.logo.url,
              name: "logo",
              status: "done",
              originFileObj: {},
            },
          ]
        : [],
      favicon: record.favicon
        ? [
            {
              uid: "2",
              url: record.favicon.url,
              name: "favicon",
              status: "done",
              originFileObj: {},
            },
          ]
        : [],
      banners: {
        banner01:
          record.banners?.banner01?.map((img: any, i: number) => ({
            uid: `b1-${i}`,
            url: img.url,
            name: `banner01-${i}`,
            status: "done",
            originFileObj: {},
          })) || [],
        banner02: record.banners?.banner02
          ? [
              {
                uid: "b2",
                url: record.banners.banner02.url,
                name: "banner02",
                status: "done",
                originFileObj: {},
              },
            ]
          : [],
        banner03:
          record.banners?.banner03?.map((img: any, i: number) => ({
            uid: `b3-${i}`,
            url: img.url,
            name: `banner03-${i}`,
            status: "done",
            originFileObj: {},
          })) || [],
      },
    };
  };

  // Set transformed initial values when record is fetched
  useEffect(() => {
    if (record && formProps.form) {
      const transformed = transformInitialValues(record);
      formProps.form.setFieldsValue(transformed);
    }
  }, [record, formProps.form]);

  const normalizeFile = (e: any) => {
    if (Array.isArray(e)) return e;
    if (e && e.fileList && Array.isArray(e.fileList)) return e.fileList;
    return [];
  };

  const transformImage = (field: any) => {
    const file = field?.[0]?.originFileObj;
    return file ? { file } : undefined;
  };

  const transformMultipleImages = (field: any[]) => {
    return (
      field
        ?.filter((f) => f.originFileObj)
        ?.map((f) => ({ file: f.originFileObj })) || []
    );
  };

  const handleTransform = (values: any) => ({
    ...values,
    logo: transformImage(values.logo),
    favicon: transformImage(values.favicon),
    banners: {
      banner01: transformMultipleImages(values.banners?.banner01),
      banner02: transformImage(values.banners?.banner02),
      banner03: transformMultipleImages(values.banners?.banner03),
    },
  });

  // Helper: append file(s) to FormData
  const appendFiles = (
    formData: FormData,
    key: string,
    files: any,
    isMultiple: boolean = false
  ) => {
    if (!files) return;
    if (isMultiple) {
      (files as any[]).forEach((file: any) => {
        if (file.originFileObj) {
          formData.append(`${key}`, file.originFileObj);
        }
      });
    } else {
      if (files[0]?.originFileObj) {
        formData.append(key, files[0].originFileObj);
      }
    }
  };

  // Custom submit handler: build FormData and send to backend
  const handleCustomSubmit = async (values: any) => {
    const formData = new FormData();
    // Text fields
    formData.append("status", values.status || "active");
    formData.append("language", values.language || "vi");
    formData.append("seo[title]", values.seo?.title || "");
    formData.append("seo[description]", values.seo?.description || "");
    if (values.seo?.keywords) {
      (values.seo.keywords as any[]).forEach((kw: any, i: number) => {
        formData.append(`seo[keywords][${i}]`, kw);
      });
    }
    // Footer fields
    if (values.footer) {
      Object.entries(values.footer).forEach(([k, v]) => {
        if (typeof v === "object" && v !== null) {
          Object.entries(v).forEach(([kk, vv]) => {
            if (typeof vv === "string" || typeof vv === "number") {
              formData.append(`footer[${k}][${kk}]`, vv.toString());
            }
          });
        } else if (typeof v === "string" || typeof v === "number") {
          formData.append(`footer[${k}]`, v.toString());
        }
      });
    }
    // Files
    appendFiles(formData, "logo", values.logo);
    appendFiles(formData, "favicon", values.favicon);
    appendFiles(formData, "banner02", values.banners?.banner02);
    appendFiles(formData, "banner01", values.banners?.banner01, true);
    appendFiles(formData, "banner03", values.banners?.banner03, true);

    // Gửi lên API
    try {
      await axiosInstance.patch(`${apiUrl}/site-settings/singleton`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (formProps?.onFinish) formProps.onFinish(values);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Upload error:", err);
    }
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          logo: [],
          favicon: [],
          banners: {
            banner01: [],
            banner02: [],
            banner03: [],
          },
        }}
        onFinish={handleCustomSubmit}
      >
        {/* Section: Logo & Favicon */}
        <Divider orientation="left">Ảnh đại diện</Divider>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="logo"
              label="Logo"
              valuePropName="fileList"
              getValueFromEvent={normalizeFile}
            >
              <Upload {...uploadProps} listType="picture">
                <Button icon={<UploadOutlined />}>Upload Logo</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="favicon"
              label="Favicon"
              valuePropName="fileList"
              getValueFromEvent={normalizeFile}
            >
              <Upload {...uploadProps} listType="picture">
                <Button icon={<UploadOutlined />}>Upload Favicon</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        {/* Section: Status & Language */}
        <Divider orientation="left">Trạng thái & Ngôn ngữ</Divider>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item name="status" label="Trạng thái">
              <Select>
                <Select.Option value="active">Hoạt động</Select.Option>
                <Select.Option value="maintenance">Bảo trì</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="language" label="Ngôn ngữ">
              <Select>
                <Select.Option value="vi">Tiếng Việt</Select.Option>
                <Select.Option value="en">English</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Section: SEO */}
        <Divider orientation="left">SEO</Divider>
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Form.Item name={["seo", "title"]} label="Tiêu đề SEO">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name={["seo", "description"]} label="Mô tả SEO">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name={["seo", "keywords"]} label="Từ khóa SEO">
              <Select mode="tags" tokenSeparators={[","]} />
            </Form.Item>
          </Col>
        </Row>

        {/* Section: Banner */}
        <Divider orientation="left">Banner</Divider>
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Form.Item
              name={["banners", "banner01"]}
              label="Banner 01 (Slider)"
              valuePropName="fileList"
              getValueFromEvent={normalizeFile}
            >
              <Upload {...uploadProps} listType="picture" multiple>
                <Button icon={<UploadOutlined />}>Upload Banner 01</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name={["banners", "banner02"]}
              label="Banner 02"
              valuePropName="fileList"
              getValueFromEvent={normalizeFile}
            >
              <Upload {...uploadProps} listType="picture">
                <Button icon={<UploadOutlined />}>Upload Banner 02</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name={["banners", "banner03"]}
              label="Banner 03"
              valuePropName="fileList"
              getValueFromEvent={normalizeFile}
            >
              <Upload {...uploadProps} listType="picture" multiple>
                <Button icon={<UploadOutlined />}>Upload Banner 03</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        {/* Section: Footer Info */}
        <Divider orientation="left">Thông tin Footer</Divider>
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Form.Item name={["footer", "phone"]} label="Số điện thoại">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name={["footer", "address"]} label="Địa chỉ">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name={["footer", "termsLink"]}
              label="Liên kết điều khoản"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name={["footer", "policyLink"]}
              label="Liên kết chính sách"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* Section: App Links */}
        <Divider orientation="left">App Links</Divider>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name={["footer", "appLinks", "android"]}
              label="Link app Android"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name={["footer", "appLinks", "ios"]}
              label="Link app iOS"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* Section: Social Links */}
        <Divider orientation="left">Social Links</Divider>
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Form.Item
              name={["footer", "socialLinks", "facebook"]}
              label="Facebook"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name={["footer", "socialLinks", "instagram"]}
              label="Instagram"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name={["footer", "socialLinks", "youtube"]}
              label="YouTube"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Form.Item
              name={["footer", "socialLinks", "google"]}
              label="Google"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name={["footer", "socialLinks", "pinterest"]}
              label="Pinterest"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name={["footer", "socialLinks", "messenger"]}
              label="Messenger"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
