import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Brain, CheckCircle2, Code2, ShieldCheck, Star, TrendingUp, X } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Shell, { Page } from '../../components/layout/Shell';
import SectionTitle from '../../components/ui/SectionTitle';
import { CourseGrid } from '../../components/ui/CourseCard';
import { courseApi } from '../../api/client';
import { courses as fallbackCourses, reports, testimonials } from '../../sampleData';

function StatsStrip() {
  return (
    <div className="grid gap-4 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-premium backdrop-blur dark:border-white/10 dark:bg-white/5 sm:grid-cols-4">
      {[
        ['8', 'Premium courses'],
        ['5', 'Sample students'],
        ['92%', 'Avg. pass rate'],
        ['24/7', 'Database ready'],
      ].map(([value, label]) => (
        <div key={label} className="p-4">
          <p className="text-3xl font-black">{value}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      ))}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="card">
      <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-ocean/10 text-ocean"><Icon /></div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
    </motion.div>
  );
}

function InfoPanel({ title, text }) {
  return <div className="card"><h3 className="text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p></div>;
}

function Testimonial({ item }) {
  return (
    <div className="card">
      <div className="flex gap-1 text-coral">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}</div>
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">"{item.quote}"</p>
      <div className="mt-5 flex items-center gap-3">
        <img src={item.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
        <div><p className="font-bold">{item.name}</p><p className="text-xs text-slate-500">{item.role}</p></div>
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

export default function LandingPage() {
  const [courses, setCourses] = useState(fallbackCourses.slice(0, 4));
  const [previewCourse, setPreviewCourse] = useState(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await courseApi.list();
        if (res.data && res.data.length > 0) {
          setCourses(res.data.slice(0, 4));
        }
      } catch (err) {
        console.warn('Could not load live courses, using static sample data:', err);
      }
    }
    loadCourses();
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

  return (
    <Shell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#14b8a633,transparent_32%),radial-gradient(circle_at_80%_10%,#f9731630,transparent_28%)]" />
        <Page className="relative grid min-h-[calc(100vh-4rem)] items-center gap-10 pb-12 lg:grid-cols-[1fr_.92fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="badge bg-white/80 text-ocean ring-ocean/20 dark:bg-white/10">Premium LMS for modern institutions</span>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.03] tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
              A Web-Based Learning Platform for Courses, Assessments, Progress Tracking and Certification
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Deliver courses, measure outcomes, track every learner milestone, and issue verifiable certificates from one polished, role-based education platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn-primary" to="/courses">Explore Courses</Link>
              <Link className="btn-secondary" to="/login">Open Dashboard</Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.12 }} className="relative">
            <div className="glass-card rotate-1 p-5 shadow-glow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Live course completion</p>
                  <p className="text-3xl font-black">82.4%</p>
                </div>
                <div className="rounded-2xl bg-ocean/10 p-3 text-ocean"><TrendingUp /></div>
              </div>
              <div className="mt-5 h-56">
                <ResponsiveContainer width="99%" height="100%">
                  <AreaChart data={reports.growth}>
                    <defs>
                      <linearGradient id="growth" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#0f766e" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip />
                    <Area type="monotone" dataKey="students" stroke="#0f766e" fill="url(#growth)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {['SQL schema', 'MCQ tests', 'Certificates'].map((item) => <div key={item} className="rounded-2xl bg-slate-100 p-3 text-sm font-semibold dark:bg-white/5">{item}</div>)}
              </div>
            </div>
          </motion.div>
        </Page>
      </section>
      <Page>
        <StatsStrip />
        <SectionTitle eyebrow="Course categories" title="Everything needed for a complete academic LMS" />
        <div className="grid gap-4 md:grid-cols-4">
          {['Web Development', 'Programming', 'AI & Data', 'Security'].map((name, index) => (
            <FeatureCard key={name} icon={[Code2, Brain, BarChart3, ShieldCheck][index]} title={name} text="Structured lessons, assessments, tracking, and certification paths." />
          ))}
        </div>
        <SectionTitle eyebrow="Featured courses" title="Realistic catalog with premium course cards" />
        <CourseGrid items={courses} onPreview={setPreviewCourse} />
        <SectionTitle eyebrow="Why institutions choose it" title="Built for teachers, students, admins, and viva demonstrations" />
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            ['Role-based dashboards', 'Separate student and admin experiences with protected navigation.'],
            ['Assessment engine', 'Timed quizzes, scoring, pass/fail outcomes, explanations, and history.'],
            ['Database transparency', 'Admin-only database viewer with table rows, SQL preview, and JSON response panel.'],
          ].map(([title, text]) => <InfoPanel key={title} title={title} text={text} />)}
        </div>
        <SectionTitle eyebrow="Student voices" title="Confident outcomes, measurable progress" />
        <div className="grid gap-4 lg:grid-cols-3">
          {testimonials.map((item) => <Testimonial key={item.name} item={item} />)}
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
