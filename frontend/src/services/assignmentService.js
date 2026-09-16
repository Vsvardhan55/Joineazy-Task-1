import api from "./api";

export const getAssignments = async () => {
  const response = await api.get("/assignments");
  return response.data;
};

export const getAssignmentById = async (assignmentId) => {
  const response = await api.get(`/assignments/${assignmentId}`);
  return response.data;
};

export const createAssignment = async (assignmentData) => {
  const response = await api.post("/assignments", assignmentData);
  return response.data;
};

export const updateAssignment = async (
  assignmentId,
  assignmentData
) => {
  const response = await api.put(
    `/assignments/${assignmentId}`,
    assignmentData
  );

  return response.data;
};

export const deleteAssignment = async (assignmentId) => {
  const response = await api.delete(
    `/assignments/${assignmentId}`
  );

  return response.data;
};

export const assignAssignmentToGroups = async (
  assignmentId,
  groupIds
) => {
  const response = await api.post(
    `/assignments/${assignmentId}/groups`,
    {
      group_ids: groupIds,
    }
  );

  return response.data;
};