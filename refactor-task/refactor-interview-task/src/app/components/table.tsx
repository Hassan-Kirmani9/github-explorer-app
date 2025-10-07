// @ts-nocheck
"use client";

import { useState, ChangeEvent, useMemo } from "react";

export type Issue = {
  id: string;
  name: string;
  message: string;
  status: "open" | "resolved";
  numEvents: number;
  numUsers: number;
  value: number;
};

type TableProps = {
  issues: Issue[];
};

// Extracted constants for better maintainability
const COLORS = {
  SELECTED_BG: "#eeeeee",
  DEFAULT_BG: "#ffffff",
  BLUE_DOT: "bg-blue-600",
  GRAY_DOT: "bg-gray-400",
} as const;

const Table = ({ issues }: TableProps) => {
  // Simplified state management - only track selected issue IDs
  const [selectedIssueIds, setSelectedIssueIds] = useState<Set<string>>(new Set());

  // Memoized calculations for performance
  const openIssues = useMemo(
    () => issues.filter((issue) => issue.status === "open"),
    [issues]
  );

  const totalSelected = useMemo(
    () => selectedIssueIds.size,
    [selectedIssueIds]
  );

  const allOpenSelected = useMemo(
    () => totalSelected === openIssues.length && openIssues.length > 0,
    [totalSelected, openIssues.length]
  );

  const someSelected = useMemo(
    () => totalSelected > 0 && totalSelected < openIssues.length,
    [totalSelected, openIssues.length]
  );

  // Toggle individual issue selection
  const toggleIssue = (issueId: string): void => {
    setSelectedIssueIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(issueId)) {
        updated.delete(issueId);
      } else {
        updated.add(issueId);
      }
      return updated;
    });
  };

  // Select or deselect all open issues
  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>): void => {
    if (event.target.checked) {
      // Select all open issues
      const openIssueIds = openIssues.map((issue) => issue.id);
      setSelectedIssueIds(new Set(openIssueIds));
    } else {
      // Deselect all
      setSelectedIssueIds(new Set());
    }
  };

  // Check if an issue is selected
  const isSelected = (issueId: string): boolean => selectedIssueIds.has(issueId);

  // Check if an issue is open
  const isOpen = (status: Issue["status"]): boolean => status === "open";

  return (
    <table className="w-full border-collapse shadow-lg">
      <thead>
        {/* Selection header row */}
        <tr className="border-2 border-gray-200">
          <th className="py-6 pl-6 text-left w-[48px]">
            <input
              className="w-5 h-5 cursor-pointer"
              type="checkbox"
              id="select-all-checkbox"
              checked={allOpenSelected}
              ref={(input) => {
                if (input) {
                  input.indeterminate = someSelected;
                }
              }}
              onChange={handleSelectAll}
              aria-label="Select all open issues"
            />
          </th>
          <th className="py-6 min-w-[8rem] text-left text-black">
            {totalSelected > 0
              ? `Selected ${totalSelected}`
              : "None selected"}
          </th>
          <th colSpan={2} />
        </tr>

        {/* Column headers */}
        <tr className="border-2 border-gray-200">
          <th className="py-6 pl-6" aria-label="Checkbox column" />
          <th className="py-6 text-left font-medium text-black">Name</th>
          <th className="py-6 text-left font-medium text-black">Message</th>
          <th className="py-6 text-left font-medium text-black">Status</th>
        </tr>
      </thead>

      <tbody>
        {issues.map((issue) => {
          const issueIsOpen = isOpen(issue.status);
          const issueIsSelected = isSelected(issue.id);

          // Build row classes dynamically
          const rowClasses = [
            "border-b border-gray-200",
            issueIsOpen
              ? "cursor-pointer hover:bg-blue-50 text-black"
              : "text-gray-600 cursor-not-allowed",
            issueIsSelected ? "bg-blue-50" : "",
          ].join(" ");

          return (
            <tr
              className={rowClasses}
              key={issue.id}
              onClick={issueIsOpen ? () => toggleIssue(issue.id) : undefined}
            >
              {/* Checkbox cell */}
              <td className="py-6 pl-6">
                <input
                  className={`w-5 h-5 ${issueIsOpen ? "cursor-pointer" : "opacity-50"}`}
                  type="checkbox"
                  id={`checkbox-${issue.id}`}
                  checked={issueIsSelected}
                  disabled={!issueIsOpen}
                  onChange={() => toggleIssue(issue.id)}
                  onClick={(e) => e.stopPropagation()} // Prevent double-trigger from row click
                  aria-label={`Select ${issue.name}`}
                />
              </td>

              {/* Issue data cells */}
              <td className="py-6">{issue.name}</td>
              <td className="py-6">{issue.message}</td>
              <td className="py-6">
                <StatusBadge status={issue.status} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

// Extracted status badge component for reusability
const StatusBadge = ({ status }: { status: Issue["status"] }) => {
  const isOpen = status === "open";

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block w-[15px] h-[15px] rounded-full ${
          isOpen ? COLORS.BLUE_DOT : COLORS.GRAY_DOT
        }`}
        aria-hidden="true"
      />
      <span
        className={`font-medium ${
          isOpen ? "text-blue-700" : "text-gray-700"
        }`}
      >
        {isOpen ? "Open" : "Resolved"}
      </span>
    </div>
  );
};

export default Table;