import { useEffect, useState } from 'react';
import { Filter, Search, Star, X, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Shell, { Page } from '../../components/layout/Shell';
import { CourseGrid } from '../../components/ui/CourseCard';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { courseApi } from '../../api/client';
import { courses as fallbackCourses } from '../../sampleData';
import { useApp } from '../../contexts/AppContext';

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

export default function CoursesPage() {
  const { notify } = useApp();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [previewCourse, setPreviewCourse] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await courseApi.list();
        setCourses(res.data);
      } catch (err) {
        console.warn('Could not load live catalog, using static fallback:', err);
        setCourses(fallbackCourses);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setPreviewCourse(null);
    };
    if (previewCourse) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewCourse]);

  const handleQuickAdd = async () => {
    setAdding(true);
    try {
      const mockTitles = [
        'React Advanced Design Patterns',
        'Next.js 15 Production Masterclass',
        'TailwindCSS Premium UI & Aesthetics',
        'Docker & Kubernetes Deployments',
        'Full-Stack GraphQL Applications',
        'Rust WebAssembly Foundations',
        'TypeScript Clean Architecture',
        'Advanced SQL & Database Normalization'
      ];
      // Pick one randomly
      const title = mockTitles[Math.floor(Math.random() * mockTitles.length)] + ` (Demo ${Math.floor(Math.random() * 900) + 100})`;
      const categories = ['Development', 'Programming', 'Cloud', 'Security', 'Computer Science'];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const instructors = ['Rohan Iyer', 'Meera Nair', 'Aditya Sharma', 'Samar Khan', 'Ananya Bose'];
      const instructor = instructors[Math.floor(Math.random() * instructors.length)];

      const payload = {
        title,
        description: `Master high-performance development in this comprehensive course. Seeded dynamically with real, working lessons and high-definition video materials.`,
        category,
        level: 'Degree',
        difficulty: 'Intermediate',
        price: 99,
        thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1100&q=80',
        instructor_name: instructor,
        duration_hours: 15,
        outcomes: ['Build scalable applications', 'Deploy to production environments', 'Master advanced clean patterns'],
        language: 'English'
      };

      const res = await courseApi.create(payload);
      notify(`Course "${res.data.title}" added successfully with 6 working lessons!`);
      
      // Refresh list
      const listRes = await courseApi.list();
      setCourses(listRes.data);
    } catch (err) {
      notify(err.message || 'Failed to add course.');
    } finally {
      setAdding(false);
    }
  };

  const filtered = courses.filter(
    (c) =>
      (filter === 'All' || c.category === filter) &&
      c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Shell>
      <Page>
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="breadcrumb">Home / Courses</p>
            <h1 className="text-4xl font-black tracking-tight">Course Catalog</h1>
            <p className="mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
              Search, filter, enroll, and continue learning from a polished course marketplace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', 'Development', 'Programming', 'Data Science', 'Computer Science', 'Mathematics', 'Cloud', 'Security'].map(
              (item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`chip ${filter === item ? 'chip-active' : ''}`}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>
        
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <Search size={18} className="text-slate-400" />
            <input
              className="w-full bg-transparent outline-none"
              placeholder="Search by course title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Filter size={18} className="text-slate-400" />
          </div>
          
          <button
            onClick={handleQuickAdd}
            disabled={adding}
            className="btn-primary justify-center gap-2 rounded-2xl h-[48px] px-6 text-sm font-bold shadow-premium transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {adding ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            <span>Quick Add Course</span>
          </button>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="card space-y-4">
                  <Skeleton className="h-44 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length ? (
            <CourseGrid items={filtered} onPreview={setPreviewCourse} />
          ) : (
            <EmptyState title="No courses found" text="Adjust filters or search another keyword." />
          )}
        </div>
      </Page>

      {/* Premium Video Preview Modal */}
      {previewCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setPreviewCourse(null)}
          />
          
          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl dark:bg-[#0c111d] flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-y-visible">
            {/* Close Button */}
            <button
              onClick={() => setPreviewCourse(null)}
              className="absolute right-4 top-4 z-20 rounded-full bg-slate-950/60 p-2 text-white/85 hover:bg-slate-950/90 hover:text-white backdrop-blur transition hover:scale-105"
              aria-label="Close Preview"
            >
              <X size={18} />
            </button>

            {/* Video Section */}
            <div className="w-full md:w-2/3 aspect-video bg-slate-950 flex items-center justify-center relative">
              {getEmbedUrl(previewCourse.promo_video_url) ? (
                <iframe
                  className="w-full h-full border-0"
                  src={getEmbedUrl(previewCourse.promo_video_url)}
                  title={`${previewCourse.title} Preview`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="p-8 text-center text-slate-400">Preview video not available.</div>
              )}
            </div>
            
            {/* Description Section */}
            <div className="w-full md:w-1/3 p-6 flex flex-col justify-between border-t border-slate-100 dark:border-white/5 md:border-t-0 md:border-l">
              <div>
                <span className="badge bg-ocean/10 text-ocean mb-3 inline-block">{previewCourse.category}</span>
                <h2 className="text-xl font-black leading-tight mb-2 pr-6">{previewCourse.title}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1 text-coral"><Star size={14} fill="currentColor" /> {previewCourse.rating}</span>
                  <span>•</span>
                  <span>{previewCourse.level}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 line-clamp-5 md:line-clamp-4">
                  {previewCourse.description}
                </p>
                
                {previewCourse.outcomes && previewCourse.outcomes.length > 0 && (
                  <div className="hidden lg:block mb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">What you'll learn</p>
                    <ul className="text-xs space-y-1 text-slate-500">
                      {previewCourse.outcomes.slice(0, 2).map((item) => (
                        <li key={item} className="flex items-start gap-1">
                          <span className="text-ocean">✓</span>
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="mt-4 md:mt-0">
                <div className="flex items-center justify-between mb-4 border-t border-slate-100 dark:border-white/5 pt-4">
                  <span className="text-2xl font-black">₹{previewCourse.price}</span>
                  <span className="text-xs text-slate-400">Duration: {previewCourse.duration_hours}h</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewCourse(null)}
                    className="btn-secondary flex-1 justify-center py-2.5 text-sm"
                  >
                    Close
                  </button>
                  <Link
                    to={`/courses/${previewCourse.id}`}
                    className="btn-primary flex-1 justify-center py-2.5 text-sm text-center"
                    onClick={() => setPreviewCourse(null)}
                  >
                    Enroll Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
