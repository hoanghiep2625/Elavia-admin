import { useState, useEffect } from "react";
import { message as antMessage } from "antd";
import { useCustom } from "@refinedev/core";
import { axiosInstance } from "../axiosInstance";

export interface Message {
  _id: string;
  content: string;
  senderType: "user" | "admin" | "system";
  type?: "text" | "image" | "product";
  createdAt: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface Conversation {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  adminId?: {
    _id: string;
    name: string;
    email: string;
  };
  status: "waiting" | "active" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  tags: string[];
  createdAt: string;
  lastMessageAt: string;
  lastMessage?: {
    content: string;
    senderType: "user" | "admin";
    createdAt: string;
  };
  unreadCount: number;
}

export interface Admin {
  _id: string;
  name: string;
  email: string;
}

export interface ChatStats {
  totalConversations: number;
  waitingConversations: number;
  activeConversations: number;
  todayConversations: number;
  todayMessages: number;
  avgResponseTimeMinutes: number;
}

export const useConversation = (conversationId: string | undefined) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async (silent = false) => {
    if (!conversationId) return;

    try {
      setLoading(true);

      // Load conversation
      const conversationResponse = await axiosInstance.get(
        `/chat/admin/conversations?conversationId=${conversationId}`
      );

      if (conversationResponse.data?.conversations?.length > 0) {
        setConversation(conversationResponse.data.conversations[0]);
      }

      // Load messages
      const messagesResponse = await axiosInstance.get(
        `/chat/admin/conversation/${conversationId}/messages`
      );

      if (messagesResponse.data?.messages) {
        const newMessages = messagesResponse.data.messages;

        // Chỉ update nếu có thay đổi
        setMessages((prevMessages) => {
          const hasChanges =
            JSON.stringify(prevMessages) !== JSON.stringify(newMessages);
          return hasChanges ? newMessages : prevMessages;
        });
      }
    } catch (error) {
      if (!silent) {
        console.error("Error loading data:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [conversationId]);

  // Send message function using axiosInstance
  const sendMessage = async (content: string, type: string = "text") => {
    if (!conversationId || !content.trim()) return null;

    try {
      const response = await axiosInstance.post("/chat/admin/message", {
        conversationId,
        content: content.trim(),
        type,
      });

      const newMessage = response.data.message;
      setMessages((prev) => [...prev, newMessage]);
      loadData(); // Reload data instead of refetch

      return newMessage;
    } catch (error) {
      console.error("Error sending message:", error);
      antMessage.error("Lỗi khi gửi tin nhắn");
      return null;
    }
  };

  // Assign conversation function
  const assignConversation = async (adminId: string) => {
    if (!conversationId) return false;

    try {
      await axiosInstance.put(
        `/chat/admin/conversation/${conversationId}/assign`,
        { adminId }
      );

      antMessage.success("Đã phân công cuộc trò chuyện");
      loadData(); // Reload data instead of refetch
      return true;
    } catch (error) {
      console.error("Error assigning conversation:", error);
      antMessage.error("Lỗi khi phân công cuộc trò chuyện");
      return false;
    }
  };

  // Close conversation function
  const closeConversation = async () => {
    if (!conversationId) return false;

    try {
      await axiosInstance.put(
        `/chat/admin/conversation/${conversationId}/close`
      );

      antMessage.success("Đã đóng cuộc trò chuyện");
      loadData(); // Reload data instead of refetch
      return true;
    } catch (error) {
      console.error("Error closing conversation:", error);
      antMessage.error("Lỗi khi đóng cuộc trò chuyện");
      return false;
    }
  };

  return {
    conversation,
    messages,
    loading,
    sendMessage,
    assignConversation,
    closeConversation,
    reload: () => loadData(true), // silent reload cho polling
  };
};
export const useAdmins = () => {
  const { data, isLoading, refetch } = useCustom({
    url: "/chat/admin/admins",
    method: "get",
  });

  const admins = data?.data?.admins || [];

  return { admins, loading: isLoading, reload: refetch };
};
export const useChatStats = () => {
  const { data, isLoading, refetch } = useCustom({
    url: "/chat/admin/stats",
    method: "get",
  });

  const stats = data?.data?.stats || null;

  return { stats, loading: isLoading, reload: refetch };
};

export const useConversations = (filters: any, pagination: any) => {
  const params = new URLSearchParams({
    page: pagination.current.toString(),
    limit: pagination.pageSize.toString(),
    ...filters,
  });

  const { data, isLoading, refetch } = useCustom({
    url: `/chat/admin/conversations?${params}`,
    method: "get",
    queryOptions: {
      // Refetch khi dependencies thay đổi
      queryKey: [
        "conversations",
        pagination.current,
        pagination.pageSize,
        JSON.stringify(filters),
      ],
    },
  });

  const conversations = data?.data?.conversations || [];
  const total = data?.data?.pagination?.totalConversations || 0;

  return {
    conversations,
    loading: isLoading,
    total,
    reload: refetch,
  };
};
