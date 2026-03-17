import AccountsLayout from "../layout/AccountsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useEffect, useState } from "react";
import { authAPI } from "../../../config/api";

function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [nameDraft, setNameDraft] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await authAPI.getMyProfile();
        if (cancelled) return;
        const data = res?.data ?? null;
        setProfile(data);
        setNameDraft(data?.name || "");
        setPhoneDraft(data?.phone || "");
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    setError("");
    setSuccess("");

    if (!nameDraft.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await authAPI.updateMyProfile({ name: nameDraft.trim(), phone: phoneDraft.trim() });
      const updated = res?.data ?? null;
      setProfile((prev) => (updated ? ({ ...(prev || {}), ...updated }) : prev));
      setSuccess(res?.message || "Profile updated successfully.");

      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const user = JSON.parse(raw);
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...user,
              name: nameDraft.trim(),
              phone: phoneDraft.trim(),
            })
          );
        }
      } catch {
        // ignore
      }
    } catch (e) {
      setError(e?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const email = profile?.email || "--";
  const role = profile?.role || "--";
  const collegeName = profile?.college?.name || "--";

  return (
    <AccountsLayout title="Profile">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? <p className="text-sm text-gray-500">Loading…</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-green-600">{success}</p> : null}

          <div className="grid gap-2 md:grid-cols-2">
            <Input placeholder="Full name" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} />
            <Input placeholder="Phone" value={phoneDraft} onChange={(e) => setPhoneDraft(e.target.value)} />
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white/60 p-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-200">
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium">{email}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white/60 p-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-200">
              <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
              <p className="font-medium">{role}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white/60 p-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-200">
              <p className="text-xs text-gray-500 dark:text-gray-400">College</p>
              <p className="font-medium">{collegeName}</p>
            </div>
          </div>

          <Button type="button" className="w-full" onClick={save} disabled={saving || loading}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </AccountsLayout>
  );
}

export default ProfilePage;
