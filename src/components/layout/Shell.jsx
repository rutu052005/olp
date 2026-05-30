import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Award, BarChart3, BookOpen, ClipboardCheck, Database, GraduationCap, LayoutDashboard, LogOut, Menu, Moon, Settings, Sun, TrendingUp, UserRound, UsersRound } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { users } from '../../sampleData';
import Sidebar from './Sidebar';
import Toast from '../ui/Toast';

const adminNav = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Students', to: '/admin/students', icon: UsersRound },
  { label: 'Courses', to: '/admin/courses', icon: BookOpen },
  { label: 'Assessments', to: '/admin/assessments', icon: ClipboardCheck },
  { label: 'Certificates', to: '/admin/certificates', icon: Award },
  { label: 'Database Viewer', to: '/admin/database', icon: Database },
  { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

const studentNav = [
  { label: 'Dashboard', to: '/student', icon: LayoutDashboard },
  { label: 'My Courses', to: '/student/courses', icon: BookOpen },
  { label: 'Progress', to: '/student/progress', icon: TrendingUp },
  { label: 'Certificates', to: '/student/certificates', icon: Award },
  { label: 'Profile', to: '/student/profile', icon: UserRound },
];

export default function Shell({ children, role = 'public' }) {
  const { theme, setTheme, currentUser, logout, toast, mobileNav, setMobileNav } = useApp();
  const navigate = useNavigate();
  const isApp = role !== 'public';
  const nav = role === 'admin' ? adminNav : studentNav;

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 text-slate-950 transition dark:bg-[#0c111d] dark:text-slate-100">
        {isApp && <Sidebar nav={nav} open={mobileNav} onClose={() => setMobileNav(false)} />}
        <div className={isApp ? 'lg:pl-72' : ''}>
          <header className={`sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#0c111d]/80 ${isApp ? '' : 'border-transparent'}`}>
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                {isApp && (
                  <button className="icon-btn lg:hidden" onClick={() => setMobileNav(true)} aria-label="Open menu">
                    <Menu size={20} />
                  </button>
                )}
                <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-ocean text-white shadow-glow">
                    <GraduationCap size={20} />
                  </span>
                  <span>LearnSphere</span>
                </Link>
              </div>
              {!isApp && (
                <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
                  <Link to="/courses">Courses</Link>
                  <Link to="/verify">Verify</Link>
                  <Link to="/login">Login</Link>
                </nav>
              )}
              <div className="flex items-center gap-2">
                <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                {isApp ? (
                  <div className="flex items-center gap-3">
                    {currentUser && <img src={currentUser.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />}
                    <button
                      className="hidden text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white sm:block"
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                    >
                      <LogOut size={17} />
                    </button>
                  </div>
                ) : (
                  <Link className="btn-primary hidden sm:inline-flex" to="/register">
                    Start Learning
                  </Link>
                )}
              </div>
            </div>
          </header>
          <main>{children}</main>
        </div>
        <AnimatePresence>{toast && <Toast message={toast} />}</AnimatePresence>
      </div>
    </div>
  );
}

export function Page({ children, className = '' }) {
  return <div className={`mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function DashboardHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <p className="breadcrumb">Dashboard / Overview</p>
      <h1 className="text-4xl font-black tracking-tight">{title}</h1>
      <p className="mt-2 max-w-3xl text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
  );
}
