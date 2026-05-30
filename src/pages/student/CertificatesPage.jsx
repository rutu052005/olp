import { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import Shell, { Page, DashboardHeader } from '../../components/layout/Shell';
import CertificateCard from '../../components/ui/CertificateCard';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { certificateApi } from '../../api/client';
import { certificates as fallbackCertificates } from '../../sampleData';

export default function CertificatesPage({ admin = false }) {
  const { currentUser } = useApp();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    async function loadCertificates() {
      try {
        const res = await certificateApi.list(currentUser.id);
        setCerts(res.data);
      } catch (err) {
        console.warn('Could not load user certificates:', err);
        // Admin or fallback mock certificates
        setCerts(fallbackCertificates);
      } finally {
        setLoading(false);
      }
    }
    loadCertificates();
  }, [currentUser]);

  return (
    <Shell role={admin ? 'admin' : 'student'}>
      <Page>
        <DashboardHeader
          title="Certificates"
          subtitle="Auto-generated certificates with verification IDs and printable premium design."
        />
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        ) : certs.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {certs.map((cert) => (
              <CertificateCard key={cert.certificate_id} cert={cert} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No certificates earned yet"
            text="Complete courses 100% and pass assessments to generate certificates."
          />
        )}
      </Page>
    </Shell>
  );
}
