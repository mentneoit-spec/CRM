import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import SkeletonLoader from "../components/SkeletonLoader";
import SchoolTable from "../components/SchoolTable";
import SuperAdminLayout from "../layout/SuperAdminLayout";
import { superAdminAPI } from "../../../config/api";

function CollegesList() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [colleges, setColleges] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await superAdminAPI.getColleges({ page: 1, limit: 50 });
        if (!cancelled && response?.success) setColleges(response.data || []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load colleges");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">College Control</p>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Colleges</h1>
          </div>
          <Button type="button" variant="outline" className="gap-2" onClick={() => navigate("/superadmin/security")}>
            View Audit Logs
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">School Directory</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Search, filter, and manage all colleges in one place.</p>
            </div>
            {error ? (
              <div className="text-sm text-gray-600 dark:text-gray-300">{error}</div>
            ) : null}
            {isLoading ? <SkeletonLoader /> : <SchoolTable colleges={colleges} />}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}

export default CollegesList;
