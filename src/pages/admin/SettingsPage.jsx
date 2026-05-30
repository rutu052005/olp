import { Edit3 } from 'lucide-react';
import Shell, { Page, DashboardHeader } from '../../components/layout/Shell';

export default function SettingsPage() {
  return (
    <Shell role="admin">
      <Page>
        <DashboardHeader title="Settings" subtitle="Platform preferences, theme controls, integrations, notifications, and security policies." />
        <div className="grid gap-4 lg:grid-cols-2">
          {['JWT secret rotation', 'SMTP notifications', 'Payment gateway', 'Certificate signature', 'Database backups', 'Role permissions'].map((item) => (
            <div key={item} className="card flex items-center justify-between">
              <div>
                <h3 className="font-black">{item}</h3>
                <p className="text-sm text-slate-500">Ready for production configuration.</p>
              </div>
              <button className="btn-secondary">
                <Edit3 size={17} /> Configure
              </button>
            </div>
          ))}
        </div>
      </Page>
    </Shell>
  );
}
