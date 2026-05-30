import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Shell, { Page, DashboardHeader } from '../../components/layout/Shell';
import ChartCard from '../../components/ui/ChartCard';
import Skeleton from '../../components/ui/Skeleton';
import { adminApi } from '../../api/client';
import { reports as fallbackReports } from '../../sampleData';

export default function ReportsPage() {
  const [data, setData] = useState(fallbackReports);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await adminApi.reports();
        if (res.data) {
          setData({
            ...fallbackReports, // keep growth/assessment pie fallbacks
            ...res.data
          });
        }
      } catch (err) {
        console.warn('Could not load reports dynamically:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  return (
    <Shell role="admin">
      <Page>
        <DashboardHeader
          title="Reports and Analytics"
          subtitle="Revenue, growth, course completion, and assessment intelligence."
        />
        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Revenue overview">
              <ResponsiveContainer width="99%" height={300}>
                <AreaChart data={data.revenue}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area dataKey="revenue" stroke="#f97316" fill="#f9731633" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Course completion">
              <ResponsiveContainer width="99%" height={300}>
                <BarChart data={data.completion}>
                  <XAxis dataKey="course" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#0f766e" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}
      </Page>
    </Shell>
  );
}
