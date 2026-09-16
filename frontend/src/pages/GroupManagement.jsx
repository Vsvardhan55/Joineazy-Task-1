import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyGroups,
  getGroupById,
  createGroup,
  addGroupMember,
  removeGroupMember,
} from "../services/groupService";
import { useAuth } from "../context/AuthContext";

function GroupManagement() {
  const { user } = useAuth();

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [groupName, setGroupName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [identifierType, setIdentifierType] = useState("email");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyGroups();

      setGroups(response.groups || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load groups."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadGroupDetails = async (groupId) => {
    try {
      setError("");
      setSuccess("");

      const response = await getGroupById(groupId);

      setSelectedGroup(response.group);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load group details."
      );
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!groupName.trim()) {
      setError("Please enter a group name.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await createGroup(groupName.trim());

      setSuccess(response.message || "Group created successfully.");
      setGroupName("");

      await loadGroups();

      if (response.group?.id) {
        await loadGroupDetails(response.group.id);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create group."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!selectedGroup) return;

    if (!identifier.trim()) {
      setError(
        `Please enter the student's ${
          identifierType === "email" ? "email" : "student ID"
        }.`
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const memberData =
        identifierType === "email"
          ? { email: identifier.trim() }
          : { student_id: identifier.trim() };

      const response = await addGroupMember(
        selectedGroup.id,
        memberData
      );

      setSuccess(
        response.message || "Member added successfully."
      );

      setIdentifier("");

      await loadGroups();
      await loadGroupDetails(selectedGroup.id);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to add member."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (studentId) => {
    if (!selectedGroup) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this member?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await removeGroupMember(
        selectedGroup.id,
        studentId
      );

      setSuccess(
        response.message || "Member removed successfully."
      );

      await loadGroups();
      await loadGroupDetails(selectedGroup.id);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to remove member."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const isCreator =
    selectedGroup &&
    Number(selectedGroup.created_by) === Number(user?.id);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Joineazy
            </h1>
            <p className="text-sm text-slate-500">
              Student Portal
            </p>
          </div>

          <Link
            to="/student"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Group Management
          </h2>
          <p className="mt-2 text-slate-600">
            Create groups, manage members, and view your group details.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Create Group */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              Create New Group
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              You will automatically become the group creator.
            </p>

            <form
              onSubmit={handleCreateGroup}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Group Name
                </label>

                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Example: Team Alpha"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? "Creating..." : "Create Group"}
              </button>
            </form>
          </div>

          {/* Groups List */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              My Groups
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Select a group to manage its members.
            </p>

            {loading ? (
              <p className="mt-6 text-sm text-slate-500">
                Loading groups...
              </p>
            ) : groups.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500">
                You are not a member of any group.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => loadGroupDetails(group.id)}
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      selectedGroup?.id === group.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        {group.name}
                      </span>

                      <span className="text-sm text-slate-500">
                        {group.member_count || 0} members
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Group Details */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              Group Details
            </h3>

            {!selectedGroup ? (
              <p className="mt-6 text-sm text-slate-500">
                Select a group to view its members.
              </p>
            ) : (
              <>
                <div className="mt-5 rounded-lg bg-slate-50 p-4">
                  <h4 className="font-bold text-slate-900">
                    {selectedGroup.name}
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedGroup.members?.length || 0} members
                  </p>
                </div>

                {/* Members */}
                <div className="mt-5">
                  <h4 className="mb-3 font-semibold text-slate-800">
                    Members
                  </h4>

                  <div className="space-y-3">
                    {selectedGroup.members?.map((member) => (
                      <div
                        key={member.id}
                        className="rounded-lg border border-slate-200 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {member.name}
                            </p>

                            <p className="text-sm text-slate-500">
                              {member.email}
                            </p>

                            {member.student_id && (
                              <p className="mt-1 text-xs text-slate-400">
                                ID: {member.student_id}
                              </p>
                            )}
                          </div>

                          {isCreator &&
                            Number(member.id) !==
                              Number(user?.id) && (
                              <button
                                onClick={() =>
                                  handleRemoveMember(member.id)
                                }
                                disabled={actionLoading}
                                className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                Remove
                              </button>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Member */}
                {isCreator && (
                  <form
                    onSubmit={handleAddMember}
                    className="mt-6 border-t border-slate-200 pt-6"
                  >
                    <h4 className="mb-3 font-semibold text-slate-800">
                      Add Member
                    </h4>

                    <select
                      value={identifierType}
                      onChange={(e) =>
                        setIdentifierType(e.target.value)
                      }
                      className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                    >
                      <option value="email">
                        Add using Email
                      </option>
                      <option value="student_id">
                        Add using Student ID
                      </option>
                    </select>

                    <input
                      type={
                        identifierType === "email"
                          ? "email"
                          : "text"
                      }
                      value={identifier}
                      onChange={(e) =>
                        setIdentifier(e.target.value)
                      }
                      placeholder={
                        identifierType === "email"
                          ? "student@example.com"
                          : "STU002"
                      }
                      className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                    />

                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading
                        ? "Adding..."
                        : "Add Member"}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default GroupManagement;