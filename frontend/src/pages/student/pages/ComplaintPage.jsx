import StudentLayout from "../layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useState } from "react";
import { studentAPI } from "../../../services/api";

function ComplaintPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!title.trim() || !description.trim()) {
      window.alert("Please enter a subject and description.");
      return;
    }
    setSubmitting(true);
    try {
      await studentAPI.submitComplaint({ title: title.trim(), description: description.trim() });
      setTitle("");
      setDescription("");
      window.alert("Complaint submitted successfully.");
    } catch (e) {
      const message = e?.response?.data?.message || "Failed to submit complaint.";
      window.alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StudentLayout title="Complaints">
      <Card>
        <CardHeader>
          <CardTitle>Submit Complaint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Subject" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea
            rows={4}
            className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500"
            placeholder="Describe your issue"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button type="button" className="w-full" onClick={submit} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit"}
          </Button>
        </CardContent>
      </Card>
    </StudentLayout>
  );
}

export default ComplaintPage;
