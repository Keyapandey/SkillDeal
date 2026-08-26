import { apiRequest } from "./client";

export const getAllSkills = async () => {
  return apiRequest("/skills/all");
};

export const getUserSkills = async () => {
  return apiRequest("/skills");
};

export const addSkill = async (skillId, type) => {
  return apiRequest("/skills", {
    method: "POST",
    body: JSON.stringify({
      skillId,
      type,
    }),
  });
};

export const deleteSkill = async (skillId, type) => {
  return apiRequest("/skills", {
    method: "DELETE",
    body: JSON.stringify({
      skillId,
      type,
    }),
  });
};

export const searchUsersBySkill = async (skillId) => {
  return apiRequest(`/skills/search?skillId=${skillId}`);
};

export const getAllUsers = async () => {
    return apiRequest("/skills/users");
};

