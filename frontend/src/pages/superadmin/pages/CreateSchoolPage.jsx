import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import SuperAdminLayout from "../layout/SuperAdminLayout";

function CreateSchoolPage() {
  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">School / College Control</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Create School</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>School Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Input placeholder="School name" />
            <Input placeholder="Admin email" />
            <Input placeholder="Subscription plan" />
            <Input placeholder="Storage limit" />
            <Input placeholder="Custom domain" />
            <Input placeholder="Contact number" />
            <div className="md:col-span-2">
              <Input placeholder="Address" />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="button">Create School</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}

export default CreateSchoolPage;
