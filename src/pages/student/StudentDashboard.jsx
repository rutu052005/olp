import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, CheckCircle2, ClipboardCheck, Sparkles } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useApp } from '../../contexts/AppContext';
import Shell, { Page, DashboardHeader } from '../../components/layout/Shell';
import MetricGrid from '../../components/ui/MetricGrid';
import ChartCard from '../../components/ui/ChartCard';
import Panel from '../../components/ui/Panel';
import ListItem from '../../components/ui/ListItem';
import SectionTitle from '../../components/ui/SectionTitle';
import Timeline from '../../components/ui/Timeline';
import { CourseGrid } from '../../components/ui/CourseCard';
import Skeleton from '../../components/ui/Skeleton';
import { enrollmentApi, certificateApi, assessmentApi, courseApi } from '../../api/client';
import { activities, reports } from '../../sampleData';

export default function StudentDashboard() {
  const { currentUser } = useApp();
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    async function loadDashboardData() {
      try {
        const [enrollRes, certRes, courseRes] = await Promise.all([
          enrollmentApi.userEnrollments(currentUser.id),
          certificateApi.list(currentUser.id),
          courseApi.list()
        ]);
        setEnrollments(enrollRes.data);
        setCertificates(certRes.data);
        
        // Load assessments for first few courses
        if (enrollRes.data.length > 0) {
          const assList = [];
          for (const e of enrollRes.data.slice(0, 3)) {
            const assRes = await assessmentApi.list(e.course_id);
            if (assRes.data) assList.push(...assRes.data);
          }
          setAssessments(assList);
        }
      } catch (err) {
        console.warn('Dashboard live loading error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [currentUser]);

  if (loading) {
    return (
      <Shell role="student">
        <Page className="space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <div className="grid gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map(n => <Skeleton key={n} className="h-24 w-full" />)}
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </Page>
      </Shell>
    );
  }

  // Format metric counts
  const enrolledCount = enrollments.length;
  const completedCount = enrollments.filter(e => e.status === 'completed').length;
  const certsCount = certificates.length;

  // Re-map enrollments to course objects to pass to CourseGrid
  const enrolledCourses = enrollments.map(e => ({
    id: e.course_id,
    title: e.course_title,
    description: e.course_description,
    thumbnail_url: e.course_thumbnail,
    instructor_name: e.course_instructor,
    duration_hours: e.course_duration,
    rating: e.course_rating,
    price: 0,
    status: e.status
  }));

  return (
    <Shell role="student">
      <Page>
        <DashboardHeader
          title="Student Dashboard"
          subtitle="Track enrolled courses, upcoming assessments, certificates, and learning velocity."
        />
        <MetricGrid
          metrics={[
            ['Enrolled Courses', String(enrolledCount), BookOpen, 'bg-ocean/10 text-ocean'],
            ['Completed Courses', String(completedCount), CheckCircle2, 'bg-coral/10 text-coral'],
            ['Certificates Earned', String(certsCount), Award, 'bg-iris/10 text-iris'],
            ['Platform Streak', '14 days', Sparkles, 'bg-emerald-100 text-emerald-700'],
          ]}
        />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
          <ChartCard title="Performance summary">
            <ResponsiveContainer width="99%" height={280}>
              <LineChart data={reports.performance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#0f766e" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
          <Panel title="Upcoming assessments">
            {assessments.length > 0 ? (
              assessments.slice(0, 4).map((a) => (
                <ListItem
                  key={a.id}
                  icon={ClipboardCheck}
                  title={a.title}
                  meta={`${a.time_limit_minutes} min • Pass ${a.passing_marks}/${a.total_marks}`}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">No assessments pending for your courses.</p>
            )}
          </Panel>
        </div>
        <SectionTitle eyebrow="Continue learning" title="Your enrolled courses" />
        {enrolledCourses.length > 0 ? (
          <CourseGrid items={enrolledCourses} />
        ) : (
          <div className="card text-center py-10">
            <p className="text-slate-500">You are not enrolled in any courses yet.</p>
            <Link className="btn-primary mt-4 inline-flex" to="/courses">Browse Catalog</Link>
          </div>
        )}
        <SectionTitle eyebrow="Recent activity" title="Learning timeline" />
        <Timeline items={activities} />
      </Page>
    </Shell>
  );
}
