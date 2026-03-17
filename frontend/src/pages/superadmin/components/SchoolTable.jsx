import { Filter, MoreHorizontal, PlusCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Input } from "../../../components/ui/input";
import EmptyState from "./EmptyState";

function SchoolTable({ colleges = [] }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const toAction = (path, collegeId) => {
    const url = collegeId ? `${path}?collegeId=${encodeURIComponent(collegeId)}` : path;
    navigate(url);
  };

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return colleges;
    }
    const q = query.toLowerCase();
    return colleges.filter((college) =>
      [
        college.name,
        college.email,
        college.subscriptionPlan,
        college.status,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }, [colleges, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search schools"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Subscription Plan</DropdownMenuItem>
              <DropdownMenuItem>Status</DropdownMenuItem>
              <DropdownMenuItem>Storage Usage</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Clear Filters</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button type="button" className="gap-2" onClick={() => navigate("/superadmin/colleges/create")}>
          <PlusCircle className="h-4 w-4" />
          Create School
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">School Name</th>
              <th className="px-4 py-3">Admin Email</th>
              <th className="px-4 py-3">Subscription Plan</th>
              <th className="px-4 py-3">Storage Usage</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700 dark:divide-gray-900 dark:text-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8">
                  <EmptyState
                    title="No schools found"
                    description="Try a different search or clear filters."
                  />
                </td>
              </tr>
            ) : (
              filtered.map((college) => (
                <tr key={college.id}>
                  <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">{college.name}</td>
                  <td className="px-4 py-4">{college.email || "-"}</td>
                  <td className="px-4 py-4">{college.subscriptionPlan || "-"}</td>
                  <td className="px-4 py-4">{`${college.storageUsed ?? 0}GB / ${college.storageLimit ?? 0}GB`}</td>
                  <td className="px-4 py-4">
                    <Badge variant={college.status === "active" ? "success" : "warning"}>{college.status}</Badge>
                  </td>
                  <td className="px-4 py-4">{college.createdAt ? new Date(college.createdAt).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toAction("/superadmin/colleges/edit", college.id)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toAction("/superadmin/colleges/status", college.id)}>Suspend</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toAction("/superadmin/colleges/status", college.id)}>Activate</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toAction("/superadmin/colleges/plan", college.id)}>Assign Plan</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toAction("/superadmin/colleges/delete", college.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{filtered.length} of {colleges.length} schools</span>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button type="button" variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>

    </div>
  );
}

export default SchoolTable;
