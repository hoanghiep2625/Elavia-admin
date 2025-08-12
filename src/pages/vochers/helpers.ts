/**
 * Helper functions for handling voucher validation errors
 */

import { notification } from "antd";

export const handleVoucherError = (error: any) => {
  // Handle Zod validation errors from backend
  if (error?.response?.data?.errors) {
    const validationErrors = error.response.data.errors;
    const errorMessages = validationErrors
      .map((err: any) => err.message)
      .join(", ");

    notification.error({
      message: "Validation Error",
      description: errorMessages,
      duration: 5,
    });
    return;
  }

  // Handle duplicate code error
  if (error?.response?.data?.message?.includes("Mã voucher đã tồn tại")) {
    notification.error({
      message: "Mã voucher đã tồn tại",
      description: error.response.data.error || "Vui lòng chọn mã khác",
      duration: 5,
    });
    return;
  }

  // Handle other validation errors
  if (error?.response?.data?.message?.includes("không hợp lệ")) {
    notification.error({
      message: "Dữ liệu không hợp lệ",
      description: error.response.data.message,
      duration: 5,
    });
    return;
  }

  // Default error handling
  notification.error({
    message: "Lỗi",
    description:
      error?.response?.data?.message || error?.message || "Có lỗi xảy ra",
    duration: 4,
  });
};

export const formatVoucherValue = (value: number, type: string) => {
  if (type === "percent") {
    return `${value}%`;
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export const getVoucherTypeColor = (type: string) => {
  return type === "percent" ? "blue" : "green";
};

export const getVoucherStatusColor = (isActive: boolean) => {
  return isActive ? "success" : "default";
};
