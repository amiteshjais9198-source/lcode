import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { CheckCircle2, XCircle, AlertTriangle, Clock, Cpu, FlaskConical, X, Code2 } from 'lucide-react';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/admin/submissionsforproblem/${problemId}`);
        setSubmissions(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission history');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [problemId]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'accepted':
        return { icon: CheckCircle2, label: 'Accepted', className: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50' };
      case 'wrong':
        return { icon: XCircle, label: 'Wrong Answer', className: 'text-red-400 bg-red-950/40 border-red-800/50' };
      case 'error':
        return { icon: AlertTriangle, label: 'Runtime Error', className: 'text-amber-400 bg-amber-950/40 border-amber-800/50' };
      default:
        return { icon: Clock, label: status, className: 'text-slate-400 bg-slate-800/40 border-slate-700/50' };
    }
  };

  const getLangColor = (lang) => {
    const map = {
      javascript: 'text-yellow-400 bg-yellow-950/30 border-yellow-800/40',
      java: 'text-orange-400 bg-orange-950/30 border-orange-800/40',
      cpp: 'text-blue-400 bg-blue-950/30 border-blue-800/40',
    };
    return map[lang?.toLowerCase()] || 'text-slate-400 bg-slate-800/30 border-slate-700/40';
  };

  const formatMemory = (memory) => {
    if (!memory) return '—';
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse border border-slate-700/50" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <AlertTriangle size={32} className="text-amber-400 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-white">
          Submission History
          {submissions.length > 0 && (
            <span className="ml-2 text-xs font-normal text-slate-500">({submissions.length} total)</span>
          )}
        </h3>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <FlaskConical size={36} className="text-slate-600 mb-3" />
            <p className="text-slate-400 font-medium text-sm">No submissions yet</p>
            <p className="text-slate-600 text-xs mt-1">Submit your solution to see it here</p>
          </div>
        ) : (
          (Array.isArray(submissions) ? submissions : []).map((sub, index) => {
            const statusCfg = getStatusConfig(sub.status);
            const StatusIcon = statusCfg.icon;
            return (
              <div
                key={sub._id}
                className="group flex items-center gap-3 px-3 py-3 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/60 hover:border-slate-600 transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedSubmission(sub)}
              >
                {/* Status badge */}
                <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${statusCfg.className}`}>
                  <StatusIcon size={13} />
                  <span className="hidden sm:inline">{statusCfg.label}</span>
                </div>

                {/* Language */}
                <span className={`shrink-0 px-2 py-1 rounded-md border text-[11px] font-mono font-semibold ${getLangColor(sub.language)}`}>
                  {sub.language}
                </span>

                {/* Test cases */}
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <FlaskConical size={12} />
                  <span className="font-mono">{sub.testcasespassed ?? sub.testCasesPassed ?? 0}/{sub.totaltestcases ?? sub.testCasesTotal ?? '?'}</span>
                </div>

                {/* Runtime */}
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={12} />
                  <span className="font-mono">{sub.runtime ?? 0}s</span>
                </div>

                {/* Memory */}
                <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                  <Cpu size={12} />
                  <span className="font-mono">{formatMemory(sub.memory)}</span>
                </div>

                {/* Date */}
                <div className="ml-auto text-[11px] text-slate-500 hidden md:block">
                  {formatDate(sub.createdAt)}
                </div>

                {/* View code */}
                <div className="shrink-0 p-1.5 rounded-lg text-slate-500 group-hover:text-slate-300 group-hover:bg-slate-700 transition-all duration-200">
                  <Code2 size={14} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Code Modal */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setSelectedSubmission(null)}
        >
          <div className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-bold text-white">Submission Details</h3>
                {(() => {
                  const cfg = getStatusConfig(selectedSubmission.status);
                  const Icon = cfg.icon;
                  return (
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${cfg.className}`}>
                      <Icon size={12} />
                      {cfg.label}
                    </span>
                  );
                })()}
                <span className={`px-2 py-1 rounded-md border text-[11px] font-mono font-semibold ${getLangColor(selectedSubmission.language)}`}>
                  {selectedSubmission.language}
                </span>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stats row */}
            <div className="shrink-0 flex items-center gap-4 px-5 py-3 border-b border-slate-800 bg-slate-800/30">
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <FlaskConical size={14} className="text-violet-400" />
                <span>Tests: <strong className="text-white">{selectedSubmission.testcasespassed ?? selectedSubmission.testCasesPassed ?? 0}/{selectedSubmission.totaltestcases ?? selectedSubmission.testCasesTotal ?? '?'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <Clock size={14} className="text-blue-400" />
                <span>Runtime: <strong className="text-white">{selectedSubmission.runtime}s</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <Cpu size={14} className="text-emerald-400" />
                <span>Memory: <strong className="text-white">{formatMemory(selectedSubmission.memory)}</strong></span>
              </div>
            </div>

            {/* Error message if any */}
            {selectedSubmission.errormessage && (
              <div className="shrink-0 mx-5 mt-3 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs font-mono">
                {selectedSubmission.errormessage}
              </div>
            )}

            {/* Code */}
            <div className="flex-1 min-h-0 overflow-auto m-5 mt-3 rounded-xl bg-slate-950 border border-slate-800">
              <pre className="p-4 text-xs font-mono text-slate-300 leading-relaxed">
                <code>{selectedSubmission.code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;