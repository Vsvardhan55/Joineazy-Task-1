import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { getAssignmentById } from "../services/assignmentService";
import {
  getMySubmission,
  confirmSubmission,
  getGroupProgress,
} from "../services/submissionService";

import ProgressBar from "../components/ProgressBar";

function AssignmentDetails() {
  const { id } = useParams();
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

        const assignmentResponse =
          await getAssignmentById(id);

        setAssignment(
          assignmentResponse.assignment
        );

        if (groupId) {
          const submissionResponse =
            await getMySubmission(id, groupId);

          setSubmission(
            submissionResponse.submission
          );

          const progressResponse =
            await getGroupProgress(groupId);

          const currentProgress =
            progressResponse.assignments?.find(
              (item) =>
                String(item.assignment_id) === String(id)
            );

          setProgress(currentProgress || null);
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

      setSubmission(response.submission);

      setShowConfirm(false);

      setSuccess(
        "Your submission has been confirmed successfully."
      );

      // Refresh progress
      const progressResponse =
        await getGroupProgress(groupId);

      const currentProgress =
        progressResponse.assignments?.find(
          (item) =>
            String(item.assignment_id) === String(id)
        );

      setProgress(currentProgress || null);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600">
          Loading assignment...
        </p>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-3xl rounded-xl bg-red-50 p-6 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-6">
          Assignment not found.
        </div>
      </div>
    );
  }

  const dueDate = new Date(
    assignment.due_date
  ).toLocaleString();

  const alreadySubmitted =
    submission?.confirmed === true;

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Navbar */}
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4">

          <Link
            to="/student"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Dashboard
          </Link>

        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-8">

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Assignment */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

            <div>
              <p className="text-sm font-semibold text-blue-600">
                Assignment
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-800">
                {assignment.title}
              </h1>
            </div>

            {alreadySubmitted ? (
              <span className="w-fit rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                ✓ Submitted
              </span>
            ) : (
              <span className="w-fit rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">
                Pending Submission
              </span>
            )}

          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-800">
              Description
            </h2>

            <p className="mt-2 whitespace-pre-line text-slate-600">
              {assignment.description ||
                "No description provided."}
            </p>
          </div>

          {/* Details */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Due Date
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {dueDate}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Group
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {assignment.group_name ||
                  `Group ${groupId || "—"}`}
              </p>
            </div>

          </div>

          {/* OneDrive */}
          <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-5">

            <h2 className="font-semibold text-slate-800">
              Assignment Submission
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Open the OneDrive link and complete your
              assignment before confirming submission.
            </p>

            <a
              href={assignment.onedrive_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Open OneDrive ↗
            </a>

          </div>

          {/* Confirmation */}
          <div className="mt-8 border-t pt-8">

            <h2 className="text-lg font-semibold text-slate-800">
              Submission Confirmation
            </h2>

            {alreadySubmitted ? (
              <div className="mt-4 rounded-xl bg-green-50 p-5">

                <p className="font-semibold text-green-700">
                  Submission confirmed
                </p>

                <p className="mt-1 text-sm text-green-600">
                  You confirmed this assignment as
                  submitted.
                </p>

                {submission?.confirmed_at && (
                  <p className="mt-2 text-xs text-green-600">
                    Confirmed on{" "}
                    {new Date(
                      submission.confirmed_at
                    ).toLocaleString()}
                  </p>
                )}

              </div>
            ) : (
              <div className="mt-4">

                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={!groupId}
                  className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Yes, I have submitted
                </button>

                {!groupId && (
                  <p className="mt-2 text-sm text-red-500">
                    Group information is missing.
                  </p>
                )}

              </div>
            )}

          </div>

        </div>

        {/* Group Progress */}
        {progress && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-slate-800">
              Group Progress
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Submission confirmations from your group
              members.
            </p>

            <div className="mt-6">
              <ProgressBar
                progress={progress.progress}
                label={`${progress.confirmed_students} of ${progress.total_students} members confirmed`}
              />
            </div>

            {progress.completed && (
              <div className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                ✓ Everyone in the group has confirmed
                submission.
              </div>
            )}

          </div>
        )}

      </main>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <h2 className="text-xl font-bold text-slate-800">
              Confirm Submission
            </h2>

            <p className="mt-3 text-slate-600">
              Are you sure you have completed and
              submitted this assignment on OneDrive?
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() => setShowConfirm(false)}
                disabled={confirming}
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmSubmission}
                disabled={confirming}
                className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
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