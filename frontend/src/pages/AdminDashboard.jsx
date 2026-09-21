import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../services/assignmentService";
import { getAllGroups } from "../services/groupService";
import { getAdminSubmissionTracking } from "../services/submissionService";

function AdminDashboard() {
  const { user, logout } = useAuth();

  const [assignments, setAssignments] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [onedriveLink, setOnedriveLink] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [groups, setGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);

  const [editingAssignment, setEditingAssignment] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [submissionType, setSubmissionType] = useState("GROUP");

  const [tracking, setTracking] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const [trackingFilter, setTrackingFilter] = useState("ALL");
  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAssignments();

      setAssignments(response.assignments || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadTracking = async () => {
  try {
    setTrackingLoading(true);

    const response = await getAdminSubmissionTracking();

    setTracking(response.tracking || []);
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Failed to load submission tracking."
    );
  } finally {
    setTrackingLoading(false);
  }
};
    const totalStudents = new Set(
  tracking.map((item) => item.student_id)
).size;

const confirmedSubmissions = tracking.filter(
  (item) => item.confirmed
).length;

const pendingSubmissions =
  tracking.length - confirmedSubmissions;

const overallProgress =
  tracking.length > 0
    ? Math.round(
        (confirmedSubmissions / tracking.length) * 100
      )
    : 0;

  useEffect(() => {
  const loadDashboard = async () => {
    await loadAssignments();
    await loadGroups();
    await loadTracking();

  };

  loadDashboard();
}, []);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Assignment title is required.");
      return;
    }

    if (!dueDate) {
      setError("Due date is required.");
      return;
    }

    if (!onedriveLink.trim()) {
      setError("OneDrive link is required.");
      return;
    }

    if (selectedGroupIds.length === 0) {
        setError("Please select at least one group.");
        return;
    }


    try {
      setCreating(true);

      await createAssignment({
        title: title.trim(),
        description: description.trim(),
        due_date: dueDate,
        onedrive_link: onedriveLink.trim(),
        group_ids: selectedGroupIds,
        submission_type: submissionType,
      });

      setSuccess("Assignment created successfully.");

      setTitle("");
      setDescription("");
      setDueDate("");
      setOnedriveLink("");
      setSelectedGroupIds([]);
      setSubmissionType("GROUP");

      await loadAssignments();
      await loadTracking();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create assignment."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (assignment) => {
  setEditingAssignment(assignment);

  setTitle(assignment.title || "");
  setDescription(assignment.description || "");

  if (assignment.due_date) {
    const date = new Date(assignment.due_date);

    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);

    setDueDate(localDate);
  } else {
    setDueDate("");
  }

  setOnedriveLink(assignment.onedrive_link || "");
  setSubmissionType(
    assignment.submission_type || "GROUP"
  );

  // Load currently assigned groups
  setSelectedGroupIds(
    (assignment.groups || []).map((group) => Number(group.id))
  );

  setError("");
  setSuccess("");
};

const handleCancelEdit = () => {
  setEditingAssignment(null);
  setTitle("");
  setDescription("");
  setDueDate("");
  setOnedriveLink("");
  setSelectedGroupIds([]);
  setSubmissionType("GROUP");
  setError("");
  setSuccess("");
};

const handleUpdateAssignment = async (e) => {
  e.preventDefault();

  setError("");
  setSuccess("");

  if (!editingAssignment) return;

  if (!title.trim()) {
    setError("Assignment title is required.");
    return;
  }

  if (!dueDate) {
    setError("Due date is required.");
    return;
  }

  if (!onedriveLink.trim()) {
    setError("OneDrive link is required.");
    return;
  }

  try {
    setUpdating(true);

    await updateAssignment(editingAssignment.id, {
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate,
      onedrive_link: onedriveLink.trim(),
      submission_type: submissionType,
      group_ids: selectedGroupIds,
    });

    setSuccess("Assignment updated successfully.");

    setEditingAssignment(null);
    setTitle("");
    setDescription("");
    setDueDate("");
    setOnedriveLink("");
    setSelectedGroupIds([]);
    setSubmissionType("GROUP");

    await loadAssignments();
    await loadTracking();
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Failed to update assignment."
    );
  } finally {
    setUpdating(false);
  }
};

  const handleDelete = async (assignmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteAssignment(assignmentId);

      setSuccess("Assignment deleted successfully.");

      await loadAssignments();
      await loadTracking();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete assignment."
      );
    }
  };

  const loadGroups = async () => {
  try {
    const response = await getAllGroups();

    setGroups(response.groups || []);
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Failed to load groups."
    );
  }
};

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
    <div>
      <h1 className="text-xl font-bold tracking-tight text-slate-900">
        Joineazy
      </h1>

      <p className="text-xs font-medium text-slate-500 sm:text-sm">
        Professor Portal
      </p>
    </div>

    <div className="flex items-center gap-3 sm:gap-4">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold text-slate-800">
          {user?.name}
        </p>

        <p className="text-xs text-slate-500">
          Administrator
        </p>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 sm:px-4"
      >
        Logout
      </button>
    </div>
  </div>
</header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Heading */}
        <div className="mb-8">
  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      <p className="text-sm font-semibold text-blue-600">
        Professor Workspace
      </p>

      <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Admin Dashboard
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
        Create assignments, assign student groups, and monitor
        submission progress from one place.
      </p>
    </div>

    <div className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
      <p className="text-xs font-medium text-slate-400">
        Current Role
      </p>

      <p className="mt-0.5 text-sm font-bold text-slate-800">
        {user?.role}
      </p>
    </div>
  </div>
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

        {/* Analytics */}
<section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

  {/* Assignments */}
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Total Assignments
        </p>

        <p className="mt-2 text-3xl font-bold text-slate-900">
          {assignments.length}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Created by you
        </p>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
        📚
      </div>
    </div>
  </div>

  {/* Students */}
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Total Students
        </p>

        <p className="mt-2 text-3xl font-bold text-slate-900">
          {totalStudents}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Students in tracked groups
        </p>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
        👥
      </div>
    </div>
  </div>

  {/* Confirmed */}
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Confirmed
        </p>

        <p className="mt-2 text-3xl font-bold text-green-600">
          {confirmedSubmissions}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Submission confirmations
        </p>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
        ✓
      </div>
    </div>
  </div>

  {/* Overall Progress */}
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Overall Progress
        </p>

        <p className="mt-2 text-3xl font-bold text-blue-600">
          {overallProgress}%
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {pendingSubmissions} pending confirmation
          {pendingSubmissions !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
        📊
      </div>
    </div>

    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-blue-600 transition-all duration-500"
        style={{ width: `${overallProgress}%` }}
      />
    </div>
  </div>

</section>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Create Assignment */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
            <h3 className="text-xl font-bold text-slate-900">
                {editingAssignment
                ? "Edit Assignment"
                : "Create Assignment"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create an assignment and assign it to groups.
            </p>

            <form
                onSubmit={
                editingAssignment
                    ? handleUpdateAssignment
                    : handleCreateAssignment
                }
                className="mt-6 space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Full Stack Development Assignment"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  rows="4"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Describe the assignment..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Due Date
                </label>

                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) =>
                    setDueDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Submission Type
                </label>

                <select
                  value={submissionType}
                  onChange={(e) => setSubmissionType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="GROUP">Group Submission</option>
                  <option value="INDIVIDUAL">Individual Submission</option>
                </select>

                <p className="mt-1 text-xs text-slate-400">
                  Group: only the group leader acknowledges.
                  Individual: each student confirms independently.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  OneDrive Link
                </label>

                <input
                  type="url"
                  value={onedriveLink}
                  onChange={(e) => setOnedriveLink(e.target.value)}
                  placeholder="https://onedrive.live.com/..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Add the OneDrive link containing the assignment resources.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Assign to Groups
                </label>

                {groups.length === 0 ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm text-slate-500">
                      No groups available.
                    </p>
                  </div>
                ) : (
    <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
      {groups.map((group) => (
        <label
          key={group.id}
          className="flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-slate-50"
        >
          <div>
            <p className="text-sm font-medium text-slate-800">
              {group.name}
            </p>

            <p className="text-xs text-slate-500">
              {group.member_count} members
            </p>
          </div>

          <input
  type="checkbox"
  checked={selectedGroupIds.includes(Number(group.id))}
  onChange={(e) => {
    const groupId = Number(group.id);

    if (e.target.checked) {
      setSelectedGroupIds((prev) =>
        prev.includes(groupId)
          ? prev
          : [...prev, groupId]
      );
    } else {
      setSelectedGroupIds((prev) =>
        prev.filter((id) => id !== groupId)
      );
    }
  }}
  className="h-4 w-4"
/>
        </label>
      ))}
    </div>
  )}

  <p className="mt-1 text-xs text-slate-400">
    Select one or more groups for this assignment.
  </p>
</div>

              <button
                type="submit"
                disabled={creating || updating}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
              {editingAssignment
                ? updating
                ? "Updating..."
                : "Update Assignment"
              : creating
                ? "Creating..."
                : "Create Assignment"}
              </button>
              {editingAssignment && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </section>

          {/* Assignment List */}
          <section className="lg:col-span-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">
                Assignments
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Manage assignments created by you.
              </p>

              {loading ? (
                <p className="mt-6 text-sm text-slate-500">
                  Loading assignments...
                </p>
              ) : assignments.length === 0 ? (
                <div className="mt-6 rounded-lg bg-slate-50 p-6 text-center">
                  <p className="text-slate-500">
                    No assignments created yet.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4">
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">
                            {assignment.title}
                          </h4>

                          <p className="mt-2 text-sm text-slate-600">
                            {assignment.description ||
                              "No description provided."}
                          </p>
                        </div>

                        <div className="mt-3">
                          {assignment.submission_type === "INDIVIDUAL" ? (
                            <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                              Individual Submission
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                              Group Submission
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(assignment)}
                                className="h-fit rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                            >
                                Edit
                            </button>

                            <button
                            onClick={() =>
                                handleDelete(assignment.id)
                            }
                            className="h-fit rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                            >
                                Delete
                            </button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">
                            Due Date
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {new Date(
                              assignment.due_date
                            ).toLocaleString()}
                          </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">
                            Assigned Groups
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {assignment.assigned_group_count ||
                              0}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        {assignment.onedrive_link ? (
                          <a
                            href={assignment.onedrive_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                          >
                            Open OneDrive →
                          </a>
                        ) : (
                          <span className="text-sm text-slate-400">
                            No OneDrive link provided
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
        <section className="mt-8">
  <div className="rounded-xl bg-white p-6 shadow-sm">
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h3 className="text-xl font-bold text-slate-900">
      Submission Tracking
    </h3>

    <p className="mt-1 text-sm text-slate-500">
      Monitor student submission confirmations by group.
    </p>
  </div>

  <select
    value={trackingFilter}
    onChange={(e) => setTrackingFilter(e.target.value)}
    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
  >
    <option value="ALL">All Statuses</option>
    <option value="CONFIRMED">Confirmed</option>
    <option value="PENDING">Pending</option>
  </select>
</div>

    {trackingLoading ? (
      <p className="text-sm text-slate-500">
        Loading submission tracking...
      </p>
    ) : tracking.length === 0 ? (
      <div className="rounded-lg bg-slate-50 p-6 text-center">
        <p className="text-slate-500">
          No submission data available yet.
        </p>
      </div>
    ) : (
      <div className="space-y-6">
        {assignments.map((assignment) => {
          const assignmentTracking = tracking.filter(
            (item) =>
              Number(item.assignment_id) ===
              Number(assignment.id)
          );

          if (assignmentTracking.length === 0) {
            return null;
          }

          const totalStudents = assignmentTracking.length;

          const confirmedStudents =
            assignmentTracking.filter(
              (item) => item.confirmed
            ).length;

          const progress =
            totalStudents > 0
              ? Math.round(
                  (confirmedStudents / totalStudents) * 100
                )
              : 0;

          return (
            <div
              key={assignment.id}
              className="rounded-xl border border-slate-200 p-5"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">
                    {assignment.title}
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    {confirmedStudents} of {totalStudents} students confirmed
                    {assignment.submission_type === "INDIVIDUAL"
                      ? " individually"
                      : " across assigned groups"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {progress}%
                  </p>

                  <p className="text-xs text-slate-500">
                    Completion
                  </p>
                </div>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-5 space-y-4">
                {[
                  ...new Map(
                    assignmentTracking.map((item) => [
                      item.group_id,
                      item,
                    ])
                  ).values(),
                ].map((groupItem) => {
                  const groupStudents =
                    assignmentTracking.filter(
                      (item) =>
                        item.group_id ===
                        groupItem.group_id
                    );

                  const groupConfirmed =
                    groupStudents.filter(
                      (item) => item.confirmed
                    ).length;

                  const groupProgress =
                    groupStudents.length > 0
                      ? Math.round(
                          (groupConfirmed /
                            groupStudents.length) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      key={groupItem.group_id}
                      className="rounded-lg bg-slate-50 p-4"
                    >
                      <div className="flex justify-between">
                        <div>
                          <h5 className="font-semibold text-slate-800">
                            {groupItem.group_name}
                          </h5>

                          <p className="text-xs text-slate-500">
                            {groupConfirmed} /{" "}
                            {groupStudents.length} confirmed
                          </p>
                        </div>

                        <span className="font-semibold text-blue-600">
                          {groupProgress}%
                        </span>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{
                            width: `${groupProgress}%`,
                          }}
                        />
                      </div>

                      <div className="mt-4 space-y-2">
                        {groupStudents
                          .filter((student) => {
                            if (trackingFilter === "ALL") {
                              return true;
                            }

                            if (trackingFilter === "CONFIRMED") {
                              return student.confirmed;
                            }

                            return !student.confirmed;
                          })
                          .map((student) => (
                          <div
                            key={student.student_id}
                            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {student.student_name}
                              </p>

                              <p className="text-xs text-slate-500">
                                {student.student_code} ·{" "}
                                {student.email}
                              </p>
                            </div>

                            {student.confirmed ? (
                              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                Confirmed
                              </span>
                            ) : (
                              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                                Pending
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
</section>
      </main>
    </div>
  );
}

export default AdminDashboard;