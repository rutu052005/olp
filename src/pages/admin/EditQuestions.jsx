import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Shell, { Page, DashboardHeader } from '../../components/layout/Shell';
import Input from '../../components/ui/Input';

export default function EditQuestions() {
  const navigate = useNavigate();
  const { notify } = useApp();

  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState('B');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!questionText || !optionA || !optionB) {
      notify('Please provide question text and at least two options.');
      return;
    }
    setSaving(true);
    try {
      // Simulate saving to API or mock database
      notify('Question saved successfully!');
      navigate('/admin/assessments');
    } catch (err) {
      notify(err.message || 'Failed to save question.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Shell role="admin">
      <Page>
        <DashboardHeader
          title="Add / Edit Questions"
          subtitle="Question builder with MCQ options and correct answer flags."
        />
        <div className="card space-y-4">
          <Input
            label="Question text"
            placeholder="e.g. Which SQL clause filters grouped data?"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
          <Input
            label="Option A"
            placeholder="e.g. WHERE"
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
          />
          <Input
            label="Option B"
            placeholder="e.g. HAVING"
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
          />
          <Input
            label="Option C"
            placeholder="e.g. GROUP BY"
            value={optionC}
            onChange={(e) => setOptionC(e.target.value)}
          />
          <Input
            label="Option D"
            placeholder="e.g. ORDER BY"
            value={optionD}
            onChange={(e) => setOptionD(e.target.value)}
          />

          <div className="mt-4">
            <label className="text-sm font-bold block mb-2">Select Correct Option</label>
            <div className="grid grid-cols-4 gap-2">
              {['A', 'B', 'C', 'D'].map((opt) => (
                <button
                  key={opt}
                  className={`rounded-xl h-11 text-sm font-bold transition ${
                    correctOption === opt ? 'bg-ocean text-white' : 'bg-slate-100 dark:bg-white/5'
                  }`}
                  onClick={() => setCorrectOption(opt)}
                >
                  Option {opt}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary mt-6 w-full justify-center" onClick={handleSave} disabled={saving}>
            <Plus size={17} /> {saving ? 'Saving question...' : 'Save question'}
          </button>
        </div>
      </Page>
    </Shell>
  );
}
