import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { getAssignmentById } from "../services/assignmentService";
import {
  getMySubmission,
  confirmSubmission,
  getGroupProgress,
} from "../services/submissionService";

import ProgressBar from "../components/ProgressBar";

function AssignmentDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const groupId = searchParams.get("group_id");

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [progress, setProgress] = useState(null);

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadAssignment = async () => {
      try {
        setLoading(true);
        setError("");

        const assignmentResponse = await getAssignmentById(
          id,
          groupId
        );

        const currentAssignment =
          assignmentResponse.assignment;

        setAssignment(currentAssignment);

        const submissionResponse =
          await getMySubmission(id, groupId);

        setSubmission(
          submissionResponse.submission || null
        );

        if (
          groupId &&
          currentAssignment.submission_type === "GROUP"
        ) {
          const progressResponse =
            await getGroupProgress(groupId);

          const currentProgress =
            progressResponse.assignments?.find(
              (item) =>
                String(item.assignment_id) === String(id)
            );

          setProgress(currentProgress || null);
        } else {
          setProgress(null);
        }
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to load assignment."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAssignment();
  }, [id, groupId]);

  const handleConfirmSubmission = async () => {
    try {
      setConfirming(true);
      setError("");
      setSuccess("");

      const response = await confirmSubmission(
        id,
        groupId
      );

      setShowConfirm(false);

      setSuccess(
        response.message ||
          "Your submission has been confirmed successfully."
      );

      const submissionResponse =
        await getMySubmission(id, groupId);

      setSubmission(
        submissionResponse.submission || null
      );

      if (
        groupId &&
        assignment?.submission_type === "GROUP"
      ) {
        const progressResponse =
          await getGroupProgress(groupId);

        const currentProgress =
          progressResponse.assignments?.find(
            (item) =>
              String(item.assignment_id) === String(id)
          );

        setProgress(currentProgress || null);
      } else {
        setProgress(null);
      }
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to confirm submission."
      );

      setShowConfirm(false);
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-2xl bg-white px-8 py-7 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 font-semibold text-slate-800">
            Loading assignment...
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Preparing your assignment details
          </p>
        </div>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          <p className="font-semibold">
            Unable to load assignment
          </p>

          <p className="mt-1 text-sm">
            {error}
          </p>

          <Link
            to="/student"
            className="mt-4 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
          <p className="font-semibold text-slate-800">
            Assignment not found.
          </p>
        </div>
      </div>
    );
  }

  const alreadySubmitted =
    submission?.confirmed === true;

  const isGroupSubmission =
    assignment.submission_type === "GROUP";

  const isIndividualSubmission =
    assignment.submission_type === "INDIVIDUAL";

  const isGroupLeader =
    Number(user?.id) ===
    Number(assignment?.group_created_by);

  const dueDateObject = new Date(
    assignment.due_date
  );

  const dueDate = dueDateObject.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const isOverdue =
    dueDateObject < new Date() && !alreadySubmitted;

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Navbar */}
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/student"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
          >
            <span className="text-lg">←</span>
            Back to Dashboard
          </Link>

          <span className="hidden text-sm font-medium text-slate-400 sm:block">
            Joineazy
          </span>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">

        {/* Alerts */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-bold">!</span>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <span className="font-bold">✓</span>
            <p>{success}</p>
          </div>
        )}

        {/* Hero */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-50">
                  Assignment
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    alreadySubmitted
                      ? "bg-green-400/20 text-green-100"
                      : "bg-amber-400/20 text-amber-100"
                  }`}
                >
                  {alreadySubmitted
                    ? "✓ Submitted"
                    : "Pending Submission"}
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
                {assignment.title}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                {assignment.description ||
                  "No description provided."}
              </p>
            </div>

            <div
              className={`rounded-2xl border px-5 py-4 lg:min-w-[190px] ${
                isOverdue
                  ? "border-red-300/30 bg-red-500/20"
                  : "border-white/15 bg-white/10"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">
                {isOverdue ? "Deadline Passed" : "Due Date"}
              </p>

              <p className="mt-1 text-sm font-bold sm:text-base">
                {dueDate}
              </p>
            </div>
          </div>
        </section>

        {/* Metadata */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
                📅
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Due Date
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {dueDate}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-lg">
                {isGroupSubmission ? "👥" : "👤"}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Submission Type
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {isGroupSubmission
                    ? "Group Submission"
                    : "Individual Submission"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                🏷️
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Group
                </p>

                <p className="mt-1 truncate font-semibold text-slate-800">
                  {isGroupSubmission
                    ? assignment.group_name ||
                      `Group ${groupId || "—"}`
                    : "Not applicable"}
                </p>
              </div>
            </div>
          </div>

        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">

            {/* Resource */}
            <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl text-white shadow-sm">
                  📁
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Assignment Resource
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Open the OneDrive resource, complete your
                    assignment, and then acknowledge your
                    submission below.
                  </p>
                </div>
              </div>

              {assignment.onedrive_link ? (
                <a
                  href={assignment.onedrive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
                >
                  Open OneDrive
                  <span>↗</span>
                </a>
              ) : (
                <div className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500">
                  No OneDrive resource has been provided yet.
                </div>
              )}
            </section>

            {/* Acknowledgement */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      Submission Acknowledgement
                    </h2>

                    {alreadySubmitted && (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                        ✓ Done
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {isGroupSubmission
                      ? "The group leader acknowledges the submission for all members."
                      : "Each student must acknowledge their own submission."}
                  </p>
                </div>
              </div>

              {alreadySubmitted ? (
                <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-600 text-xl font-bold text-white shadow-sm">
                      ✓
                    </div>

                    <div>
                      <p className="font-bold text-green-800">
                        Submission acknowledged
                      </p>

                      <p className="mt-1 text-sm leading-6 text-green-700">
                        {isGroupSubmission
                          ? "Your group submission has been acknowledged by the group leader."
                          : "You have acknowledged your individual submission."}
                      </p>

                      {submission?.confirmed_at && (
                        <p className="mt-3 text-xs font-medium text-green-600">
                          Acknowledged on{" "}
                          {new Date(
                            submission.confirmed_at
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6">

                  {isGroupSubmission && isGroupLeader && (
                    <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
                      <div className="flex items-start gap-3">
                        <span className="text-xl">👑</span>

                        <div>
                          <p className="font-bold text-purple-800">
                            You are the group leader
                          </p>

                          <p className="mt-1 text-sm leading-6 text-purple-700">
                            Acknowledge the group submission once
                            the assignment has been completed.
                            This will update the status for all
                            group members.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isGroupSubmission &&
                    !isGroupLeader && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-start gap-3">
                          <span className="text-xl">🔒</span>

                          <div>
                            <p className="font-bold text-slate-800">
                              Waiting for group leader
                            </p>

                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              Only the group leader can
                              acknowledge this submission.
                              Your status will update
                              automatically after acknowledgement.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {isIndividualSubmission && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                      <div className="flex items-start gap-3">
                        <span className="text-xl">👤</span>

                        <div>
                          <p className="font-bold text-blue-800">
                            Individual submission
                          </p>

                          <p className="mt-1 text-sm leading-6 text-blue-700">
                            You are responsible for acknowledging
                            your own submission.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(!isGroupSubmission ||
                    isGroupLeader) && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirm(true)
                      }
                      disabled={
                        isGroupSubmission && !groupId
                      }
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {isGroupSubmission
                        ? "✓ Acknowledge Group Submission"
                        : "✓ Acknowledge My Submission"}
                    </button>
                  )}

                  {isGroupSubmission &&
                    !isGroupLeader && (
                      <div className="mt-5 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-600">
                        🔒 Waiting for group leader acknowledgement
                      </div>
                    )}

                  {isGroupSubmission &&
                    !groupId && (
                      <p className="mt-2 text-sm text-red-500">
                        Group information is missing.
                      </p>
                    )}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">

            {/* Progress */}
            {isGroupSubmission && progress && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Group Progress
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Submission confirmations from your
                      group members.
                    </p>
                  </div>

                  <span className="text-2xl font-bold text-blue-600">
                    {progress.progress}%
                  </span>
                </div>

                <div className="mt-5">
                  <ProgressBar
                    progress={progress.progress}
                    label={`${progress.confirmed_students} of ${progress.total_students} members confirmed`}
                  />
                </div>

                {progress.completed && (
                  <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                    <p className="text-sm font-bold text-green-700">
                      ✓ Everyone has confirmed
                    </p>

                    <p className="mt-1 text-xs text-green-600">
                      All group members have acknowledged
                      this submission.
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Submission status */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Current Status
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${
                    alreadySubmitted
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {alreadySubmitted ? "✓" : "!"}
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    {alreadySubmitted
                      ? "Acknowledged"
                      : "Pending"}
                  </p>

                  <p className="text-xs text-slate-500">
                    {alreadySubmitted
                      ? "Submission confirmed"
                      : "Awaiting acknowledgement"}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-xl">
                  ✓
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Confirm Submission
                  </h2>

                  <p className="text-xs text-slate-500">
                    Final acknowledgement
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm leading-6 text-slate-600">
                Are you sure you have completed and
                submitted this assignment on OneDrive?
              </p>

              <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
                Once confirmed, the submission status will
                be updated. For group assignments, the
                acknowledgement will apply to all group
                members.
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setShowConfirm(false)
                }
                disabled={confirming}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmSubmission}
                disabled={confirming}
                className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {confirming
                  ? "Confirming..."
                  : "Yes, Confirm"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default AssignmentDetails;