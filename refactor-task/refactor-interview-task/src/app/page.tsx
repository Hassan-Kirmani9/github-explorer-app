// @ts-nocheck
import Table from "./components/table";
import issuesData from "./constants/issues.json";
import type { Issue } from "./components/table";

export default function Home() {
  const issues = issuesData as Issue[];

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Issue Tracker
      </h1>
      <Table issues={issues} />
    </main>
  );
}