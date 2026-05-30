import { useState } from 'react';
import Shell, { Page, DashboardHeader } from '../../components/layout/Shell';
import Input from '../../components/ui/Input';
import CertificateCard from '../../components/ui/CertificateCard';
import EmptyState from '../../components/ui/EmptyState';
import { certificateApi } from '../../api/client';

export default function VerifyCertificate() {
  const [id, setId] = useState('CERT-LS-2026-001');
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleVerify = async () => {
    if (!id.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await certificateApi.verify(id.trim());
      if (res.data && res.data.verified) {
        setCert(res.data.certificate);
      } else {
        setCert(null);
      }
    } catch (err) {
      setCert(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <Page>
        <div className="mx-auto max-w-3xl">
          <DashboardHeader
            title="Verify Certificate"
            subtitle="Enter a certificate ID to validate authenticity and status."
          />
          <div className="card space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Input
                  label="Certificate ID"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="e.g. CERT-LS-2026-001"
                />
              </div>
              <button
                className="btn-primary h-12 justify-center"
                disabled={loading}
                onClick={handleVerify}
              >
                {loading ? 'Verifying...' : 'Verify Status'}
              </button>
            </div>
            <div className="mt-5">
              {cert ? (
                <CertificateCard cert={cert} />
              ) : searched && !loading ? (
                <EmptyState
                  title="Certificate not found"
                  text="Check the certificate ID and try again."
                />
              ) : (
                <p className="text-center text-sm text-slate-400 py-10">
                  Search a certificate ID above to verify.
                </p>
              )}
            </div>
          </div>
        </div>
      </Page>
    </Shell>
  );
}
