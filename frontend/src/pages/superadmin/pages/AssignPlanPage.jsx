import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useEffect, useState } from "react";
import { superAdminAPI } from "../../../config/api";
import SuperAdminLayout from "../layout/SuperAdminLayout";

function AssignPlanPage() {
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

  const handleAssign = async (college) => {
    const nextPlan = window.prompt("Assign subscription plan", college?.subscriptionPlan || "starter");
    if (nextPlan === null) return;

    try {
      setError("");
      await superAdminAPI.updateCollege(college.id, { subscriptionPlan: nextPlan });
      await load();
    } catch (e) {
      setError(e?.message || "Failed to update plan");
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">School / College Control</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Assign Plan</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Plan Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {error ? (
              <div className="text-sm text-gray-600 dark:text-gray-300">{error}</div>
            ) : null}
            {colleges.map((college) => (
              <div key={college.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-800 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{college.name}</p>
                  <p className="text-gray-500 dark:text-gray-400">Current plan: {college.subscriptionPlan || "-"}</p>
                </div>
                <Button type="button" variant="outline" onClick={() => handleAssign(college)}>Assign Plan</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}

export default AssignPlanPage;
