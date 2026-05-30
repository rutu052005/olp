import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useApp } from '../../contexts/AppContext';
import Shell, { Page, DashboardHeader } from '../../components/layout/Shell';
import ChartCard from '../../components/ui/ChartCard';
import Panel from '../../components/ui/Panel';
import Timeline from '../../components/ui/Timeline';
import Skeleton from '../../components/ui/Skeleton';
import { enrollmentApi } from '../../api/client';
import { progressEvents, reports } from '../../sampleData';

export default function ProgressPage() {
  const { currentUser } = useApp();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    async function loadProgress() {
      try {
        const res = await enrollmentApi.userEnrollments(currentUser.id);
        setEnrollments(res.data);
      } catch (err) {
        console.warn('Could not fetch progress logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, [currentUser]);

  return (
    <Shell role="student">
      <Page>
        <DashboardHeader
          title="Progress Tracking"
          subtitle="Lesson completion, module progress, scores, time spent, and certificate eligibility."
        />
        <div className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
          <div className="space-y-6">
            <ChartCard title="Time spent by week">
              <ResponsiveContainer width="99%" height={300}>
                <BarChart data={reports.timeSpent}>
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="minutes" fill="#0f766e" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <Panel title="Active Course Progress">
              {loading ? (
                <Skeleton className="h-20 w-full" />
              ) : enrollments.length > 0 ? (
                <div className="space-y-4">
                  {enrollments.map((e) => (
                    <div key={e.id} className="space-y-1">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>{e.course_title}</span>
                        <span>{Math.round(e.completion_percentage)}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-white/10">
                        <div
                          className="h-full bg-ocean rounded-full transition-all duration-500"
                          style={{ width: `${e.completion_percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No active course progress to show.</p>
              )}
            </Panel>
          </div>
          <Panel title="Learning activity">
            <Timeline items={progressEvents} />
          </Panel>
        </div>
      </Page>
    </Shell>
  );
}
