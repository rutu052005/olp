import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Award, CheckCircle2, FileCheck2, XCircle } from 'lucide-react';
import Shell, { Page } from '../../components/layout/Shell';
import Panel from '../../components/ui/Panel';
import ListItem from '../../components/ui/ListItem';
import { certificateApi } from '../../api/client';
import { useApp } from '../../contexts/AppContext';

function MetricMini({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

export default function AssessmentResultPage() {
  const location = useLocation();
  const { id } = useParams(); // courseId
  const navigate = useNavigate();
  const { notify } = useApp();
  const [claiming, setClaiming] = useState(false);

  // Read results from navigation state
  const result = location.state || {
    score: 80,
    total_marks: 100,
    percentage: 80,
    status: 'passed',
  };

  const isPassed = result.status === 'passed';

  const handleClaimCertificate = async () => {
    setClaiming(true);
    try {
      await certificateApi.generate({ course_id: Number(id) });
      notify('Certificate generated successfully! Redirecting...');
      navigate('/student/certificates');
    } catch (err) {
      notify(err.message || 'Failed to claim certificate. Verify course completion (100%).');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Shell role="student">
      <Page>
        <div className="mx-auto max-w-3xl card text-center space-y-6">
          <div
            className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${
              isPassed ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' : 'bg-red-100 text-red-600 dark:bg-red-500/10'
            }`}
          >
            {isPassed ? <FileCheck2 size={42} /> : <XCircle size={42} />}
          </div>
          <div>
            <h1 className="text-4xl font-black">{isPassed ? 'Assessment Passed!' : 'Assessment Failed'}</h1>
            <p className="mt-2 text-slate-500">
              {isPassed
                ? 'Great job! You have met the requirements for this module.'
                : 'Keep practicing and try again to pass.'}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricMini label="Score Percentage" value={`${Math.round(result.percentage)}%`} />
            <MetricMini label="Marks Obtained" value={`${result.score} / ${result.total_marks}`} />
            <MetricMini label="Status" value={isPassed ? 'PASS' : 'FAIL'} />
          </div>

          <div className="flex flex-col gap-3 justify-center sm:flex-row">
            <Link className="btn-secondary justify-center" to={`/student/learn/${id}`}>
              Back to Course
            </Link>
            {isPassed && (
              <button
                className="btn-primary justify-center gap-2"
                onClick={handleClaimCertificate}
                disabled={claiming}
              >
                <Award size={18} />
                {claiming ? 'Claiming...' : 'Claim Certificate'}
              </button>
            )}
          </div>

          <Panel title="Review Guideline">
            <ListItem
              icon={CheckCircle2}
              title="Topics: Architecture, Security, SQL schemas"
              meta="Explanations are provided in your learning resources panel under course documents."
            />
          </Panel>
        </div>
      </Page>
    </Shell>
  );
}
