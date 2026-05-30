import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Shell, { Page } from '../../components/layout/Shell';
import Input from '../../components/ui/Input';

export default function AuthPage({ type }) {
  const { login, register, notify } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = type === 'login';

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const defaultEmail = email || (role === 'admin' ? 'admin@learnsphere.edu' : 'student@learnsphere.edu');
        const defaultPassword = password || 'password';
        const user = await login(defaultEmail, defaultPassword);
        notify(`Welcome back, ${user.name}!`);
        navigate(user.role === 'admin' ? '/admin' : '/student');
      } else {
        if (!name) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        const defaultEmail = email || `${name.toLowerCase().replace(/\s+/g, '')}@learnsphere.edu`;
        const defaultPassword = password || 'password';
        const user = await register(name, defaultEmail, defaultPassword, role);
        notify(`Account created successfully!`);
        navigate(user.role === 'admin' ? '/admin' : '/student');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <Page className="grid min-h-[calc(100vh-4rem)] items-center gap-8 lg:grid-cols-[.95fr_1fr]">
        <div className="hidden overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-glow lg:block">
          <p className="badge bg-white/10 text-white">Secure role-based access</p>
          <h1 className="mt-8 text-5xl font-black leading-tight">
            {isLogin
              ? 'Welcome back to your learning command center.'
              : 'Create your account and start a tracked learning journey.'}
          </h1>
          <div className="mt-10 grid gap-4">
            {['JWT-ready sessions', 'Admin and student roles', 'Password hash structure'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                <LockKeyhole size={18} />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-7 shadow-premium dark:border-white/10 dark:bg-white/5">
          <h2 className="text-3xl font-black">{isLogin ? 'Login' : 'Register'}</h2>
          <p className="mt-2 text-sm text-slate-500">
            {isLogin
              ? 'Use student@learnsphere.edu / password or admin@learnsphere.edu / password'
              : 'Create a student-ready profile.'}
          </p>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          {!isLogin && (
            <Input
              label="Full name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <Input
            label="Email"
            placeholder={role === 'admin' ? 'admin@learnsphere.edu' : 'student@learnsphere.edu'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-white/5">
            {['student', 'admin'].map((item) => (
              <button
                key={item}
                className={`rounded-xl px-3 py-2 text-sm font-bold capitalize ${
                  role === item ? 'bg-white shadow-sm dark:bg-slate-800' : 'text-slate-500'
                }`}
                onClick={() => setRole(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <button
            className="btn-primary mt-5 w-full justify-center"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? 'Authenticating...' : isLogin ? 'Login securely' : 'Create account'}
          </button>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link className="font-bold text-ocean" to={isLogin ? '/register' : '/login'}>
              {isLogin ? 'Create account' : 'Already registered?'}
            </Link>
            <Link className="text-slate-500" to="/forgot-password">
              Forgot password?
            </Link>
          </div>
        </div>
      </Page>
    </Shell>
  );
}
