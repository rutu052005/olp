import { useEffect, useState } from 'react';
import { Award, BookOpen, IndianRupee, ClipboardCheck, Star, TrendingUp, UserRound, UsersRound } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Shell, { Page, DashboardHeader } from '../../components/layout/Shell';
import MetricGrid from '../../components/ui/MetricGrid';
import ChartCard from '../../components/ui/ChartCard';
import Panel from '../../components/ui/Panel';
import ListItem from '../../components/ui/ListItem';
import Skeleton from '../../components/ui/Skeleton';
import { adminApi, courseApi } from '../../api/client';
import { adminStats as fallbackStats, reports, enrollments as fallbackEnrollments } from '../../sampleData';

export default function AdminDashboard() {
  const [stats, setStats] = useState(fallbackStats);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [statsRes, courseRes] = await Promise.all([
          adminApi.stats(),
          courseApi.list()
        ]);
        setStats(statsRes.data);
        setCourses(courseRes.data);
      } catch (err) {
        console.warn('Could not load live admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (loading) {
    return (
      <Shell role="admin">
        <Page className="space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <div className="grid gap-4 sm:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map(n => <Skeleton key={n} className="h-24 w-full" />)}
          </div>
          <div className="grid gap-6 xl:grid-cols-3">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </Page>
      </Shell>
    );
  }

  return (
    <Shell role="admin">
      <Page>
        <DashboardHeader
          title="Admin Dashboard"
          subtitle="Monitor platform health, course performance, enrollments, certificates, payments, and assessments."
        />
        <MetricGrid
          metrics={[
            ['Total Students', String(stats.students), UsersRound, 'bg-ocean/10 text-ocean'],
            ['Total Courses', String(stats.courses), BookOpen, 'bg-coral/10 text-coral'],
            ['Active Enrollments', String(stats.enrollments), TrendingUp, 'bg-iris/10 text-iris'],
            ['Certificates Issued', String(stats.certificates), Award, 'bg-emerald-100 text-emerald-700'],
            ['Assessments', String(stats.assessments), ClipboardCheck, 'bg-sky-100 text-sky-700'],
            ['Revenue', `₹${stats.revenue}`, IndianRupee, 'bg-amber-100 text-amber-700'],
          ]}
        />
        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <ChartCard title="Student growth">
            <ResponsiveContainer width="99%" height={280}>
              <AreaChart data={reports.growth}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area dataKey="students" stroke="#0f766e" fill="#0f766e33" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Completion rate">
            <ResponsiveContainer width="99%" height={280}>
              <BarChart data={reports.completion}>
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rate" fill="#f97316" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Assessment performance">
            <ResponsiveContainer width="99%" height={280}>
              <PieChart>
                <Pie data={reports.assessmentPie} dataKey="value" nameKey="name" outerRadius={95}>
                  {reports.assessmentPie.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel title="Recent enrollments">
            {(enrollments.length > 0 ? enrollments : fallbackEnrollments)
              .slice(0, 5)
              .map((e) => (
                <ListItem
                  key={e.id}
                  icon={UserRound}
                  title={`${e.student || 'Student'} enrolled in ${e.course || 'Course'}`}
                  meta={`${e.completion_percentage}% complete`}
                />
              ))}
          </Panel>
          <Panel title="Top-performing courses">
            {courses.slice(0, 5).map((c) => (
              <ListItem
                key={c.id}
                icon={Star}
                title={c.title}
                meta={`${c.rating} rating • ${c.duration_hours} hours`}
              />
            ))}
          </Panel>
        </div>
      </Page>
    </Shell>
  );
}
