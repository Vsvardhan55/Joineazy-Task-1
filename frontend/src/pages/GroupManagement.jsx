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
  const [actionType, setActionType] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);

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
      setDetailsLoading(true);
      setError("");
      setSuccess("");

      const response = await getGroupById(groupId);

      setSelectedGroup(response.group);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load group details."
      );
    } finally {
      setDetailsLoading(false);
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
      setActionType("create");
      setError("");
      setSuccess("");

      const response = await createGroup(groupName.trim());

      setSuccess(
        response.message || "Group created successfully."
      );

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
      setActionType("");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!selectedGroup) return;

    if (!identifier.trim()) {
      setError(
        `Please enter the student's ${
          identifierType === "email"
            ? "email"
            : "student ID"
        }.`
      );
      return;
    }

    try {
      setActionLoading(true);
      setActionType("add");
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
      setActionType("");
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
      setActionType("");
    }
  };

  const isCreator =
    selectedGroup &&
    Number(selectedGroup.created_by) === Number(user?.id);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Joineazy
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Student Portal
            </p>
          </div>

          <Link
            to="/student"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md"
          >
            <span>←</span>
            <span className="hidden sm:inline">
              Back to Dashboard
            </span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Heading */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Student Workspace
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Group Management
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Create groups, manage members, and keep your project
            teams organized in one place.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 shadow-sm">
            <span className="mt-0.5">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700 shadow-sm">
            <span className="mt-0.5">✓</span>
            <p>{success}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Create Group */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                👥
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Create New Group
                </h3>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Start a team and automatically become its
                  group leader.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleCreateGroup}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Group Name
                </label>

                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Example: Team Alpha"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading && actionType === "create"
                  ? "Creating..."
                  : "Create Group"}
              </button>
            </form>
          </section>

          {/* Groups List */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-xl">
                📋
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  My Groups
                </h3>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Select a group to view and manage its members.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                <p className="mt-3 text-sm text-slate-500">
                  Loading groups...
                </p>
              </div>
            ) : groups.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <div className="text-3xl">👥</div>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No groups yet
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Create a group to start collaborating with
                  other students.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {groups.map((group) => {
                  const isSelected =
                    selectedGroup?.id === Number(group.id);

                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() =>
                        loadGroupDetails(group.id)
                      }
                      className={`group w-full rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className={`truncate font-semibold ${
                              isSelected
                                ? "text-blue-900"
                                : "text-slate-900"
                            }`}
                          >
                            {group.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {group.member_count || 0}{" "}
                            {Number(group.member_count) === 1
                              ? "member"
                              : "members"}
                          </p>
                        </div>

                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                          }`}
                        >
                          →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Group Details */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                🏷️
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Group Details
                </h3>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  View members and manage your team.
                </p>
              </div>
            </div>

            {detailsLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                <p className="mt-3 text-sm text-slate-500">
                  Loading group details...
                </p>
              </div>
            ) : !selectedGroup ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <div className="text-3xl">👈</div>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Select a group
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Choose a group from the list to view its
                  members and details.
                </p>
              </div>
            ) : (
              <>
                {/* Group Summary */}
                <div className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Selected Group
                      </p>

                      <h4 className="mt-1 text-xl font-bold text-slate-900">
                        {selectedGroup.name}
                      </h4>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                      👥
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">
                      {selectedGroup.members?.length || 0}
                    </span>
                    {selectedGroup.members?.length === 1
                      ? "member"
                      : "members"}
                  </div>
                </div>

                {/* Members */}
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-semibold text-slate-800">
                      Members
                    </h4>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {selectedGroup.members?.length || 0}
                    </span>
                  </div>

                  {selectedGroup.members?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedGroup.members.map((member) => {
                        const isLeader =
                          Number(member.id) ===
                          Number(selectedGroup.created_by);

                        const isCurrentUser =
                          Number(member.id) ===
                          Number(user?.id);

                        return (
                          <div
                            key={member.id}
                            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
                                  {member.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "S"}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate font-semibold text-slate-900">
                                      {member.name}
                                    </p>

                                    {isCurrentUser && (
                                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                                        You
                                      </span>
                                    )}
                                  </div>

                                  <p className="mt-1 break-all text-xs text-slate-500">
                                    {member.email}
                                  </p>

                                  {member.student_id && (
                                    <p className="mt-1 text-xs text-slate-400">
                                      Student ID:{" "}
                                      {member.student_id}
                                    </p>
                                  )}

                                  {isLeader && (
                                    <span className="mt-2 inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
                                      👑 Group Leader
                                    </span>
                                  )}
                                </div>
                              </div>

                              {isCreator &&
                                !isCurrentUser && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveMember(
                                        member.id
                                      )
                                    }
                                    disabled={actionLoading}
                                    className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    Remove
                                  </button>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                      <p className="text-sm font-medium text-slate-600">
                        No members found
                      </p>
                    </div>
                  )}
                </div>

                {/* Add Member */}
                {isCreator && (
                  <form
                    onSubmit={handleAddMember}
                    className="mt-6 border-t border-slate-200 pt-6"
                  >
                    <div className="mb-4">
                      <h4 className="font-semibold text-slate-800">
                        Add Member
                      </h4>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Add another student using their email
                        address or student ID.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <select
                        value={identifierType}
                        onChange={(e) =>
                          setIdentifierType(e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionLoading &&
                        actionType === "add"
                          ? "Adding..."
                          : "Add Member"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Permission Note */}
                {!isCreator && (
                  <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-base">🔒</span>

                      <div>
                        <p className="text-sm font-semibold text-amber-800">
                          Member access
                        </p>

                        <p className="mt-1 text-xs leading-5 text-amber-700">
                          Only the group leader can add or
                          remove members.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default GroupManagement;