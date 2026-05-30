import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, CheckCircle2, ClipboardCheck, Clock3, PlayCircle, Star, UserRound } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Shell, { Page } from '../../components/layout/Shell';
import SectionTitle from '../../components/ui/SectionTitle';
import Skeleton from '../../components/ui/Skeleton';
import { courseApi, enrollmentApi } from '../../api/client';
import { testimonials } from '../../sampleData';

function Meta({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
      <span className="flex items-center gap-2 text-slate-500">
        <Icon size={16} />
        {label}
      </span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function ModuleAccordion({ module }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-black">{module.title}</h3>
          <p className="text-sm text-slate-500">{module.description}</p>
        </div>
        <span className="badge bg-ocean/10 text-ocean">{module.lessons?.length || 0} lessons</span>
      </div>
      <div className="mt-4 grid gap-2">
        {module.lessons?.map((lesson) => (
          <div
            key={lesson.title}
            className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm dark:bg-white/5"
          >
            <span className="flex items-center gap-2">
              <PlayCircle size={16} />
              {lesson.title}
            </span>
            <span>{lesson.duration_minutes}m</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Testimonial({ item }) {
  return (
    <div className="card">
      <div className="flex gap-1 text-coral">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={16} fill="currentColor" />
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">"{item.quote}"</p>
      <div className="mt-5 flex items-center gap-3">
        <img src={item.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
        <div>
          <p className="font-bold">{item.name}</p>
          <p className="text-xs text-slate-500">{item.role}</p>
        </div>
      </div>
    </div>
  );
}

function getEmbedUrl(url) {
  if (!url) return null;
  if (url.includes('youtube.com/embed/')) return url;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
  }
  
  return null;
}

export { ModuleAccordion };

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, notify } = useApp();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [playPromo, setPlayPromo] = useState(false);

  useEffect(() => {
    async function loadCourseDetail() {
      try {
        const res = await courseApi.detail(Number(id));
        setCourse(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load course details.');
      } finally {
        setLoading(false);
      }
    }
    loadCourseDetail();
  }, [id]);

  const handleEnroll = async () => {
    if (!currentUser) {
      notify('Authentication required: please login first.');
      navigate('/login');
      return;
    }
    setEnrolling(true);
    try {
      await enrollmentApi.enroll({ course_id: course.id });
      notify('Enrolled successfully! Redirecting to classroom...');
      navigate(`/student/learn/${course.id}`);
    } catch (err) {
      if (err.message?.includes('already enrolled')) {
        notify('Already enrolled. Redirecting to classroom...');
        navigate(`/student/learn/${course.id}`);
      } else {
        notify(err.message || 'Failed to enroll.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <Shell>
        <Page className="space-y-6">
          <Skeleton className="h-10 w-1/4" />
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </Page>
      </Shell>
    );
  }

  if (error || !course) {
    return (
      <Shell>
        <Page className="text-center py-20">
          <h2 className="text-2xl font-black text-red-600">Error</h2>
          <p className="mt-2 text-slate-500">{error || 'Course not found'}</p>
          <Link className="btn-primary mt-6 inline-flex" to="/courses">
            Back to Courses
          </Link>
        </Page>
      </Shell>
    );
  }

  const firstModule = course.modules?.[0];
  const firstLesson = firstModule?.lessons?.[0];
  const promoVideoUrl = firstLesson?.video_url;
  const embedUrl = getEmbedUrl(promoVideoUrl);

  return (
    <Shell>
      <Page>
        <p className="breadcrumb">Courses / {course.category}</p>
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="relative aspect-video overflow-hidden rounded-[2rem] bg-slate-950 shadow-premium">
              {playPromo && embedUrl ? (
                <iframe
                  className="h-full w-full border-0"
                  src={embedUrl}
                  title="Course Promo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="group relative h-full w-full cursor-pointer" onClick={() => setPlayPromo(true)}>
                  <img src={course.thumbnail_url} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-slate-950/20 transition group-hover:bg-slate-950/40" />
                  {embedUrl && (
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="grid h-20 w-20 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition group-hover:scale-110">
                        <PlayCircle size={42} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <h1 className="mt-7 text-4xl font-black tracking-tight">{course.title}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">{course.description}</p>

            {course.outcomes && course.outcomes.length > 0 && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {course.outcomes.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-white/5"
                  >
                    <CheckCircle2 className="text-ocean" size={20} />
                    <span className="text-sm font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            )}

            <SectionTitle eyebrow="Curriculum" title="Modules and lessons" />
            <div className="space-y-3">
              {course.modules && course.modules.length > 0 ? (
                course.modules.map((module) => <ModuleAccordion key={module.id || module.title} module={module} />)
              ) : (
                <p className="text-sm text-slate-500">No lessons structured for this course yet.</p>
              )}
            </div>

            <SectionTitle eyebrow="Reviews" title="Learners love the guided structure" />
            <div className="grid gap-4 md:grid-cols-2">
              {testimonials.slice(0, 2).map((item) => (
                <Testimonial key={item.name} item={item} />
              ))}
            </div>
          </div>
          <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-premium dark:border-white/10 dark:bg-white/5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <p className="text-3xl font-black">₹{course.price}</p>
              <span className="badge bg-coral/10 text-coral">{course.difficulty}</span>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <Meta icon={UserRound} label="Instructor" value={course.instructor_name} />
              <Meta icon={Clock3} label="Duration" value={`${course.duration_hours} hours`} />
              <Meta icon={Star} label="Rating" value={`${course.rating} / 5`} />
              <Meta icon={BookOpen} label="Language" value={course.language} />
              <Meta icon={ClipboardCheck} label="Assessment" value="Timed MCQ quiz included" />
            </div>
            <button
              className="btn-primary mt-6 w-full justify-center"
              onClick={handleEnroll}
              disabled={enrolling}
            >
              {enrolling ? 'Enrolling...' : 'Enroll in course'}
            </button>
            {currentUser && (
              <Link className="btn-secondary mt-3 w-full justify-center" to={`/student/learn/${course.id}`}>
                Continue Learning
              </Link>
            )}
          </aside>
        </div>
      </Page>
    </Shell>
  );
}
