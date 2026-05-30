import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Download, PlayCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Shell, { Page } from '../../components/layout/Shell';
import Skeleton from '../../components/ui/Skeleton';
import { ModuleAccordion } from '../public/CourseDetailPage';
import { courseApi, progressApi } from '../../api/client';

function getEmbedUrl(url) {
  if (!url) return null;
  if (url.includes('youtube.com/embed/')) return url;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 12) {
    // Some watch/share links might have 12-char formats or different tokens, check standard 11 length
    return `https://www.youtube.com/embed/${match[2]}`;
  } else if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  
  return null;
}

export default function LearningPage() {
  const { courseId } = useParams();
  const { currentUser, notify } = useApp();
  const [course, setCourse] = useState(null);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  // We track active module and lesson index for layout
  const [activeModule, setActiveModule] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    async function loadLearningData() {
      try {
        const [courseRes, progRes] = await Promise.all([
          courseApi.detail(Number(courseId)),
          progressApi.getProgress(currentUser.id, Number(courseId)),
        ]);
        setCourse(courseRes.data);
        setUserProgress(progRes.data);

        // Pick first lesson as active default
        const firstMod = courseRes.data.modules?.[0];
        const firstLes = firstMod?.lessons?.[0];
        if (firstMod && firstLes) {
          setActiveModule(firstMod);
          setActiveLesson(firstLes);
        }
      } catch (err) {
        console.warn('Learning details failed to load:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLearningData();
  }, [courseId, currentUser]);

  const handleMarkComplete = async () => {
    if (!activeLesson || !activeModule || !course) return;
    setCompleting(true);
    try {
      const res = await progressApi.complete({
        course_id: course.id,
        module_id: activeModule.id,
        lesson_id: activeLesson.id,
        time_spent_minutes: activeLesson.duration_minutes || 20,
      });
      notify('Lesson marked as complete!');
      
      // Update local progress list
      const updatedProg = [...userProgress];
      const matchIdx = updatedProg.findIndex((p) => p.lesson_id === activeLesson.id);
      if (matchIdx === -1) {
        updatedProg.push({
          lesson_id: activeLesson.id,
          is_completed: true,
        });
      }
      setUserProgress(updatedProg);
    } catch (err) {
      notify(err.message || 'Failed to update progress.');
    } finally {
      setCompleting(false);
    }
  };

  const handleDownloadResource = () => {
    if (!activeLesson) return;
    
    if (activeLesson.resource_url) {
      window.open(activeLesson.resource_url, '_blank');
      notify('Opening lesson resources...');
      return;
    }

    const text = `Learning Resources for: ${activeLesson.title}\n\nHere are some helpful links, exercises, and study materials for this lesson.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resources_${activeLesson.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify('Downloading resources...');
  };

  if (loading) {
    return (
      <Shell role="student">
        <Page className="space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <Skeleton className="h-96 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </Page>
      </Shell>
    );
  }

  if (!course) {
    return (
      <Shell role="student">
        <Page className="text-center py-20">
          <h2 className="text-xl font-bold">Course details not found</h2>
          <Link className="btn-primary mt-6 inline-flex" to="/student">
            Back to Dashboard
          </Link>
        </Page>
      </Shell>
    );
  }

  // Calculate completed percentage based on real lesson counts
  const totalLessonsCount = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 1;
  const completedCount = userProgress.filter((p) => p.is_completed).length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalLessonsCount) * 100));

  const isCurrentCompleted = userProgress.some((p) => p.lesson_id === activeLesson?.id && p.is_completed);

  const embedUrl = activeLesson ? getEmbedUrl(activeLesson.video_url) : null;

  return (
    <Shell role="student">
      <Page>
        <p className="breadcrumb">Learning / {course.title}</p>
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="card h-fit lg:sticky lg:top-24">
            <h2 className="text-xl font-black">Course outline</h2>
            <div className="mt-4 space-y-4">
              {course.modules?.map((m) => (
                <div
                  key={m.id || m.title}
                  className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <h3 className="font-bold text-sm">{m.title}</h3>
                  <div className="mt-2 grid gap-1">
                    {m.lessons?.map((l) => {
                      const isCompleted = userProgress.some((p) => p.lesson_id === l.id && p.is_completed);
                      const isActive = activeLesson?.id === l.id;
                      return (
                        <button
                          key={l.id || l.title}
                          className={`flex items-center justify-between rounded-lg p-2 text-xs transition ${
                            isActive
                              ? 'bg-ocean text-white font-bold'
                              : 'bg-slate-50 hover:bg-slate-100 dark:bg-white/5'
                          }`}
                          onClick={() => {
                            setActiveModule(m);
                            setActiveLesson(l);
                          }}
                        >
                          <span className="truncate">{l.title}</span>
                          <span className="opacity-80">
                            {isCompleted ? '✓' : `${l.duration_minutes}m`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
          <div>
            <div className="relative aspect-video overflow-hidden rounded-[2rem] bg-slate-950 shadow-premium">
              {embedUrl ? (
                <iframe
                  className="h-full w-full border-0"
                  src={embedUrl}
                  title={activeLesson ? activeLesson.title : 'Lesson Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : activeLesson?.video_url ? (
                <video
                  src={activeLesson.video_url}
                  controls
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-white p-6 text-center">
                  <img
                    src={course.thumbnail_url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-25"
                  />
                  <div className="relative space-y-2">
                    <p className="text-lg font-bold">No Video Available</p>
                    <p className="text-xs opacity-80">This lesson does not contain a video presentation.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-5 card">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h1 className="text-2xl font-black">
                    {activeLesson ? activeLesson.title : 'No Lesson Selected'}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500 font-semibold">
                    Progress is saved against lessons, modules, assessments, and certificate eligibility.
                  </p>
                </div>
                <button
                  className="btn-primary"
                  onClick={handleMarkComplete}
                  disabled={completing || isCurrentCompleted || !activeLesson}
                >
                  {isCurrentCompleted ? 'Completed' : completing ? 'Saving...' : 'Mark complete'}
                </button>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div className="h-full rounded-full bg-ocean" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="mt-2 text-right text-xs font-bold text-slate-500">
                {progressPercent}% Complete ({completedCount} / {totalLessonsCount} lessons)
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <textarea
                  className="min-h-40 rounded-2xl border border-slate-200 bg-white p-4 outline-none dark:border-white/10 dark:bg-white/5"
                  placeholder="Write private notes..."
                />
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                  <h3 className="font-black">Resources</h3>
                  <button className="btn-secondary mt-4 w-full" onClick={handleDownloadResource}>
                    <Download size={17} /> {activeLesson?.resource_url?.includes('google.com') ? 'Open Drive Notes' : 'Download lesson resources'}
                  </button>
                  <Link className="btn-primary mt-3 w-full justify-center" to={`/student/assessment/${course.id}`}>
                    Start assessment
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Page>
    </Shell>
  );
}
