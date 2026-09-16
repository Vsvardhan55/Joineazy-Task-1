import api from "./api";

export const getMySubmission = async (assignmentId, groupId) => {
  const response = await api.get(`/submissions/${assignmentId}`, {
    params: { group_id: groupId },
  });

  return response.data;
};

export const confirmSubmission = async (assignmentId, groupId) => {
  const response = await api.post(
    `/submissions/${assignmentId}/confirm`,
    {
      group_id: groupId,
    }
  );

  return response.data;
};

export const getGroupProgress = async (groupId) => {
  const response = await api.get(
    `/submissions/group/${groupId}/progress`
  );

  return response.data;
};

export const getAdminSubmissionTracking = async (assignmentId) => {
  const response = await api.get(
    "/submissions/admin/tracking",
    {
      params: assignmentId
        ? { assignment_id: assignmentId }
        : {},
    }
  );

  return response.data;
};