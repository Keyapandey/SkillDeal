import { apiRequest } from "./client";

export const getProfile = async () => {
  return apiRequest("/profile");
};

export const updateProfile = async (profileData) => {
  return apiRequest("/profile", {
    method: "PATCH",
    body: JSON.stringify(profileData),
  });
};