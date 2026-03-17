import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { superAdminAPI } from "../../../config/api";
import SuperAdminLayout from "../layout/SuperAdminLayout";

const adminActions = [
  { title: "Create Admin", description: "Invite a new admin to the platform." },
  { title: "Reset Password", description: "Send a reset link to a selected admin." },
  { title: "Remove Admin", description: "Deactivate or remove admin access." },
  { title: "Transfer Ownership", description: "Move ownership to a new admin." },
];

function AdminManagementPage() {
  const [colleges, setColleges] = useState([]);
  const [collegeId, setCollegeId] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError("");
        const response = await superAdminAPI.getColleges({ page: 1, limit: 100 });
        if (cancelled) return;
        if (response?.success) {
          const list = response.data || [];
          setColleges(list);
          if (list[0]?.id) setCollegeId(list[0].id);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load colleges");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpen = async (title) => {
    if (working) return;

    if (title === "Create Admin") {
      if (!collegeId) {
        setError("Please select a college first");
        return;
      }

      const name = window.prompt("Admin name");
      if (!name) return;
      const email = window.prompt("Admin email");
      if (!email) return;
      const password = window.prompt("Temporary password");
      if (!password) return;
      const phone = window.prompt("Phone (optional)") || undefined;

      try {
        setWorking(true);
        setError("");
        await superAdminAPI.createAdmin({
          collegeId,
          name,
          email,
          password,
          phone,
        });
        window.alert("Admin created");
      } catch (e) {
        setError(e?.message || "Failed to create admin");
      } finally {
        setWorking(false);
      }
      return;
    }

    if (title === "Reset Password") {
      const adminId = window.prompt("Admin ID");
      if (!adminId) return;
      const newPassword = window.prompt("New password");
      if (!newPassword) return;

      try {
        setWorking(true);
        setError("");
        await superAdminAPI.resetAdminPassword(adminId, newPassword);
        window.alert("Password reset");
      } catch (e) {
        setError(e?.message || "Failed to reset password");
      } finally {
        setWorking(false);
      }
      return;
    }

    window.alert("This action is not implemented on the backend yet.");
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Admin Management</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Admins</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>College</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {error ? (
              <div className="md:col-span-2 text-sm text-gray-600 dark:text-gray-300">{error}</div>
            ) : null}

            <div className="space-y-1">
              <div className="text-xs text-gray-500 dark:text-gray-400">Select College</div>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
              >
                <option value="">Choose a college</option>
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 md:col-span-2">
              Create Admin requires a college selection. Reset Password requires an existing Admin ID.
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {adminActions.map((action) => (
            <Card key={action.title}>
              <CardHeader>
                <CardTitle>{action.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpen(action.title)}
                  disabled={working}
                >
                  {working ? "Working..." : "Open"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
}

export default AdminManagementPage;
