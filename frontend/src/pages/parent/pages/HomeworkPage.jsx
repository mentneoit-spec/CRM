import ParentLayout from "../layout/ParentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { parentAPI } from "../../../services/api";

function HomeworkPage() {
  const [loading, setLoading] = useState(true);
  const [homework, setHomework] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const childrenRes = await parentAPI.getChildren();
        const studentId = childrenRes?.data?.data?.[0]?.id;
        if (!studentId) {
          if (!isMounted) return;
          setHomework([]);
          return;
        }

        const hwRes = await parentAPI.getChildHomework(studentId);
        const items = hwRes?.data?.data?.homework ?? [];

        if (!isMounted) return;
        setHomework(Array.isArray(items) ? items : []);
      } catch (e) {
        if (!isMounted) return;
        setHomework([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    if (loading) return [];
    return (homework || []).slice(0, 3);
  }, [homework, loading]);

  const formatDate = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleDateString();
  };

  return (
    <ParentLayout title="Homework">
      <Card>
        <CardHeader>
          <CardTitle>Homework List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              Loading homework…
            </div>
          ) : rows.length ? (
            rows.map((h) => (
              <div
                key={h?.id ?? `${h?.title ?? 'hw'}-${h?.dueDate ?? ''}`}
                className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400"
              >
                {(h?.subject?.subjectName || h?.subject?.name || "Subject --")} | {formatDate(h?.dueDate)}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              No homework found.
            </div>
          )}
        </CardContent>
      </Card>
    </ParentLayout>
  );
}

export default HomeworkPage;
