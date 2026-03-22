import StudentLayout from "../layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { studentAPI, uploadAPI } from "../../../services/api";
import { updateUser as updateAuthUser } from "../../../redux/slices/authSlice";

const BOARD_OPTIONS = [
  { value: "STATE", label: "STATE BOARD" },
  { value: "CBSE", label: "CBSE" },
  { value: "IGCSE", label: "IGCSE" },
  { value: "IB", label: "IB" },
];

const GROUP_OPTIONS = [
  { value: "BIPC", label: "BIPC" },
  { value: "MPC", label: "MPC" },
  { value: "CEC", label: "CEC" },
  { value: "MEC", label: "MEC" },
];

const FOUNDATION_COURSES = [
  "IIT FOUNDATION",
  "NEET FOUNDATION",
  "IIT-NEET FOUNDATION",
  "ROBOTICS",
  "AIML",
  "ABACUS MATHS",
  "VEDIC MATHS",
];

const GROUP_COURSES = {
  BIPC: ["NEET", "EAMCET", "ICAR", "AIIMS"],
  MPC: ["JEE MAINS", "JEE ADVANCE", "EAMCET"],
  CEC: ["CLAT", "CACPT"],
  MEC: ["CLAT", "CACPT"],
};

const ALL_KNOWN_COURSES = Array.from(
  new Set([
    ...FOUNDATION_COURSES,
    ...Object.values(GROUP_COURSES).flat(),
  ])
);

function StudentProfile() {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [nameDraft, setNameDraft] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");
  const [profileImageDraft, setProfileImageDraft] = useState("");
  const [boardDraft, setBoardDraft] = useState("");
  const [groupDraft, setGroupDraft] = useState("");
  const [integratedCourseDraft, setIntegratedCourseDraft] = useState("");
  const [customIntegratedCourseDraft, setCustomIntegratedCourseDraft] = useState("");
  const [rollNumDraft, setRollNumDraft] = useState("");
  const [dateOfBirthDraft, setDateOfBirthDraft] = useState("");
  const [genderDraft, setGenderDraft] = useState("");
  const [classDraft, setClassDraft] = useState("");
  const [sectionDraft, setSectionDraft] = useState("");
  const [customClassName, setCustomClassName] = useState("");
  const [customSectionName, setCustomSectionName] = useState("");
  const [useCustomClass, setUseCustomClass] = useState(false);
  const [useCustomSection, setUseCustomSection] = useState(false);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const integratedCourseOptions = [
    ...FOUNDATION_COURSES,
    ...(groupDraft && GROUP_COURSES[groupDraft] ? GROUP_COURSES[groupDraft] : []),
  ];

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const [profileRes, classesRes, sectionsRes] = await Promise.all([
          studentAPI.getProfile(),
          studentAPI.getClasses?.() || Promise.resolve({ data: { data: [] } }),
          studentAPI.getSections?.() || Promise.resolve({ data: { data: [] } }),
        ]);

        if (!isMounted) return;

        const profile = profileRes?.data?.data ?? null;
        setStudent(profile);
        setNameDraft(profile?.name || "");
        setPhoneDraft(profile?.phone || "");
        setProfileImageDraft(profile?.profileImage || "");
        setBoardDraft(profile?.board || "");
        setGroupDraft(profile?.group || "");
        setRollNumDraft(profile?.rollNum || "");
        setGenderDraft(profile?.gender || "");
        setClassDraft(profile?.sclassId || "");
        setSectionDraft(profile?.sectionId || "");
        setCustomClassName(profile?.customClassName || "");
        setCustomSectionName(profile?.customSectionName || "");
        setUseCustomClass(!!profile?.customClassName);
        setUseCustomSection(!!profile?.customSectionName);
        
        // Format date for input field (YYYY-MM-DD)
        if (profile?.dateOfBirth) {
          const date = new Date(profile.dateOfBirth);
          const formatted = date.toISOString().split('T')[0];
          setDateOfBirthDraft(formatted);
        }

        // Set classes and sections
        const classesData = classesRes?.data?.data ?? [];
        const sectionsData = sectionsRes?.data?.data ?? [];
        setClasses(classesData);
        setSections(sectionsData);

        const existingCourse = profile?.integratedCourse || "";
        if (existingCourse && !ALL_KNOWN_COURSES.includes(existingCourse)) {
          setIntegratedCourseDraft("__custom__");
          setCustomIntegratedCourseDraft(existingCourse);
        } else {
          setIntegratedCourseDraft(existingCourse);
          setCustomIntegratedCourseDraft("");
        }
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

  const resolvedIntegratedCourse =
    integratedCourseDraft === "__custom__" ? customIntegratedCourseDraft.trim() : integratedCourseDraft;

  const save = async () => {
    setError("");
    setSuccess("");

    const payload = {
      name: nameDraft.trim(),
      phone: phoneDraft.trim(),
      profileImage: profileImageDraft,
      board: boardDraft || undefined,
      group: groupDraft || undefined,
      integratedCourse: resolvedIntegratedCourse || undefined,
      rollNum: rollNumDraft.trim() || undefined,
      dateOfBirth: dateOfBirthDraft || undefined,
      gender: genderDraft || undefined,
      sclassId: useCustomClass ? undefined : (classDraft || undefined),
      sectionId: useCustomSection ? undefined : (sectionDraft || undefined),
      customClassName: useCustomClass ? customClassName.trim() : undefined,
      customSectionName: useCustomSection ? customSectionName.trim() : undefined,
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

      dispatch(updateAuthUser({ name: payload.name, phone: payload.phone, profileImage: payload.profileImage }));

      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const user = JSON.parse(raw);
          localStorage.setItem(
            "user",
            JSON.stringify({ ...user, name: payload.name, phone: payload.phone, profileImage: payload.profileImage })
          );
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
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-white">
            {profileImageDraft ? (
              <img
                src={profileImageDraft}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound className="h-10 w-10" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{name}</h2>
            <div className="mt-1 grid grid-cols-2 gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="rounded-lg border border-gray-200 px-3 py-1 dark:border-gray-800">
                Class: <span className="font-medium text-gray-800 dark:text-gray-200">{classLabel}</span>
              </div>
              <div className="rounded-lg border border-gray-200 px-3 py-1 dark:border-gray-800">
                Section: <span className="font-medium text-gray-800 dark:text-gray-200">{sectionLabel}</span>
              </div>
            </div>
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

          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              disabled={uploading || saving || loading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setError("");
                setSuccess("");
                setUploading(true);
                try {
                  const res = await uploadAPI.uploadProfile(file);
                  const url = res?.data?.data?.url || null;
                  if (!url) throw new Error('Upload succeeded but no URL returned');
                  setProfileImageDraft(url);
                  setSuccess('Profile photo uploaded. Click “Save Changes” to apply.');
                } catch (err) {
                  const message = err?.response?.data?.message || err?.message || 'Failed to upload photo.';
                  setError(message);
                } finally {
                  setUploading(false);
                  try { e.target.value = ''; } catch { /* ignore */ }
                }
              }}
            />
            <Input
              placeholder="Profile image URL"
              value={profileImageDraft}
              onChange={(e) => setProfileImageDraft(e.target.value)}
              disabled={uploading || saving || loading}
            />
          </div>

          <Input placeholder="Full name" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} />
          <Input placeholder="Phone" value={phoneDraft} onChange={(e) => setPhoneDraft(e.target.value)} />
          <Input placeholder="Roll Number" value={rollNumDraft} onChange={(e) => setRollNumDraft(e.target.value)} />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
            <Input
              type="date"
              value={dateOfBirthDraft}
              onChange={(e) => setDateOfBirthDraft(e.target.value)}
              disabled={uploading || saving || loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
              value={genderDraft}
              onChange={(e) => setGenderDraft(e.target.value)}
              disabled={uploading || saving || loading}
            >
              <option value="">Select gender…</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
              <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={useCustomClass}
                  onChange={(e) => {
                    setUseCustomClass(e.target.checked);
                    if (!e.target.checked) setCustomClassName("");
                  }}
                  disabled={uploading || saving || loading}
                />
                Enter manually
              </label>
            </div>
            {useCustomClass ? (
              <Input
                placeholder="Enter class name (e.g., 10A, Class 5)"
                value={customClassName}
                onChange={(e) => setCustomClassName(e.target.value)}
                disabled={uploading || saving || loading}
              />
            ) : (
              <select
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                value={classDraft}
                onChange={(e) => setClassDraft(e.target.value)}
                disabled={uploading || saving || loading}
              >
                <option value="">Select class…</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.sclassName}</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Section</label>
              <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={useCustomSection}
                  onChange={(e) => {
                    setUseCustomSection(e.target.checked);
                    if (!e.target.checked) setCustomSectionName("");
                  }}
                  disabled={uploading || saving || loading}
                />
                Enter manually
              </label>
            </div>
            {useCustomSection ? (
              <Input
                placeholder="Enter section name (e.g., A, B, Section 1)"
                value={customSectionName}
                onChange={(e) => setCustomSectionName(e.target.value)}
                disabled={uploading || saving || loading}
              />
            ) : (
              <select
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                value={sectionDraft}
                onChange={(e) => setSectionDraft(e.target.value)}
                disabled={uploading || saving || loading}
              >
                <option value="">Select section…</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>{sec.sectionName}</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Board</label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
              value={boardDraft}
              onChange={(e) => setBoardDraft(e.target.value)}
              disabled={uploading || saving || loading}
            >
              <option value="">Select board…</option>
              {BOARD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Group (11th & 12th)</label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
              value={groupDraft}
              onChange={(e) => {
                setGroupDraft(e.target.value);
              }}
              disabled={uploading || saving || loading}
            >
              <option value="">Select group…</option>
              {GROUP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Integrated Course</label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
              value={integratedCourseDraft}
              onChange={(e) => {
                const next = e.target.value;
                setIntegratedCourseDraft(next);
                if (next !== "__custom__") setCustomIntegratedCourseDraft("");
              }}
              disabled={uploading || saving || loading}
            >
              <option value="">Select course…</option>
              {integratedCourseOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="__custom__">Add new custom course…</option>
            </select>
            {integratedCourseDraft === "__custom__" ? (
              <Input
                placeholder="Enter custom course"
                value={customIntegratedCourseDraft}
                onChange={(e) => setCustomIntegratedCourseDraft(e.target.value)}
                disabled={uploading || saving || loading}
              />
            ) : null}
          </div>

          <Button type="button" className="w-full" onClick={save} disabled={saving || loading}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </StudentLayout>
  );
}

export default StudentProfile;
