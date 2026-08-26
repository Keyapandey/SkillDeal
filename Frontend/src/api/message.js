import { apiRequest } from "./client";

export const getMessages = async (userId) => {
  return apiRequest(`/messages/${userId}`);
};

export const sendMessage = async (receiverId, content) => {
  return apiRequest("/messages", {
    method: "POST",
    body: JSON.stringify({
      receiverId,
      content,
    }),
  });
};

export const getConversations = async () => {
  return apiRequest("/messages/conversations");
};