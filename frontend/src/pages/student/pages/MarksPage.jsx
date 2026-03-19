import StudentLayout from "../layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { studentAPI } from "../../../services/api";

function MarksPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await studentAPI.getMarks();
        const items = res?.data?.data?.results ?? [];
        const s = res?.data?.data?.summary ?? null;

        if (!isMounted) return;
        setResults(Array.isArray(items) ? items : []);
        setSummary(s && typeof s === 'object' ? s : null);
      } catch (e) {
        if (!isMounted) return;
        setResults([]);
        setSummary(null);
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
    return Array.isArray(results) ? results : [];
  }, [results, loading]);

  const getExamName = (r) => r?.exam?.examName || r?.exam?.name || r?.exam?.title || "Exam";
  const getSubjectName = (r) => r?.subject?.subjectName || r?.subject?.name || r?.subject?.title || "Subject";
  const getGrade = (r) => r?.grade || r?.result || "--";
  const getMaxMarks = (r) => r?.subject?.maxMarks ?? r?.maxMarks ?? 100;
  const getMarks = (r) => r?.marksObtained ?? r?.marks ?? "--";
  const getPercentage = (r) => {
    const pct = r?.percentage;
    if (pct === null || pct === undefined || pct === '') return '--';
    const n = Number(pct);
    if (!Number.isFinite(n)) return String(pct);
    return `${n.toFixed(2)}%`;
  };

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
            <>
              {summary ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 text-sm dark:border-gray-800 dark:bg-gray-950/60">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Subjects</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{summary.subjects ?? '--'}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 text-sm dark:border-gray-800 dark:bg-gray-950/60">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Marks Obtained</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{summary.marksObtained ?? '--'} / {summary.totalMarks ?? '--'}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 text-sm dark:border-gray-800 dark:bg-gray-950/60">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Overall Percentage</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{Number.isFinite(Number(summary.percentage)) ? `${Number(summary.percentage).toFixed(2)}%` : (summary.percentage ?? '--')}</p>
                  </div>
                </div>
              ) : null}

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white/80 dark:border-gray-800 dark:bg-gray-950/60">
                <div className="grid grid-cols-12 gap-2 border-b border-gray-200 px-4 py-3 text-xs font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <div className="col-span-5">Exam</div>
                  <div className="col-span-4">Subject</div>
                  <div className="col-span-3 text-right">Marks</div>
                </div>

                {rows.map((r) => (
                  <div
                    key={r?.id ?? `${r?.examId ?? 'exam'}-${r?.subjectId ?? 'sub'}`}
                    className="grid grid-cols-12 gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-200"
                  >
                    <div className="col-span-5">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{getExamName(r)}</p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{getPercentage(r)}{getGrade(r) !== '--' ? ` · Grade ${getGrade(r)}` : ''}</p>
                    </div>
                    <div className="col-span-4">
                      <p className="text-gray-900 dark:text-gray-100">{getSubjectName(r)}</p>
                    </div>
                    <div className="col-span-3 text-right">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{getMarks(r)} / {getMaxMarks(r)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
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
