import React, { useState, useEffect } from 'react';
import axiosClient from '../../../utilis/axiosClient';
import { History, Clock } from 'lucide-react';
import { StatusBadge } from './Badges';
import { formatTime } from '../helpers';

export default function SubmissionsTab({ problemId }) {
    const [submissions, setSubmissions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedCode, setExpandedCode] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const res = await axiosClient.get(`/problem/submittedProblems/${problemId}`);
                if (res.data?.success) setSubmissions(res.data.data);
                else setSubmissions([]);
            } catch {
                setSubmissions([]);
            } finally {
                setLoading(false);
            }
        };
        if (problemId) fetch();
    }, [problemId]);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
            <span className="loading loading-spinner loading-md" style={{ marginRight: 10 }} />
            Loading submissions...
        </div>
    );

    if (!submissions || submissions.length === 0) return (
        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
            <History size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
            <p style={{ fontSize: 16, fontWeight: 600 }}>No submissions yet</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Submit a solution to see your history here.</p>
        </div>
    );

    return (
        <div style={{ padding: '16px 20px', overflowY: 'auto', height: '100%' }}>
            <p style={{ fontSize: 13, fontWeight: 600, opacity: 0.5, marginBottom: 12 }}>{submissions.length} submission{submissions.length > 1 ? 's' : ''}</p>
            {submissions.map((sub, i) => {
                const isExpanded = expandedCode === i;
                return (
                    <div key={sub._id || i} style={{
                        border: '1px solid var(--tc-border, rgba(100,110,140,0.18))',
                        borderRadius: 8, marginBottom: 10, overflow: 'hidden'
                    }}>
                        <div
                            style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'var(--tc-bg, rgba(100,110,140,0.06))' }}
                            onClick={() => setExpandedCode(isExpanded ? null : i)}
                        >
                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                <StatusBadge status={sub.status} />
                                <span style={{ fontSize: 12, opacity: 0.6 }}>{sub.language}</span>
                                <span style={{ fontSize: 12, opacity: 0.55 }}>{sub.testCasesPassed}/{sub.testCasesTotal} passed</span>
                                {sub.runtime > 0 && <span style={{ fontSize: 12, opacity: 0.55 }}><Clock size={10} style={{ display: 'inline', marginRight: 3 }} />{sub.runtime}ms</span>}
                            </div>
                            <span style={{ fontSize: 12, opacity: 0.45 }}>{formatTime(sub.createdAt)}</span>
                        </div>
                        {isExpanded && (
                            <div style={{ background: '#1e1e1e', padding: '12px 16px', fontFamily: 'monospace', fontSize: 12.5, whiteSpace: 'pre-wrap', overflowX: 'auto', maxHeight: 250, overflowY: 'auto' }}>
                                {sub.code}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
