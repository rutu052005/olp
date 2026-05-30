import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Shell, { Page, DashboardHeader } from '../../components/layout/Shell';
import DataTable from '../../components/ui/DataTable';
import Skeleton from '../../components/ui/Skeleton';
import { courseApi } from '../../api/client';
import { courses as fallbackCourses } from '../../sampleData';

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await courseApi.list();
        setCourses(res.data);
      } catch (err) {
        console.warn('Could not load course list dynamically:', err);
        setCourses(fallbackCourses);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  return (
    <Shell role="admin">
      <Page>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <DashboardHeader
            title="Manage Courses"
            subtitle="Add, edit, delete, and structure modules, lessons, quizzes, pricing, and metadata."
          />
          <Link className="btn-primary" to="/admin/courses/edit">
            <Plus size={17} /> Add Course
          </Link>
        </div>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <DataTable
            rows={courses}
            columns={['title', 'category', 'level', 'difficulty', 'price', 'instructor_name', 'status']}
            actions
          />
        )}
      </Page>
    </Shell>
  );
}
