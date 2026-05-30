import { useEffect, useState } from 'react';
import Shell, { Page, DashboardHeader } from '../../components/layout/Shell';
import DataTable from '../../components/ui/DataTable';
import Skeleton from '../../components/ui/Skeleton';
import { adminApi } from '../../api/client';
import { students as fallbackStudents } from '../../sampleData';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await adminApi.students();
        setStudents(res.data);
      } catch (err) {
        console.warn('Could not load live student records, using mock data:', err);
        setStudents(fallbackStudents);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  return (
    <Shell role="admin">
      <Page>
        <DashboardHeader
          title="Manage Students"
          subtitle="Search, filter, activate, deactivate, and inspect learner records."
        />
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <DataTable
            rows={students}
            columns={['name', 'email', 'status', 'enrolled', 'progress', 'certificates']}
            actions
          />
        )}
      </Page>
    </Shell>
  );
}
