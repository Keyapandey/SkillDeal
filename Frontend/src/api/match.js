import { apiRequest } from "./client";

export const getMatches = async () => {
  return apiRequest("/matches");
};
export const getGuestMatches = async () => {
  return apiRequest("/matches/guest");
};