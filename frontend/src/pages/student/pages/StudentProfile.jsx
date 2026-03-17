import StudentLayout from "../layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { studentAPI } from "../../../services/api";

function StudentProfile() {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [nameDraft, setNameDraft] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await studentAPI.getProfile();
        const profile = res?.data?.data ?? null;
        if (!isMounted) return;
        setStudent(profile);
        setNameDraft(profile?.name || "");
        setPhoneDraft(profile?.phone || "");
      } catch (e) {
        if (!isMounted) return;
        setStudent(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const name = loading ? "Loading…" : (student?.name || "Student");
  const classLabel = student?.sclass?.sclassName || "--";
  const sectionLabel = student?.section?.sectionName || "--";

  const save = async () => {
    setError("");
    setSuccess("");

    const payload = {
      name: nameDraft.trim(),
      phone: phoneDraft.trim(),
    };

    if (!payload.name) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await studentAPI.updateProfile(payload);
      const updated = res?.data?.data ?? null;
      setStudent(updated || student);
      setSuccess(res?.data?.message || "Profile updated successfully.");

      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const user = JSON.parse(raw);
          localStorage.setItem("user", JSON.stringify({ ...user, name: payload.name, phone: payload.phone }));
        }
      } catch {
        // ignore
      }
    } catch (e) {
      const message = e?.response?.data?.message || "Failed to update profile.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <StudentLayout title="Profile">
      <Card className="rounded-3xl">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-white">
            <UserRound className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Class {classLabel} | Section {sectionLabel}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-green-600">{success}</p> : null}

          <Input placeholder="Full name" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} />
          <Input placeholder="Phone" value={phoneDraft} onChange={(e) => setPhoneDraft(e.target.value)} />

          <Button type="button" className="w-full" onClick={save} disabled={saving || loading}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </StudentLayout>
  );
}

export default StudentProfile;
