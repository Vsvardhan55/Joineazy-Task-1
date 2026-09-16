import { Link } from "react-router-dom";

function AssignmentCard({ assignment }) {
  const dueDate = new Date(
    assignment.due_date
  ).toLocaleString();

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

        <div>
          <h3 className="text-xl font-bold text-slate-800">
            {assignment.title}
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            {assignment.description ||
              "No description provided."}
          </p>
        </div>

        <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {assignment.group_name || "Assigned"}
        </span>

      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2">

        <div>
          <span className="font-semibold">
            Due:
          </span>{" "}
          {dueDate}
        </div>

        <div>
          <span className="font-semibold">
            Group:
          </span>{" "}
          {assignment.group_name || "—"}
        </div>

      </div>

      <div className="mt-6 flex flex-wrap gap-3">

        <a
          href={assignment.onedrive_link}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
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
  );
}

export default AssignmentCard;