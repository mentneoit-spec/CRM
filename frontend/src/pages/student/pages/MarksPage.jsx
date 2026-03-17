import StudentLayout from "../layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { studentAPI } from "../../../services/api";

function MarksPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await studentAPI.getMarks();
        const items = res?.data?.data?.results ?? [];

        if (!isMounted) return;
        setResults(Array.isArray(items) ? items : []);
      } catch (e) {
        if (!isMounted) return;
        setResults([]);
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
    return (results || []).slice(0, 3);
  }, [results, loading]);

  const getExamName = (r) => r?.exam?.examName || r?.exam?.name || r?.exam?.title || "Exam";
  const getGrade = (r) => r?.grade || r?.result || "--";
  const getMaxMarks = (r) => r?.subject?.maxMarks ?? r?.maxMarks ?? 100;
  const getMarks = (r) => r?.marksObtained ?? r?.marks ?? "--";

  return (
    <StudentLayout title="Marks">
      <Card>
        <CardHeader>
          <CardTitle>Marks Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950/60 dark:text-gray-400">
              Loading marks…
            </div>
          ) : rows.length ? (
            rows.map((r) => (
              <div
                key={r?.id ?? `${r?.examId ?? 'exam'}-${r?.subjectId ?? 'sub'}`}
                className="rounded-2xl border border-gray-200 bg-white/80 p-4 text-sm dark:border-gray-800 dark:bg-gray-950/60"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{getExamName(r)}</p>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                    Grade {getGrade(r)}
                  </span>
                </div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Marks: {getMarks(r)} / {getMaxMarks(r)}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950/60 dark:text-gray-400">
              No marks found.
            </div>
          )}
        </CardContent>
      </Card>
    </StudentLayout>
  );
}

export default MarksPage;
