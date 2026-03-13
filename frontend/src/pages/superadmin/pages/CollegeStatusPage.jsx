import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { colleges } from "../../../mockData/superAdminData";
import SuperAdminLayout from "../layout/SuperAdminLayout";

function CollegeStatusPage() {
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
            {colleges.map((college) => (
              <div key={college.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-800 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{college.name}</p>
                  <p className="text-gray-500 dark:text-gray-400">Status: {college.status}</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline">Suspend</Button>
                  <Button type="button">Activate</Button>
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
