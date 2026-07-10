import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Printer, Award, ShieldCheck, ExternalLink, Download } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getCertificateById } from '@/services/assessmentService';

export default function CertificateViewer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cert, setCert] = useState(null);

  const certId = location.state?.certificateId ||
    new URLSearchParams(location.search).get('id');

  useEffect(() => {
    if (certId) {
      const data = getCertificateById(certId);
      if (data) {
        setCert(data);
      } else {
        // Fallback default mock if none found
        setCert({
          id: 'cert-default',
          studentName: 'Abhay Kumawat',
          courseName: 'Spring Boot Enterprise APIs',
          assignmentName: 'Spring Boot REST Endpoints',
          subject: 'Backend Development',
          completionDate: new Date().toISOString().split('T')[0],
          instructorName: 'Siddharth Sen',
          certificateId: certId || 'XEB-SBEA-9182',
          marksObtained: 92,
          grade: 'A+',
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
            'http://localhost:5173/verify-certificate?id=' + (certId || 'XEB-SBEA-9182')
          )}`
        });
      }
    }
  }, [certId]);

  if (!cert) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0B1120]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#831B84] border-t-transparent" />
          <p className="text-sm font-bold text-slate-400">Loading certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-purple-50/20 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 pb-16 transition-colors print:bg-white print:p-0">

      {/* ── Top Action Bar (hidden in print) ── */}
      <div className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-[#334155] px-6 lg:px-8 py-4 flex items-center justify-between gap-4 print:hidden sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-500 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" /> Certificate of Completion
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              ID: <span className="font-mono font-bold">{cert.certificateId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate(`/verify-certificate?id=${cert.certificateId}`)}
            variant="outline"
            className="rounded-xl border-slate-200 dark:border-[#334155] text-slate-600 dark:text-slate-350 font-bold px-4 py-2 cursor-pointer flex items-center gap-1.5 text-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Verify Online</span>
          </Button>
          <Button
            onClick={() => window.print()}
            variant="primary"
            className="rounded-xl bg-gradient-to-r from-[#831B84] to-[#FF6200] hover:opacity-90 text-white font-bold px-5 py-2 shadow-md cursor-pointer border-0 flex items-center gap-1.5 text-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Download / Print PDF</span>
          </Button>
        </div>
      </div>

      {/* ── Certificate Frame ── */}
      <div className="max-w-4xl mx-auto px-4 lg:px-6 mt-10 print:mt-0 print:px-0">
        <div
          id="certificate-print-area"
          className="bg-white dark:bg-slate-900 border-[12px] border-amber-100 dark:border-amber-900/20 p-10 md:p-14 rounded-[32px] shadow-2xl relative overflow-hidden print:border-4 print:shadow-none print:rounded-none print:p-10"
        >
          {/* Watermark */}
          <div className="absolute -right-16 -bottom-16 opacity-[0.03] text-slate-900 dark:text-white pointer-events-none select-none print:opacity-[0.02]">
            <Award className="h-96 w-96" />
          </div>

          {/* Decorative top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#831B84] via-amber-500 to-[#FF6200]" />

          {/* Inner border */}
          <div className="border-[2px] border-double border-amber-400/40 dark:border-amber-600/30 p-8 rounded-2xl min-h-[520px] flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#831B84] to-[#FF6200] flex items-center justify-center font-black text-white text-sm shadow-md">
                  X
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Xebia Academy</p>
                  <p className="text-[9px] text-slate-400 font-semibold">Certified Learning Platform</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[8px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-300/30">
                  <ShieldCheck className="h-3 w-3" /> Verified Credential
                </span>
                <p className="text-[8px] text-slate-400 font-mono">{cert.certificateId}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-400/30 to-transparent mb-8" />

            {/* Main Content */}
            <div className="flex-1 text-center space-y-5 flex flex-col items-center justify-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1">
                  Certificate of Completion
                </p>
                <h2 className="text-2xl md:text-3xl font-serif italic text-slate-800 dark:text-slate-100 font-bold">
                  This is proudly presented to
                </h2>
              </div>

              <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#831B84] dark:text-[#FF6200] border-b-2 border-amber-400/30 pb-3 px-8">
                {cert.studentName}
              </h1>

              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                for successfully completing all requirements and passing the evaluation for
              </p>

              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100">
                  {cert.assignmentName || cert.courseName}
                </h3>
                {cert.assignmentName && cert.courseName !== cert.assignmentName && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
                    {cert.courseName}
                  </p>
                )}
                {cert.subject && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                    Subject: {cert.subject}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mb-6" />
              <div className="grid grid-cols-3 gap-4 items-end">

                {/* Instructor signature */}
                <div className="flex flex-col items-center space-y-1.5">
                  <p className="font-serif italic text-lg text-slate-700 dark:text-slate-300">
                    {cert.instructorName || 'Priya Sharma'}
                  </p>
                  <div className="h-px w-28 bg-slate-300 dark:bg-slate-600" />
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Authorized Instructor</p>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-white p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <img
                      src={cert.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent('http://localhost:5173/verify-certificate?id=' + cert.certificateId)}`}
                      alt="Scan to verify"
                      className="h-[72px] w-[72px]"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-[8px] text-slate-400 mt-1 uppercase font-bold tracking-widest text-center">Scan to Verify</p>
                </div>

                {/* Score & Date */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex gap-1.5">
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Score: {cert.marksObtained}%
                    </span>
                    <span className="text-[10px] font-black text-[#831B84] dark:text-[#FF6200] bg-[#831B84]/10 px-2 py-0.5 rounded-full">
                      Grade: {cert.grade}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center">
                      {cert.completionDate}
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider text-center">Issued On</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Share + verify strip */}
        <div className="mt-6 p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Share this certificate: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              {window.location.origin}/verify-certificate?id={cert.certificateId}
            </span>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/verify-certificate?id=${cert.certificateId}`);
              }}
              variant="outline"
              className="rounded-xl border-slate-200 dark:border-[#334155] text-slate-600 font-bold px-4 py-2 cursor-pointer text-xs"
            >
              Copy Link
            </Button>
            <Button
              onClick={() => window.print()}
              variant="primary"
              className="rounded-xl bg-gradient-to-r from-[#831B84] to-[#FF6200] text-white font-bold px-4 py-2 border-0 cursor-pointer flex items-center gap-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" /> Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
