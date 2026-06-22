import React from 'react';
import { Terminal, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

export default function ResultPanel({ result, isRunning, isSubmitting }) {
    if (isRunning || isSubmitting) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, opacity: 0.7 }}>
                <span className="loading loading-spinner loading-sm" />
                <span style={{ fontSize: 14 }}>{isRunning ? 'Running code...' : 'Submitting...'}</span>
            </div>
        );
    }

    if (!result) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.35, flexDirection: 'column', gap: 8 }}>
            <Terminal size={32} />
            <p style={{ fontSize: 13 }}>Run or submit your code to see results here</p>
        </div>
    );

    const statusId = result.status?.id;
    const statusDesc = result.status?.description || result.status || '';
    const isAccepted = statusId === 3 || statusDesc.toLowerCase().includes('accepted');
    const isWrong = statusId === 4 || statusDesc.toLowerCase().includes('wrong');

    const statusColor = isAccepted ? '#00b8a3' : isWrong ? '#ff375f' : '#ffc01e';
    const StatusIcon = isAccepted ? CheckCircle2 : isWrong ? XCircle : AlertCircle;

    return (
        <div style={{ padding: '16px 20px', overflowY: 'auto', height: '100%' }}>
            {/* Status header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <StatusIcon size={22} color={statusColor} />
                <span style={{ fontSize: 18, fontWeight: 700, color: statusColor }}>
                    {result.isRun ? 'Run Result' : statusDesc || 'Result'}
                </span>
                {result.runtime > 0 && (
                    <span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {result.runtime}ms
                    </span>
                )}
            </div>

            {/* Stats row */}
            {!result.isRun && (
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <div style={{ background: 'rgba(100,110,140,0.08)', borderRadius: 8, padding: '10px 16px', flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: statusColor }}>
                            {result.testCasesPassed}/{result.totalTestCases}
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>Test Cases</div>
                    </div>
                    {result.runtime > 0 && (
                        <div style={{ background: 'rgba(100,110,140,0.08)', borderRadius: 8, padding: '10px 16px', flex: 1, textAlign: 'center' }}>
                            <div style={{ fontSize: 20, fontWeight: 700 }}>{result.runtime}ms</div>
                            <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>Runtime</div>
                        </div>
                    )}
                </div>
            )}

            {/* Details from result.details */}
            {result.details && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {result.details.stdout && (
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 600, opacity: 0.5, marginBottom: 4 }}>STDOUT</p>
                            <div style={{ fontFamily: 'monospace', fontSize: 12.5, background: 'rgba(100,110,140,0.08)', borderRadius: 6, padding: '8px 12px', whiteSpace: 'pre-wrap' }}>
                                {result.details.stdout}
                            </div>
                        </div>
                    )}
                    {result.details.stderr && (
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#ff375f', marginBottom: 4 }}>STDERR</p>
                            <div style={{ fontFamily: 'monospace', fontSize: 12.5, background: 'rgba(255,55,95,0.08)', borderRadius: 6, padding: '8px 12px', whiteSpace: 'pre-wrap', color: '#ff375f' }}>
                                {result.details.stderr}
                            </div>
                        </div>
                    )}
                    {result.details.compile_output && (
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#ffc01e', marginBottom: 4 }}>COMPILE OUTPUT</p>
                            <div style={{ fontFamily: 'monospace', fontSize: 12.5, background: 'rgba(255,192,30,0.08)', borderRadius: 6, padding: '8px 12px', whiteSpace: 'pre-wrap', color: '#ffc01e' }}>
                                {result.details.compile_output}
                            </div>
                        </div>
                    )}
                    {result.details.expectedOutput && (
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 600, opacity: 0.5, marginBottom: 4 }}>EXPECTED OUTPUT</p>
                            <div style={{ fontFamily: 'monospace', fontSize: 12.5, background: 'rgba(100,110,140,0.08)', borderRadius: 6, padding: '8px 12px', whiteSpace: 'pre-wrap' }}>
                                {result.details.expectedOutput}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Run-only: show test pass results */}
            {result.isRun && (
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                    <div style={{ background: 'rgba(100,110,140,0.08)', borderRadius: 8, padding: '10px 16px', flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: statusColor }}>
                            {result.testCasesPassed}/{result.totalTestCases}
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>Visible Test Cases</div>
                    </div>
                    {result.runtime > 0 && (
                        <div style={{ background: 'rgba(100,110,140,0.08)', borderRadius: 8, padding: '10px 16px', flex: 1, textAlign: 'center' }}>
                            <div style={{ fontSize: 20, fontWeight: 700 }}>{result.runtime}ms</div>
                            <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>Runtime</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
