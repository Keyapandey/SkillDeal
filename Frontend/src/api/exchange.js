import { apiRequest } from "./client";

export const sendExchangeRequest = async (receiverId) => {
  return apiRequest("/exchanges/request", {
    method: "POST",
    body: JSON.stringify({
      receiverId,
    }),
  });
};

export const getIncomingRequests = async () => {
  return apiRequest("/exchanges/requests");
};

export const acceptExchangeRequest = async (requestId) => {
  return apiRequest(`/exchanges/requests/${requestId}/accept`, {
    method: "PATCH",
  });
};

export const declineExchangeRequest = async (requestId) => {
  return apiRequest(`/exchanges/requests/${requestId}/decline`, {
    method: "PATCH",
  });
};

export const getMyExchanges = async () => {
  return apiRequest("/exchanges/my");
};

export const scheduleExchange = async (exchangeId, scheduledAt) => {
  return apiRequest(`/exchanges/${exchangeId}/schedule`, {
    method: "PATCH",
    body: JSON.stringify({
      scheduledAt,
    }),
  });
};

export const startSession = async (exchangeId) => {
  return apiRequest(`/exchanges/${exchangeId}/start-session`, {
    method: "PATCH",
  });
};

export const endSession = async (exchangeId) => {
  return apiRequest(`/exchanges/${exchangeId}/end-session`, {
    method: "PATCH",
  });
};