import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Shell, { Page, DashboardHeader } from '../../components/layout/Shell';
import Input from '../../components/ui/Input';
import { ModuleAccordion } from '../public/CourseDetailPage';
import { lessonsByCourse } from '../../sampleData';

export default function EditCourse() {
  const navigate = useNavigate();
  const { notify } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('Degree');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [instructor, setInstructor] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title || !category || !instructor) {
      notify('Please fill out course title, category, and instructor name.');
      return;
    }

    setSaving(true);
    try {
      // Mock outcomes and thumbnail
      const outcomes = ['Understand core concepts', 'Build hands-on practice labs', 'Complete final assessment'];
      const thumbnail_url = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1100&q=80';

      const payload = {
        title,
        description: description || `Complete guide to learning ${title}.`,
        category,
        level,
        difficulty,
        price: Number(price) || 0,
        thumbnail_url,
        instructor_name: instructor,
        duration_hours: Number(duration) || 10,
        outcomes,
        language: 'English',
      };

      // Call API
      // Since client.js has courseApi.create:
      const { courseApi } = await import('../../api/client');
      await courseApi.create(payload);

      notify('Course saved successfully!');
      navigate('/admin/courses');
    } catch (err) {
      notify(err.message || 'Failed to save course.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Shell role="admin">
      <Page>
        <DashboardHeader
          title="Add / Edit Course"
          subtitle="Course management form with module, lesson, assessment, thumbnail, and metadata sections."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card space-y-4">
            <Input label="Course title" placeholder="e.g. Advanced Web Development" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input label="Description" placeholder="Course outline details" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input label="Category" placeholder="e.g. Development" value={category} onChange={(e) => setCategory(e.target.value)} />
            <Input label="Instructor name" placeholder="e.g. Rohan Iyer" value={instructor} onChange={(e) => setInstructor(e.target.value)} />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold block mb-1">Level</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-white outline-none dark:border-white/10 dark:bg-[#0c111d]">
                  {['School', 'Diploma', 'Degree', 'Masters'].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-white outline-none dark:border-white/10 dark:bg-[#0c111d]">
                  {['Beginner', 'Intermediate', 'Advanced'].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Duration hours" placeholder="e.g. 42" value={duration} onChange={(e) => setDuration(e.target.value)} />
              <Input label="Price (₹)" placeholder="e.g. 149" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>

            <button className="btn-primary mt-5 w-full justify-center" onClick={handleSave} disabled={saving}>
              <Plus size={17} /> {saving ? 'Saving...' : 'Save course'}
            </button>
          </div>
          <div className="card">
            <h3 className="text-xl font-black mb-4">Preview Modules and lessons</h3>
            {lessonsByCourse[1].map((m) => (
              <ModuleAccordion key={m.title} module={m} />
            ))}
          </div>
        </div>
      </Page>
    </Shell>
  );
}
