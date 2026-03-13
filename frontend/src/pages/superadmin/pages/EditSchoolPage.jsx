import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { colleges } from "../../../mockData/superAdminData";
import SuperAdminLayout from "../layout/SuperAdminLayout";

function EditSchoolPage() {
  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">School / College Control</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Edit School</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select a School</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {colleges.map((college) => (
              <div key={college.id} className="rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{college.name}</p>
                    <p className="text-gray-500 dark:text-gray-400">{college.admin}</p>
                  </div>
                  <Button type="button" variant="outline">Edit</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Input placeholder="School name" />
            <Input placeholder="Admin email" />
            <Input placeholder="Plan" />
            <Input placeholder="Storage usage" />
            <div className="md:col-span-2 flex justify-end">
              <Button type="button">Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}

export default EditSchoolPage;
