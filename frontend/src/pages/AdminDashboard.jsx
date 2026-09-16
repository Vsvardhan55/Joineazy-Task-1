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

  const [tracking, setTracking] = useState([]);
const [trackingLoading, setTrackingLoading] = useState(false);

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

    console.log("Admin tracking response:", response);

    setTracking(response.tracking || []);
  } catch (err) {
    console.error("Admin tracking error:", err);

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
      });

      setSuccess("Assignment created successfully.");

      setTitle("");
      setDescription("");
      setDueDate("");
      setOnedriveLink("");
      setSelectedGroupIds([]);

      await loadAssignments();
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
      group_ids: selectedGroupIds,
    });

    setSuccess("Assignment updated successfully.");

    setEditingAssignment(null);
    setTitle("");
    setDescription("");
    setDueDate("");
    setOnedriveLink("");
    setSelectedGroupIds([]);

    await loadAssignments();
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
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Joineazy
            </h1>

            <p className="text-sm text-slate-500">
              Professor Portal
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">
              {user?.name}
            </span>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Admin Dashboard
          </h2>

          <p className="mt-2 text-slate-600">
            Create assignments and monitor group progress.
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

        {/* Stats */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Assignments
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {assignments.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Role
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {user?.role}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
  <div className="rounded-xl bg-white p-5 shadow-sm border">
    <p className="text-sm text-gray-500">
      Total Students
    </p>

    <p className="mt-2 text-3xl font-bold text-gray-900">
      {totalStudents}
    </p>

    <p className="mt-1 text-sm text-gray-500">
      Students in tracked groups
    </p>
  </div>

  <div className="rounded-xl bg-white p-5 shadow-sm border">
    <p className="text-sm text-gray-500">
      Confirmed
    </p>

    <p className="mt-2 text-3xl font-bold text-green-600">
      {confirmedSubmissions}
    </p>

    <p className="mt-1 text-sm text-gray-500">
      Submission confirmations
    </p>
  </div>

  <div className="rounded-xl bg-white p-5 shadow-sm border">
    <p className="text-sm text-gray-500">
      Pending
    </p>

    <p className="mt-2 text-3xl font-bold text-orange-600">
      {pendingSubmissions}
    </p>

    <p className="mt-1 text-sm text-gray-500">
      Awaiting confirmation
    </p>
  </div>

  <div className="rounded-xl bg-white p-5 shadow-sm border">
    <p className="text-sm text-gray-500">
      Overall Progress
    </p>

    <p className="mt-2 text-3xl font-bold text-blue-600">
      {overallProgress}%
    </p>

    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
      <div
        className="h-full rounded-full bg-blue-600 transition-all"
        style={{ width: `${overallProgress}%` }}
      />
    </div>
  </div>
</div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Create Assignment */}
          <section className="rounded-xl bg-white p-6 shadow-sm lg:col-span-1">
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  OneDrive Link
                </label>

                <input
                  type="url"
                  value={onedriveLink}
                  onChange={(e) =>
                    setOnedriveLink(e.target.value)
                  }
                  placeholder="https://onedrive.live.com/..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />
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
            checked={selectedGroupIds.includes(group.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedGroupIds((prev) => [
                  ...prev,
                  group.id,
                ]);
              } else {
                setSelectedGroupIds((prev) =>
                  prev.filter((id) => id !== group.id)
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
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
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
                    onClick={() => {
                        setEditingAssignment(null);
                        setTitle("");
                        setDescription("");
                        setDueDate("");
                        setOnedriveLink("");
                        setSelectedGroupIds([]);
                        setError("");
                        setSuccess("");
                    }}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
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
                      className="rounded-xl border border-slate-200 p-5"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row">
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">
                            {assignment.title}
                          </h4>

                          <p className="mt-2 text-sm text-slate-600">
                            {assignment.description ||
                              "No description provided."}
                          </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(assignment)}
                                className="h-fit rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100"
                            >
                                Edit
                            </button>

                            <button
                            onClick={() =>
                                handleDelete(assignment.id)
                            }
                            className="h-fit rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
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
                        <a
                          href={assignment.onedrive_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Open OneDrive →
                        </a>
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
    <div className="mb-6">
      <h3 className="text-xl font-bold text-slate-900">
        Submission Tracking
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Monitor student submission confirmations by group.
      </p>
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
                    {confirmedStudents} of {totalStudents} students
                    confirmed
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
                        {groupStudents.map((student) => (
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