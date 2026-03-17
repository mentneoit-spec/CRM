import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { superAdminAPI } from "../../../config/api";
import SuperAdminLayout from "../layout/SuperAdminLayout";

function EditSchoolPage() {
  const [searchParams] = useSearchParams();
  const selectedIdFromQuery = searchParams.get("collegeId") || "";

  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] = useState("");
  const [storageLimit, setStorageLimit] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError("");
        const response = await superAdminAPI.getColleges({ page: 1, limit: 50 });
        if (cancelled) return;
        if (response?.success) setColleges(response.data || []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load colleges");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCollege = useMemo(() => {
    return colleges.find((c) => c.id === selectedCollegeId) || null;
  }, [colleges, selectedCollegeId]);

  useEffect(() => {
    if (!colleges.length) return;
    const nextId = selectedIdFromQuery || colleges[0]?.id || "";
    setSelectedCollegeId((prev) => prev || nextId);
  }, [colleges, selectedIdFromQuery]);

  useEffect(() => {
    if (!selectedCollege) return;
    setName(selectedCollege.name || "");
    setEmail(selectedCollege.email || "");
    setSubscriptionPlan(selectedCollege.subscriptionPlan || "");
    setStorageLimit(String(selectedCollege.storageLimit ?? ""));
  }, [selectedCollege]);

  const handleSave = async () => {
    if (!selectedCollegeId) {
      setError("Please select a school");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await superAdminAPI.updateCollege(selectedCollegeId, {
        name,
        email: email || undefined,
        subscriptionPlan: subscriptionPlan || undefined,
        storageLimit: storageLimit ? Number(storageLimit) : undefined,
      });
      window.alert("School updated successfully");
    } catch (e) {
      setError(e?.message || "Failed to update school");
    } finally {
      setSaving(false);
    }
  };

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
            {error ? (
              <div className="text-sm text-gray-600 dark:text-gray-300">{error}</div>
            ) : null}
            {colleges.map((college) => (
              <div key={college.id} className="rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{college.name}</p>
                    <p className="text-gray-500 dark:text-gray-400">{college.email || "-"}</p>
                  </div>
                  <Button type="button" variant={selectedCollegeId === college.id ? "default" : "outline"} onClick={() => setSelectedCollegeId(college.id)}>
                    Edit
                  </Button>
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
            <Input placeholder="School name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Plan" value={subscriptionPlan} onChange={(e) => setSubscriptionPlan(e.target.value)} />
            <Input placeholder="Storage limit" value={storageLimit} onChange={(e) => setStorageLimit(e.target.value)} />
            <div className="md:col-span-2 flex justify-end">
              <Button type="button" onClick={handleSave} disabled={saving || !selectedCollegeId}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}

export default EditSchoolPage;
