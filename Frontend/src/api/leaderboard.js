import { apiRequest } from "./client";

export const getLeaderboard = async () => {
  return apiRequest("/leaderboard");
};