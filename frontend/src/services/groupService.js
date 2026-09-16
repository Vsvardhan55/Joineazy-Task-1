import api from "./api";

export const getMyGroups = async () => {
  const response = await api.get("/groups");
  return response.data;
};

export const getGroupById = async (groupId) => {
  const response = await api.get(`/groups/${groupId}`);
  return response.data;
};

export const createGroup = async (name) => {
  const response = await api.post("/groups", {
    name,
  });

  return response.data;
};

export const addGroupMember = async (groupId, memberData) => {
  const response = await api.post(
    `/groups/${groupId}/members`,
    memberData
  );

  return response.data;
};

export const removeGroupMember = async (
  groupId,
  studentId
) => {
  const response = await api.delete(
    `/groups/${groupId}/members/${studentId}`
  );

  return response.data;
};

export const getAllGroups = async () => {
  const response = await api.get("/groups/all");
  return response.data;
};