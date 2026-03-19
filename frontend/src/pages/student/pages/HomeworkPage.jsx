import StudentLayout from "../layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { studentAPI } from "../../../services/api";

function HomeworkPage() {
  const [loading, setLoading] = useState(true);
  const [homework, setHomework] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await studentAPI.getHomework();
        const items = res?.data?.data?.homework ?? [];

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
    return Array.isArray(homework) ? homework : [];
  }, [homework, loading]);

  const formatDue = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleDateString();
  };

  const subjectName = (h) => h?.subject?.subName || h?.subject?.subjectName || h?.subject?.name || "Subject --";

  const teacherName = (h) => h?.teacher?.name || h?.teacher?.fullName || "--";

  const isImageUrl = (url) => {
    const s = String(url || "").toLowerCase();
    return s.endsWith(".png") || s.endsWith(".jpg") || s.endsWith(".jpeg") || s.endsWith(".gif") || s.endsWith(".webp");
  };

  return (
    <StudentLayout title="Homework">
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
                className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300"
              >
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                    {h?.title || "Homework"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {subjectName(h)} • Teacher: {teacherName(h)} • Due {formatDue(h?.dueDate)}
                  </div>

                  {h?.description ? (
                    <div className="mt-2 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
                      {h.description}
                    </div>
                  ) : null}

                  {Array.isArray(h?.attachments) && h.attachments.length ? (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {h.attachments
                        .filter(Boolean)
                        .map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="block overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
                            title="Open attachment"
                          >
                            {isImageUrl(url) ? (
                              <img
                                src={url}
                                alt="attachment"
                                className="h-24 w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-24 w-full items-center justify-center px-2 text-center text-xs text-gray-600 dark:text-gray-300">
                                Open file
                              </div>
                            )}
                          </a>
                        ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              No homework found.
            </div>
          )}
        </CardContent>
      </Card>
    </StudentLayout>
  );
}

export default HomeworkPage;
