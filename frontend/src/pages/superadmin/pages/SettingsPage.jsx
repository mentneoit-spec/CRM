import { useMemo, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import SuperAdminLayout from "../layout/SuperAdminLayout";
import { authAPI } from "../../../config/api";

function SettingsPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canSubmit = useMemo(() => {
    return Boolean(oldPassword && newPassword && confirmPassword) && !saving;
  }, [oldPassword, newPassword, confirmPassword, saving]);

  const submit = async () => {
    setError("");
    setSuccess("");

    if (!oldPassword || !newPassword) {
      setError("Please enter your old and new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setSaving(true);
    try {
      await authAPI.changePassword({ oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password updated successfully.");
    } catch (e) {
      setError(e?.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("collegeId");
    window.location.href = "/login";
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Password and session management.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {success ? <p className="text-sm text-green-600">{success}</p> : null}

            <Input type="password" placeholder="Old password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            <Input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

            <Button type="button" className="w-full" onClick={submit} disabled={!canSubmit}>
              {saving ? "Saving…" : "Change Password"}
            </Button>

            <Button type="button" variant="outline" className="w-full" onClick={logout}>
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}

export default SettingsPage;
