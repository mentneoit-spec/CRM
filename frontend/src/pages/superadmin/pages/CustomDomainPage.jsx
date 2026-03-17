import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { superAdminAPI } from "../../../config/api";
import SuperAdminLayout from "../layout/SuperAdminLayout";

function CustomDomainPage() {
  const [colleges, setColleges] = useState([]);
  const [collegeId, setCollegeId] = useState("");
  const [domain, setDomain] = useState("");
  const [domains, setDomains] = useState([]);
  const [dnsInfo, setDnsInfo] = useState(null);
  const [loading, setLoading] = useState(false);
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
          if (!collegeId && list[0]?.id) setCollegeId(list[0].id);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load colleges");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCollegeName = useMemo(() => {
    return colleges.find((c) => c.id === collegeId)?.name || "";
  }, [colleges, collegeId]);

  const loadDomains = async (targetCollegeId) => {
    if (!targetCollegeId) return;
    try {
      setError("");
      const response = await superAdminAPI.listCollegeDomains(targetCollegeId);
      if (response?.success) setDomains(response.data || []);
    } catch (e) {
      setError(e?.message || "Failed to load domains");
    }
  };

  useEffect(() => {
    setDomains([]);
    setDnsInfo(null);
    if (collegeId) loadDomains(collegeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collegeId]);

  const handleRequestDomain = async () => {
    if (!collegeId || !domain.trim()) {
      setError("Please select a college and enter a domain");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setDnsInfo(null);
      const response = await superAdminAPI.createCollegeDomain(collegeId, {
        domain: domain.trim().toLowerCase(),
        isPrimary: false,
      });

      if (response?.success) {
        setDnsInfo(response.data?.dnsVerification || null);
        setDomain("");
        await loadDomains(collegeId);
      }
    } catch (e) {
      setError(e?.message || "Failed to create domain request");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (domainId, defaultToken) => {
    const token = window.prompt("Enter DNS verification token (TXT value)", defaultToken || "");
    if (!token) return;
    try {
      setError("");
      await superAdminAPI.verifyDomain(domainId, token);
      await loadDomains(collegeId);
      window.alert("Domain verified");
    } catch (e) {
      setError(e?.message || "Failed to verify domain");
    }
  };

  const handleApprove = async (domainId) => {
    try {
      setError("");
      await superAdminAPI.approveDomain(domainId);
      await loadDomains(collegeId);
      window.alert("Domain approved");
    } catch (e) {
      setError(e?.message || "Failed to approve domain");
    }
  };

  const handleDeactivate = async (domainId) => {
    if (!window.confirm("Deactivate this domain?") ) return;
    try {
      setError("");
      await superAdminAPI.deactivateDomain(domainId);
      await loadDomains(collegeId);
    } catch (e) {
      setError(e?.message || "Failed to deactivate domain");
    }
  };

  const handleSetPrimary = async (domainId) => {
    try {
      setError("");
      await superAdminAPI.setPrimaryDomain(domainId);
      await loadDomains(collegeId);
      window.alert("Primary domain updated");
    } catch (e) {
      setError(e?.message || "Failed to set primary domain");
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">School / College Control</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Custom Domain</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Domain Setup</CardTitle>
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

            <Input
              placeholder="Domain (example.edu)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />

            {dnsInfo ? (
              <div className="md:col-span-2 rounded-md border border-gray-200 bg-white/60 p-3 text-sm dark:border-gray-800 dark:bg-gray-950/40">
                <div className="font-medium text-gray-900 dark:text-gray-100">DNS Verification Required</div>
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                  Add a TXT record, then verify the domain.
                </div>
                <div className="mt-2 grid gap-1 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Type:</span> {dnsInfo.type}
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Name:</span> {dnsInfo.name}
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Value:</span> {dnsInfo.value}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="md:col-span-2 flex justify-end">
              <Button type="button" onClick={handleRequestDomain} disabled={loading}>
                {loading ? "Saving..." : "Request Domain"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Domains{selectedCollegeName ? `: ${selectedCollegeName}` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {domains.length === 0 ? (
              <div className="text-sm text-gray-600 dark:text-gray-300">No domains found.</div>
            ) : (
              domains.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white/70 p-3 text-sm dark:border-gray-800 dark:bg-gray-950/40 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-gray-900 dark:text-gray-100">{d.domain}</div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Status: {d.status} · Primary: {d.isPrimary ? "Yes" : "No"} · DNS: {d.dnsVerified ? "Verified" : "Not verified"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleVerify(d.id, d.dnsToken)}
                      disabled={d.dnsVerified}
                    >
                      Verify
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleApprove(d.id)}
                      disabled={!d.dnsVerified || d.status === "active"}
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSetPrimary(d.id)}
                      disabled={d.status !== "active" || d.isPrimary}
                    >
                      Set Primary
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDeactivate(d.id)}
                      disabled={d.status === "inactive"}
                    >
                      Deactivate
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}

export default CustomDomainPage;
