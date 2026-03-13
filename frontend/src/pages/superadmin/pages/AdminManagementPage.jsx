import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import SuperAdminLayout from "../layout/SuperAdminLayout";

const adminActions = [
  { title: "Create Admin", description: "Invite a new admin to the platform." },
  { title: "Reset Password", description: "Send a reset link to a selected admin." },
  { title: "Remove Admin", description: "Deactivate or remove admin access." },
  { title: "Transfer Ownership", description: "Move ownership to a new admin." },
];

function AdminManagementPage() {
  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Admin Management</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Admins</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {adminActions.map((action) => (
            <Card key={action.title}>
              <CardHeader>
                <CardTitle>{action.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                <Button type="button" variant="outline">Open</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
}

export default AdminManagementPage;
