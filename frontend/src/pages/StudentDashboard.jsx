import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyGroups } from "../services/groupService";
import { getAssignments } from "../services/assignmentService";
import { getGroupProgress } from "../services/submissionService";
import ProgressBar from "../components/ProgressBar";

function StudentDashboard() {
  const { user, logout } = useAuth();

  const [groups, setGroups] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [groupProgress, setGroupProgress] = useState({});

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
      const loadedAssignments = assignmentsResponse.assignments || [];

      setGroups(loadedGroups);
      setAssignments(loadedAssignments);

      // Load progress for every group
      const progressEntries = await Promise.all(
        loadedGroups.map(async (group) => {
          try {
            const response = await getGroupProgress(group.id);

            const progressData = response.progress || [];

            // If there are multiple assignments, calculate
            // overall group progress.
            let totalStudents = 0;
            let totalConfirmed = 0;

            progressData.forEach((item) => {
              totalStudents += Number(item.total_students || 0);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-lg font-semibold text-slate-700">
          Loading dashboard...
        </div>
      </div>
    );
  }

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
              Student Portal
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
        {/* Welcome */}
        <div className="mb-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                Welcome, {user?.name}
              </h2>

              <p className="mt-2 text-slate-600">
                Manage your groups and assignments.
              </p>
            </div>

            <Link
              to="/groups"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-center font-semibold text-white hover:bg-blue-700"
            >
              Manage Groups
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              My Groups
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {groups.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Assignments
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {assignments.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Student ID
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {user?.student_id || "N/A"}
            </p>
          </div>
        </div>

        {/* Groups */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
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
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <p className="text-slate-500">
                You are not a member of any group.
              </p>

              <Link
                to="/groups"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
              >
                Create Group
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-xl bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">
                        {group.name}
                      </h4>

                      <p className="text-sm text-slate-500">
                        {group.member_count || 0} members
                      </p>
                    </div>

                    <Link
                      to="/groups"
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800"
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
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900">
              My Assignments
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Assignments assigned to your groups.
            </p>
          </div>

          {assignments.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <p className="text-slate-500">
                No assignments have been assigned to your groups.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-xl bg-white p-6 shadow-sm"
                >
                  <h4 className="text-lg font-bold text-slate-900">
                    {assignment.title}
                  </h4>

                  <p className="mt-2 text-sm text-slate-600">
                    {assignment.description}
                  </p>

                  <div className="mt-4 space-y-1 text-sm">
                    <p className="text-slate-500">
                      <span className="font-medium text-slate-700">
                        Due:
                      </span>{" "}
                      {new Date(
                        assignment.due_date
                      ).toLocaleString()}
                    </p>

                    <p className="text-slate-500">
                      <span className="font-medium text-slate-700">
                        Group:
                      </span>{" "}
                      {assignment.group_name}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href={assignment.onedrive_link}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Open OneDrive
                    </a>

                    <Link
                      to={`/assignments/${assignment.id}?group_id=${assignment.group_id}`}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      View Assignment
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default StudentDashboard;