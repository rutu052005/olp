import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Shell, { Page, DashboardHeader } from '../../components/layout/Shell';
import DataTable from '../../components/ui/DataTable';
import Skeleton from '../../components/ui/Skeleton';
import { assessmentApi, courseApi } from '../../api/client';
import { assessments as fallbackAssessments } from '../../sampleData';

export default function ManageAssessments() {
  const [assessmentsList, setAssessmentsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssessments() {
      try {
        const coursesRes = await courseApi.list();
        const courses = coursesRes.data;
        const allAss = [];
        for (const c of courses) {
          const res = await assessmentApi.list(c.id);
          if (res.data) {
            allAss.push(...res.data.map(a => ({
              ...a,
              course: c.title
            })));
          }
        }
        if (allAss.length > 0) {
          setAssessmentsList(allAss);
        } else {
          setAssessmentsList(fallbackAssessments);
        }
      } catch (err) {
        console.warn('Could not load live assessments:', err);
        setAssessmentsList(fallbackAssessments);
      } finally {
        setLoading(false);
      }
    }
    loadAssessments();
  }, []);

  return (
    <Shell role="admin">
      <Page>
        <DashboardHeader
          title="Manage Assessments"
          subtitle="Create timed assessments, questions, options, correct answers, and passing marks."
        />
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <DataTable
            rows={assessmentsList}
            columns={['title', 'course', 'total_marks', 'passing_marks', 'time_limit_minutes']}
            actions
          />
        )}
        <Link className="btn-primary mt-6 inline-flex" to="/admin/questions/edit">
          <Plus size={17} /> Add/Edit Questions
        </Link>
      </Page>
    </Shell>
  );
}
