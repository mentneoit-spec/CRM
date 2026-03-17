import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { superAdminAPI } from "../../../config/api";
import SuperAdminLayout from "../layout/SuperAdminLayout";

function WhiteLabelPage() {
  const [colleges, setColleges] = useState([]);
  const [collegeId, setCollegeId] = useState("");
  const [theme, setTheme] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
          if (list[0]?.id) {
            setCollegeId(list[0].id);
            setTheme(list[0].theme || "");
          }
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load colleges");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCollegeChange = (nextId) => {
    setCollegeId(nextId);
    const next = colleges.find((c) => c.id === nextId);
    setTheme(next?.theme || "");
  };

  const handleSave = async () => {
    if (!collegeId) {
      setError("Please select a college");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await superAdminAPI.updateCollege(collegeId, {
        theme: theme || undefined,
      });
      window.alert("Branding saved");
    } catch (e) {
      setError(e?.message || "Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">School / College Control</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">White Label</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
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
                onChange={(e) => handleCollegeChange(e.target.value)}
              >
                <option value="">Choose a college</option>
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              placeholder="Theme (e.g. blue)"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            />

            <div className="md:col-span-2 flex justify-end">
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Branding"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}

export default WhiteLabelPage;
