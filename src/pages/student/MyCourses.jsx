import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import Shell, { Page, DashboardHeader } from '../../components/layout/Shell';
import { CourseGrid } from '../../components/ui/CourseCard';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { enrollmentApi } from '../../api/client';

export default function MyCourses() {
  const { currentUser } = useApp();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    async function fetchMyCourses() {
      try {
        const res = await enrollmentApi.userEnrollments(currentUser.id);
        setEnrollments(res.data);
      } catch (err) {
        console.warn('Could not load user enrollments:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyCourses();
  }, [currentUser]);

  const enrolledCourses = enrollments.map((e) => ({
    id: e.course_id,
    title: e.course_title,
    description: e.course_description,
    thumbnail_url: e.course_thumbnail,
    instructor_name: e.course_instructor,
    duration_hours: e.course_duration,
    rating: e.course_rating,
    price: 0,
    status: e.status,
  }));

  return (
    <Shell role="student">
      <Page>
        <DashboardHeader
          title="My Courses"
          subtitle="Continue active enrollments and review completion percentages."
        />
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card space-y-4">
                <Skeleton className="h-44 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : enrolledCourses.length > 0 ? (
          <CourseGrid items={enrolledCourses} />
        ) : (
          <EmptyState
            title="No enrolled courses"
            text="You have not enrolled in any courses yet. Visit the catalog to get started."
          >
            <Link className="btn-primary mt-4 inline-flex" to="/courses">
              Explore Courses
            </Link>
          </EmptyState>
        )}
      </Page>
    </Shell>
  );
}
