import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import Shell, { Page } from '../../components/layout/Shell';
import Skeleton from '../../components/ui/Skeleton';
import { assessmentApi } from '../../api/client';
import { useApp } from '../../contexts/AppContext';

export default function AssessmentPage() {
  const { id } = useParams(); // courseId
  const navigate = useNavigate();
  const { notify } = useApp();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadAssessment() {
      try {
        const resList = await assessmentApi.list(Number(id));
        if (resList.data && resList.data.length > 0) {
          const ass = resList.data[0];
          setAssessment(ass);

          // Get questions
          const resQs = await assessmentApi.questions(ass.id);
          setQuestions(resQs.data);
        }
      } catch (err) {
        console.warn('Could not load assessment details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAssessment();
  }, [id]);

  const handleSubmit = async () => {
    if (!assessment) return;
    setSubmitting(true);
    try {
      const res = await assessmentApi.submit(assessment.id, { answers });
      const { score, percentage, status, total_marks } = res.data;
      notify(`Assessment submitted. Result: ${status.toUpperCase()} (${percentage}%)`);
      navigate(`/student/assessment/${id}/result`, {
        state: { score, percentage, status, total_marks, assessmentId: assessment.id }
      });
    } catch (err) {
      notify(err.message || 'Failed to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Shell role="student">
        <Page className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
            <div className="space-y-4">
              <Skeleton className="h-60 w-full" />
              <Skeleton className="h-60 w-full" />
            </div>
            <Skeleton className="h-80 w-full" />
          </div>
        </Page>
      </Shell>
    );
  }

  if (!assessment || questions.length === 0) {
    return (
      <Shell role="student">
        <Page className="text-center py-20">
          <h2 className="text-xl font-bold">No assessments structured for this course yet</h2>
          <Link className="btn-primary mt-6 inline-flex" to={`/student/learn/${id}`}>
            Back to Course
          </Link>
        </Page>
      </Shell>
    );
  }

  return (
    <Shell role="student">
      <Page>
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-[2rem] bg-slate-950 p-6 text-white sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-black">{assessment.title}</h1>
            <p className="mt-1 text-slate-300">{assessment.description}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-bold">
            <CalendarClock size={18} /> {assessment.time_limit_minutes}:00
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <div className="space-y-5">
            {questions.map((q, index) => (
              <div key={q.id} className="card">
                <p className="text-sm font-bold text-ocean">
                  Question {index + 1} • {q.marks} marks
                </p>
                <h2 className="mt-2 text-xl font-black">{q.question_text}</h2>
                <div className="mt-4 grid gap-3">
                  {q.options?.map((o) => (
                    <button
                      key={o.id}
                      className={`rounded-2xl border p-4 text-left font-semibold transition ${
                        answers[q.id] === o.id
                          ? 'border-ocean bg-ocean/10 text-ocean'
                          : 'border-slate-200 bg-white hover:border-ocean dark:border-white/10 dark:bg-white/5'
                      }`}
                      onClick={() => setAnswers({ ...answers, [q.id]: o.id })}
                    >
                      {o.option_text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <aside className="card h-fit lg:sticky lg:top-24">
            <h3 className="text-lg font-black">Question navigation</h3>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  className={`grid h-10 place-items-center rounded-xl text-sm font-black ${
                    answers[q.id] ? 'bg-ocean text-white' : 'bg-slate-100 dark:bg-white/10'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              className="btn-primary mt-5 w-full justify-center"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit assessment'}
            </button>
          </aside>
        </div>
      </Page>
    </Shell>
  );
}
