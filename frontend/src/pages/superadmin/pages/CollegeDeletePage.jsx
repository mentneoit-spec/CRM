import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useEffect, useState } from "react";
import { superAdminAPI } from "../../../config/api";
import SuperAdminLayout from "../layout/SuperAdminLayout";

function CollegeDeletePage() {
  const [colleges, setColleges] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const response = await superAdminAPI.getColleges({ page: 1, limit: 50 });
      if (response?.success) setColleges(response.data || []);
    } catch (e) {
      setError(e?.message || "Failed to load colleges");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleArchive = async (college) => {
    const ok = window.confirm(`Move "${college?.name}" to archive (inactive)?`);
    if (!ok) return;

    try {
      setError("");
      await superAdminAPI.updateCollege(college.id, { status: "inactive" });
      await load();
    } catch (e) {
      setError(e?.message || "Failed to archive college");
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">School / College Control</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Soft Delete</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Archived Schools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {error ? (
              <div className="text-sm text-gray-600 dark:text-gray-300">{error}</div>
            ) : null}
            {colleges.map((college) => (
              <div key={college.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-800 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{college.name}</p>
                  <p className="text-gray-500 dark:text-gray-400">Email: {college.email || "-"}</p>
                </div>
                <Button type="button" variant="outline" onClick={() => handleArchive(college)}>Move to Archive</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}

export default CollegeDeletePage;
