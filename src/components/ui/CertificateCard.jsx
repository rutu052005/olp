import { Download } from 'lucide-react';

export default function CertificateCard({ cert }) {
  const handleDownload = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the certificate.');
      return;
    }
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate - ${cert.certificate_id}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet">
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            font-family: 'Outfit', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .certificate {
            width: 840px;
            height: 580px;
            padding: 40px;
            border: 16px double #0ea5e9;
            border-radius: 12px;
            box-sizing: border-box;
            text-align: center;
            position: relative;
            background: radial-gradient(circle, #f8fafc 0%, #ffffff 100%);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          }
          .certificate::before {
            content: "";
            position: absolute;
            top: 10px; right: 10px; bottom: 10px; left: 10px;
            border: 2px solid #0ea5e9;
            opacity: 0.3;
            pointer-events: none;
          }
          .badge {
            font-size: 13px;
            font-weight: 900;
            color: #0ea5e9;
            text-transform: uppercase;
            letter-spacing: 0.5em;
            margin-top: 15px;
          }
          .title {
            font-family: 'Playfair Display', serif;
            font-size: 44px;
            font-weight: 900;
            color: #0f172a;
            margin: 25px 0 10px 0;
            font-style: italic;
          }
          .subtitle {
            font-size: 15px;
            color: #64748b;
            letter-spacing: 0.05em;
          }
          .name {
            font-size: 34px;
            font-weight: 900;
            color: #0f172a;
            border-bottom: 2px solid #e2e8f0;
            display: inline-block;
            padding-bottom: 5px;
            margin: 20px 0;
            min-width: 320px;
          }
          .text {
            color: #475569;
            font-size: 15px;
            line-height: 1.6;
            margin: 5px 0;
          }
          .course {
            font-size: 26px;
            font-weight: 900;
            color: #0ea5e9;
            margin: 10px 0 25px 0;
          }
          .meta-container {
            display: flex;
            justify-content: space-between;
            margin-top: 35px;
            padding: 0 30px;
            font-size: 13px;
          }
          .meta-item {
            text-align: left;
            width: 30%;
          }
          .meta-item-center {
            text-align: center;
            width: 30%;
          }
          .meta-item-right {
            text-align: right;
            width: 30%;
          }
          .meta-label {
            color: #94a3b8;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.1em;
            margin-bottom: 6px;
          }
          .meta-value {
            font-weight: 700;
            color: #334155;
          }
          .signature {
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-size: 18px;
            color: #0f172a;
            border-top: 1px solid #cbd5e1;
            padding-top: 5px;
            margin-top: 5px;
          }
          @media print {
            @page {
              size: landscape;
              margin: 0;
            }
            body {
              background-color: #ffffff;
            }
            .certificate {
              box-shadow: none;
              border: 16px double #0ea5e9 !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="badge">Certificate of Completion</div>
          <div class="title">LearnSphere Academy</div>
          <div class="subtitle">Verifiable Academic Credentials</div>
          <div class="name" style="margin-top: 25px;">${cert.student}</div>
          <div class="text">has successfully satisfied all academic course requirements for</div>
          <div class="course">${cert.course}</div>
          
          <div class="meta-container">
            <div class="meta-item">
              <div class="meta-label">Date Issued</div>
              <div class="meta-value">${cert.issued_date}</div>
            </div>
            <div class="meta-item-center">
              <div class="meta-label">Authorized Signatory</div>
              <div class="signature">Dr. Kavya Rao</div>
            </div>
            <div class="meta-item-right">
              <div class="meta-label">Credential ID</div>
              <div class="meta-value" style="font-family: monospace;">${cert.certificate_id}</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] border-4 border-double border-ocean bg-white p-8 text-center shadow-premium dark:bg-slate-900">
      <p className="text-sm font-bold uppercase tracking-[.35em] text-ocean">Certificate of Completion</p>
      <h2 className="mt-6 text-3xl font-black">{cert.student}</h2>
      <p className="mt-3 text-slate-500">has successfully completed</p>
      <h3 className="mt-3 text-2xl font-black">{cert.course}</h3>
      <div className="mt-7 flex justify-between gap-4 text-left text-sm">
        <div>
          <p className="text-slate-500">Issued</p>
          <p className="font-bold">{cert.issued_date}</p>
        </div>
        <div>
          <p className="text-slate-500">Certificate ID</p>
          <p className="font-bold">{cert.certificate_id}</p>
        </div>
      </div>
      <button 
        onClick={handleDownload}
        className="btn-secondary mt-6 justify-center w-full"
      >
        <Download size={17} /> Download certificate
      </button>
    </div>
  );
}
