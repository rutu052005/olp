import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, BookOpen, UserRound } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Shell, { Page, DashboardHeader } from '../../components/layout/Shell';
import Panel from '../../components/ui/Panel';
import ListItem from '../../components/ui/ListItem';
import ChartCard from '../../components/ui/ChartCard';
import Skeleton from '../../components/ui/Skeleton';
import { adminApi, enrollmentApi, certificateApi, assessmentApi } from '../../api/client';
import { assessmentAttempts as fallbackAttempts, students as fallbackStudents } from '../../sampleData';

export default function StudentProfileView() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState({ enrolled: 0, progress: 0, certificates: 0 });
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentProfile() {
      try {
        const studentId = Number(id || 1);

        // Fetch students
        const stdRes = await adminApi.students();
        const found = stdRes.data.find(s => s.id === studentId);
        setStudent(found);

        const [enrollRes, certRes, attemptRes] = await Promise.all([
          enrollmentApi.userEnrollments(studentId),
          certificateApi.list(studentId),
          assessmentApi.attempts(studentId)
        ]);

        const avgProgress = enrollRes.data.length > 0
          ? enrollRes.data.reduce((sum, e) => sum + Number(e.completion_percentage), 0) / enrollRes.data.length
          : 0;

        setStats({
          enrolled: enrollRes.data.length,
          progress: Math.round(avgProgress),
          certificates: certRes.data.length
        });

        if (attemptRes.data && attemptRes.data.length > 0) {
          setAttempts(attemptRes.data.map(aa => ({
            assessment: aa.assessment_title?.split(' ')[0] || 'Quiz',
            percentage: aa.percentage
          })));
        } else {
          setAttempts(fallbackAttempts);
        }
      } catch (err) {
        console.warn('Could not load student profile admin view:', err);
        setStudent(fallbackStudents[0]);
        setAttempts(fallbackAttempts);
      } finally {
        setLoading(false);
      }
    }
    loadStudentProfile();
  }, [id]);

  if (loading) {
    return (
      <Shell role="admin">
        <Page className="space-y-6">
          <Skeleton className="h-10 w-1/4" />
          <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        </Page>
      </Shell>
    );
  }

  return (
    <Shell role="admin">
      <Page>
        <DashboardHeader
          title={student?.name || 'Student Profile'}
          subtitle="Student profile, enrolled courses, progress, assessment results, and issued certificates."
        />
        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <Panel title="Profile">
            <ListItem icon={UserRound} title={student?.email || 'email@example.com'} meta={`Status: ${student?.status || 'Active'}`} />
            <ListItem icon={BookOpen} title={`${stats.enrolled} enrolled courses`} meta={`${stats.progress}% average progress`} />
            <ListItem icon={Award} title={`${stats.certificates} certificates`} meta="Verified certificates issued" />
          </Panel>
          <ChartCard title="Assessment results">
            <ResponsiveContainer width="99%" height={280}>
              <BarChart data={attempts}>
                <XAxis dataKey="assessment" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="percentage" fill="#7c3aed" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </Page>
    </Shell>
  );
}
