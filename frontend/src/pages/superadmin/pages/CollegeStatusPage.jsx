import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useEffect, useState } from "react";
import { superAdminAPI } from "../../../config/api";
import SuperAdminLayout from "../layout/SuperAdminLayout";

function CollegeStatusPage() {
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

  const handleSuspend = async (collegeId) => {
    try {
      setError("");
      await superAdminAPI.suspendCollege(collegeId);
      await load();
    } catch (e) {
      setError(e?.message || "Failed to suspend college");
    }
  };

  const handleActivate = async (collegeId) => {
    try {
      setError("");
      await superAdminAPI.updateCollege(collegeId, { status: "active" });
      await load();
    } catch (e) {
      setError(e?.message || "Failed to activate college");
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">School / College Control</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Suspend / Activate</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Status Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {error ? (
              <div className="text-sm text-gray-600 dark:text-gray-300">{error}</div>
            ) : null}
            {colleges.map((college) => (
              <div key={college.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-800 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{college.name}</p>
                  <p className="text-gray-500 dark:text-gray-400">Status: {college.status}</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => handleSuspend(college.id)}>Suspend</Button>
                  <Button type="button" onClick={() => handleActivate(college.id)}>Activate</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}

export default CollegeStatusPage;
