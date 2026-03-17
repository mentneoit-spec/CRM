import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { useState } from "react";
import { superAdminAPI } from "../../../config/api";
import SuperAdminLayout from "../layout/SuperAdminLayout";

function CreateSchoolPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] = useState("");
  const [storageLimit, setStorageLimit] = useState("");
  const [domain, setDomain] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !domain.trim()) {
      setError("School name and domain are required");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await superAdminAPI.createCollege({
        name,
        domain,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        subscriptionPlan: subscriptionPlan || undefined,
        storageLimit: storageLimit ? Number(storageLimit) : undefined,
      });
      window.alert("School created successfully");
      setName("");
      setEmail("");
      setSubscriptionPlan("");
      setStorageLimit("");
      setDomain("");
      setPhone("");
      setAddress("");
    } catch (e) {
      setError(e?.message || "Failed to create school");
    } finally {
      setSaving(false);
    }
  };

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
            {error ? (
              <div className="md:col-span-2 text-sm text-gray-600 dark:text-gray-300">{error}</div>
            ) : null}

            <Input placeholder="School name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Subscription plan" value={subscriptionPlan} onChange={(e) => setSubscriptionPlan(e.target.value)} />
            <Input placeholder="Storage limit" value={storageLimit} onChange={(e) => setStorageLimit(e.target.value)} />
            <Input placeholder="Custom domain" value={domain} onChange={(e) => setDomain(e.target.value)} />
            <Input placeholder="Contact number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <div className="md:col-span-2">
              <Input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="button" onClick={handleCreate} disabled={saving}>
                {saving ? "Creating..." : "Create School"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}

export default CreateSchoolPage;
