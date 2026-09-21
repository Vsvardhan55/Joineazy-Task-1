
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyGroups } from "../services/groupService";
import { getAssignments } from "../services/assignmentService";
import {
  getGroupProgress,
  getMySubmission,
} from "../services/submissionService";
import ProgressBar from "../components/ProgressBar";

function StudentDashboard() {
  const { user, logout } = useAuth();

  const [groups, setGroups] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [groupProgress, setGroupProgress] = useState({});
  const [assignmentStatus, setAssignmentStatus] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [groupsResponse, assignmentsResponse] =
        await Promise.all([
          getMyGroups(),
          getAssignments(),
        ]);

      const loadedGroups = groupsResponse.groups || [];
      const loadedAssignments =
        assignmentsResponse.assignments || [];

      setGroups(loadedGroups);
      setAssignments(loadedAssignments);

      // Load group progress
      const progressEntries = await Promise.all(
        loadedGroups.map(async (group) => {
          try {
            const response = await getGroupProgress(group.id);
            const progressData = response.assignments || [];

            let totalStudents = 0;
            let totalConfirmed = 0;

            progressData.forEach((item) => {
              totalStudents += Number(
                item.total_students || 0
              );

              totalConfirmed += Number(
                item.confirmed_students || 0
              );
            });

            const progress =
              totalStudents > 0
                ? Math.round(
                    (totalConfirmed / totalStudents) * 100
                  )
                : 0;

            return [group.id, progress];
          } catch (err) {
            console.error(
              `Failed to load progress for group ${group.id}`,
              err
            );

            return [group.id, 0];
          }
        })
      );

      setGroupProgress(
        Object.fromEntries(progressEntries)
      );

      // Load current student's submission status
      const statusEntries = await Promise.all(
        loadedAssignments.map(async (assignment) => {
          if (!assignment.group_id) {
            return [assignment.id, false];
          }

          try {
            const response = await getMySubmission(
              assignment.id,
              assignment.group_id
            );

            return [
              assignment.id,
              response.submitted === true ||
                response.submission?.confirmed === true,
            ];
          } catch (err) {
            console.error(
              `Failed to load submission status for assignment ${assignment.id}`,
              err
            );

            return [assignment.id, false];
          }
        })
      );

      setAssignmentStatus(
        Object.fromEntries(statusEntries)
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getSubmissionType = (assignment) => {
    return assignment.submission_type === "INDIVIDUAL"
      ? "Individual"
      : "Group";
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-xl bg-white px-8 py-6 text-center shadow-sm">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="font-semibold text-slate-700">
            Loading dashboard...
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Fetching your groups and assignments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Joineazy
            </h1>

            <p className="text-xs text-slate-500 sm:text-sm">
              Student Portal
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.name}
              </p>

              <p className="text-xs text-slate-500">
                Student
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 sm:px-4"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Welcome */}
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-sm sm:p-8 md:flex-row md:items-center">
            <div>
              <p className="mb-2 text-sm font-medium text-blue-100">
                Student Dashboard
              </p>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Welcome, {user?.name}
              </h2>

              <p className="mt-2 max-w-xl text-sm text-blue-100 sm:text-base">
                Track your groups, assignments, deadlines and
                submission progress from one place.
              </p>
            </div>

            <Link
              to="/groups"
              className="rounded-lg bg-white px-5 py-2.5 text-center text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Manage Groups
            </Link>
          </div>
        </section>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-bold">!</span>
            <p>{error}</p>
          </div>
        )}

        {/* Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              My Groups
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {groups.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Active groups
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Assignments
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {assignments.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Assigned to your groups
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
            <p className="text-sm font-medium text-slate-500">
              Student ID
            </p>

            <p className="mt-2 truncate text-2xl font-bold text-slate-900">
              {user?.student_id || "N/A"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Your registered student account
            </p>
          </div>
        </section>

        {/* Groups */}
        <section className="mb-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                My Groups
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Groups you are currently a member of.
              </p>
            </div>

            <Link
              to="/groups"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Manage →
            </Link>
          </div>

          {groups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                👥
              </div>

              <h4 className="mt-4 font-semibold text-slate-800">
                No groups yet
              </h4>

              <p className="mt-1 text-sm text-slate-500">
                Create or join a group to start working on
                assignments.
              </p>

              <Link
                to="/groups"
                className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Manage Groups
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">
                        {group.name}
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        {group.member_count || 0} members
                      </p>
                    </div>

                    <Link
                      to="/groups"
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      View
                    </Link>
                  </div>

                  <ProgressBar
                    progress={groupProgress[group.id] || 0}
                    label="Group Progress"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Assignments */}
        <section>
          <div className="mb-5">
            <h3 className="text-xl font-bold text-slate-900">
              My Assignments
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Open an assignment to view its details and
              submission status.
            </p>
          </div>

          {assignments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                📚
              </div>

              <h4 className="mt-4 font-semibold text-slate-800">
                No assignments
              </h4>

              <p className="mt-1 text-sm text-slate-500">
                No assignments have been assigned to your
                groups yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {assignments.map((assignment) => {
                const submitted =
                  assignmentStatus[assignment.id] === true;

                const overdue = isOverdue(
                  assignment.due_date
                );

                const progress =
                  assignment.group_id &&
                  groupProgress[assignment.group_id] !==
                    undefined
                    ? groupProgress[assignment.group_id]
                    : 0;

                return (
                  <div
                    key={assignment.id}
                    className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          to={`/assignments/${assignment.id}?group_id=${assignment.group_id}`}
                          className="text-lg font-bold text-slate-900 transition hover:text-blue-600"
                        >
                          {assignment.title}
                        </Link>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                          {assignment.description ||
                            "No description provided."}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          submitted
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {submitted
                          ? "Confirmed"
                          : "Pending"}
                      </span>
                    </div>

                    {/* Badges */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {getSubmissionType(assignment)}
                      </span>

                      {assignment.group_name && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {assignment.group_name}
                        </span>
                      )}
                    </div>

                    {/* Assignment information */}
                    <div className="mt-5 rounded-lg bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-slate-600">
                          Due date
                        </span>

                        <span
                          className={`font-semibold ${
                            overdue && !submitted
                              ? "text-red-600"
                              : "text-slate-800"
                          }`}
                        >
                          {new Date(assignment.due_date).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-3 text-sm">
  <span className="font-medium text-slate-600">
    {assignment.submission_type === "INDIVIDUAL"
      ? "Submission status"
      : "Group progress"}
  </span>

  <span className="font-bold text-slate-800">
    {assignment.submission_type === "INDIVIDUAL"
      ? submitted
        ? "Confirmed"
        : "Pending"
      : ""}
  </span>
</div>

{assignment.submission_type !== "INDIVIDUAL" && (
  <div className="mt-3">
    <ProgressBar
      progress={progress}
      label=""
    />
  </div>
)}
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex flex-wrap gap-3">
                      {assignment.onedrive_link && (
                        <a
                          href={assignment.onedrive_link}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Open OneDrive
                        </a>
                      )}

                      <Link
                        to={
                            assignment.submission_type === "GROUP"
                              ? `/assignments/${assignment.id}?group_id=${assignment.group_id}`
                              : `/assignments/${assignment.id}`
                          }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        View Assignment
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default StudentDashboard;