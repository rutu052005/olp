import { Link } from 'react-router-dom';
import { Star, Play } from 'lucide-react';

export function CourseCard({ course, onPreview }) {
  return (
    <Link to={`/courses/${course.id}`} className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-premium transition hover:-translate-y-1 hover:shadow-glow dark:border-white/10 dark:bg-white/5">
      <div className="relative h-44 overflow-hidden">
        <img src={course.thumbnail_url} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-900">{course.level}</span>
        {course.promo_video_url && onPreview && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPreview(course);
              }}
              className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-slate-900 shadow-premium transition hover:scale-105 hover:bg-white dark:bg-slate-900/90 dark:text-white dark:hover:bg-slate-900"
            >
              <Play size={14} fill="currentColor" />
              <span>Watch Trailer</span>
            </button>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>{course.category}</span>
          <span className="flex items-center gap-1 text-coral"><Star size={14} fill="currentColor" /> {course.rating}</span>
        </div>
        <h3 className="mt-3 line-clamp-2 text-lg font-black">{course.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{course.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-black">₹{course.price}</span>
          <span className="text-sm font-bold text-ocean">View details</span>
        </div>
      </div>
    </Link>
  );
}

export function CourseGrid({ items, onPreview }) {
  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{items.map((course) => <CourseCard key={course.id} course={course} onPreview={onPreview} />)}</div>;
}
