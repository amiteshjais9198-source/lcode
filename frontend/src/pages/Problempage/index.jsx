import React, { useState, useEffect, useRef } from 'react';
import './Problempage.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import axiosClient from '../../utilis/axiosClient';
import {
    Play, Send, ChevronDown, RotateCcw, ArrowLeft,
    BookOpen, Lightbulb, Users, History, XCircle, Sparkles, Video
} from 'lucide-react';

import { LANGUAGES } from './constants';
import { getStartCode } from './helpers';

import DescriptionTab from './components/DescriptionTab';
import EditorialTab from './components/EditorialTab';
import SolutionsTab from './components/SolutionsTab';
import SubmissionsTab from './components/SubmissionsTab';
import ResultPanel from './components/ResultPanel';
import AiHelpTab from './components/AiHelpTab';
import VideoTab from './components/VideoTab';

export default function Problempage() {
    const { problemId } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    // Data
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);

    // Editor state
    const [selectedLang, setSelectedLang] = useState('c++');
    const [codeMap, setCodeMap] = useState({}); // per-language code cache
    const editorRef = useRef(null);

    // UI tabs
    const [leftTab, setLeftTab] = useState('description'); // description | editorial | solutions | submissions
    const [rightBottomTab, setRightBottomTab] = useState('testcases'); // testcases | result

    // Run/submit state
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    // Language dropdown open
    const [langOpen, setLangOpen] = useState(false);

    // ── Fetch problem ────────────────────────────────────────────────
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setLoading(true);
                const res = await axiosClient.get(`/problem/getbyid/${problemId}`);
                if (res.data?.success) {
                    const p = res.data.data;
                    setProblem(p);
                    // Pre-fill code map from startCode for each language
                    const map = {};
                    LANGUAGES.forEach(l => {
                        map[l.id] = getStartCode(p, l.id);
                    });
                    setCodeMap(map);
                }
            } catch (err) {
                console.error('Error fetching problem:', err);
            } finally {
                setLoading(false);
            }
        };
        if (problemId) fetchProblem();
    }, [problemId]);

    // ── Editor helpers ───────────────────────────────────────────────
    const currentCode = codeMap[selectedLang] || '// Start coding here...\n';

    const handleEditorChange = (value) => {
        setCodeMap(prev => ({ ...prev, [selectedLang]: value || '' }));
    };

    const handleLangChange = (langId) => {
        setSelectedLang(langId);
        setLangOpen(false);
    };

    const handleResetCode = () => {
        if (!problem) return;
        const fresh = getStartCode(problem, selectedLang);
        setCodeMap(prev => ({ ...prev, [selectedLang]: fresh }));
    };

    // ── Run code ─────────────────────────────────────────────────────
    const handleRun = async () => {
        const code = codeMap[selectedLang] || '';
        setIsRunning(true);
        setResult(null);
        setRightBottomTab('result');
        try {
            const res = await axiosClient.post(`/run/${problemId}`, { language: selectedLang, code });
            if (res.data?.success) {
                setResult({ ...res.data.data, isRun: true });
            }
        } catch (err) {
            setResult({ status: { description: 'Network Error' }, isRun: true, details: { stderr: err.message } });
        } finally {
            setIsRunning(false);
        }
    };

    // ── Submit code ───────────────────────────────────────────────────
    const handleSubmit = async () => {
        const code = codeMap[selectedLang] || '';
        setIsSubmitting(true);
        setResult(null);
        setRightBottomTab('result');
        try {
            const res = await axiosClient.post(`/submit/${problemId}`, { language: selectedLang, code });
            if (res.data?.success) {
                setResult({ ...res.data.data, isRun: false });
            }
        } catch (err) {
            setResult({ status: { description: 'Network Error' }, isRun: false, details: { stderr: err.message } });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Monaco theme ─────────────────────────────────────────────────
    const [isDark, setIsDark] = useState(document.documentElement.getAttribute('data-theme') !== 'light');

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    setIsDark(document.documentElement.getAttribute('data-theme') !== 'light');
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    // ─── Render ───────────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', flexDirection: 'column', gap: 16 }}>
                <span className="loading loading-spinner loading-lg" />
                <p style={{ opacity: 0.5, fontSize: 15 }}>Loading problem...</p>
            </div>
        );
    }

    if (!problem) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', flexDirection: 'column', gap: 16 }}>
                <XCircle size={48} style={{ opacity: 0.4 }} />
                <p style={{ opacity: 0.5, fontSize: 15 }}>Problem not found.</p>
                <button className="btn btn-sm btn-outline" onClick={() => navigate('/')}>Go back</button>
            </div>
        );
    }

    const monacoLang = LANGUAGES.find(l => l.id === selectedLang)?.monacoLang || 'cpp';
    const selectedLangLabel = LANGUAGES.find(l => l.id === selectedLang)?.label || selectedLang;

    // Tab configs
    const LEFT_TABS = [
        { id: 'description', label: 'Description', icon: BookOpen },
        { id: 'editorial', label: 'Editorial', icon: Lightbulb },
        { id: 'solutions', label: 'Solutions', icon: Users },
        { id: 'submissions', label: 'Submissions', icon: History },
        { id: 'ai_help', label: 'AI Help', icon: Sparkles },
        ...(user?.role === 'admin' ? [{ id: 'videos', label: 'Videos', icon: Video }] : []),
    ];

    return (
        <div className="problem-page-wrapper" style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 64px)',
            background: 'var(--problem-bg)',
            overflow: 'hidden',
            fontFamily: "'Inter', 'Segoe UI', sans-serif"
        }}>

            {/* ── Top action bar ──────────────────────────────────────── */}
            <div className="problem-top-bar" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                height: 48,
                borderBottom: '1px solid var(--tc-border, rgba(100,110,140,0.18))',
                flexShrink: 0,
                gap: 12
            }}>
                {/* Left: back button + title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, opacity: 0.6, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
                        className="hover:opacity-100 hover:bg-base-200 transition-all"
                    >
                        <ArrowLeft size={14} /> Problems
                    </button>
                </div>

                {/* Right: Run + Submit */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                        onClick={handleRun}
                        disabled={isRunning || isSubmitting}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'rgba(100,110,140,0.12)',
                            border: '1px solid rgba(100,110,140,0.22)',
                            color: 'inherit',
                            padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            opacity: (isRunning || isSubmitting) ? 0.5 : 1
                        }}
                        className="hover:bg-base-200"
                    >
                        {isRunning ? <span className="loading loading-spinner loading-xs" /> : <Play size={14} />}
                        Run
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isRunning || isSubmitting}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: '#00b8a3',
                            border: 'none',
                            color: '#fff',
                            padding: '6px 16px', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            opacity: (isRunning || isSubmitting) ? 0.5 : 1
                        }}
                        onMouseOver={e => !isSubmitting && !isRunning && (e.currentTarget.style.background = '#00a090')}
                        onMouseOut={e => (e.currentTarget.style.background = '#00b8a3')}
                    >
                        {isSubmitting ? <span className="loading loading-spinner loading-xs" /> : <Send size={14} />}
                        Submit
                    </button>
                </div>
            </div>

            {/* ── Main split layout ────────────────────────────────────── */}
            <div className="problem-main-split" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* ════ LEFT PANEL ════ */}
                <div className="problem-left-panel" style={{
                    width: '40%',
                    minWidth: 320,
                    maxWidth: 600,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRight: '1px solid var(--tc-border, rgba(100,110,140,0.18))',
                    overflow: 'hidden',
                }}>
                    {/* Left tab bar */}
                    <div className="problem-left-tabs" style={{
                        display: 'flex',
                        borderBottom: '1px solid var(--tc-border, rgba(100,110,140,0.18))',
                        flexShrink: 0,
                        overflowX: 'auto',
                    }}>
                        {LEFT_TABS.map(tab => {
                            const Icon = tab.icon;
                            const active = leftTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setLeftTab(tab.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '10px 16px', fontSize: 13, fontWeight: active ? 600 : 400,
                                        border: 'none', background: 'none', cursor: 'pointer',
                                        borderBottom: active ? '2px solid #00b8a3' : '2px solid transparent',
                                        color: active ? '#00b8a3' : 'inherit',
                                        opacity: active ? 1 : 0.55,
                                        transition: 'all 0.15s ease',
                                        whiteSpace: 'nowrap',
                                    }}
                                    className="hover:opacity-100"
                                >
                                    <Icon size={13} /> {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Left tab content */}
                    <div className="problem-left-content" style={{ flex: 1, overflow: 'hidden' }}>
                        {leftTab === 'description' && <DescriptionTab problem={problem} />}
                        {leftTab === 'editorial' && <EditorialTab problemId={problemId} />}
                        {leftTab === 'solutions' && <SolutionsTab />}
                        {leftTab === 'submissions' && <SubmissionsTab problemId={problemId} />}
                        {leftTab === 'ai_help' && <AiHelpTab
                            problemTitle={problem?.title}   //yaha props paas ho rha hai 
                            selectedLang={selectedLang}
                            currentCode={currentCode}
                        />}
                        {leftTab === 'videos' && <VideoTab problemId={problemId} />}
                    </div>
                </div>

                {/* ════ RIGHT PANEL ════ */}
                <div className="problem-right-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

                    {/* Right top bar: language selector + reset */}
                    <div className="problem-lang-bar" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '6px 14px',
                        borderBottom: '1px solid var(--tc-border, rgba(100,110,140,0.18))',
                        flexShrink: 0,
                    }}>
                        {/* Language selector */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setLangOpen(prev => !prev)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    background: 'rgba(100,110,140,0.1)',
                                    border: '1px solid rgba(100,110,140,0.2)',
                                    borderRadius: 6, padding: '5px 10px', fontSize: 13, fontWeight: 500,
                                    cursor: 'pointer', color: 'inherit'
                                }}
                                className="hover:bg-base-200"
                            >
                                {selectedLangLabel}
                                <ChevronDown size={13} style={{ opacity: 0.6, transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                            </button>
                            {langOpen && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100,
                                    background: 'var(--dropdown-bg, #1a1a2e)',
                                    border: '1px solid rgba(100,110,140,0.25)', borderRadius: 8,
                                    overflow: 'hidden', minWidth: 140,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                                }}>
                                    {LANGUAGES.map(l => (
                                        <button
                                            key={l.id}
                                            onClick={() => handleLangChange(l.id)}
                                            style={{
                                                display: 'block', width: '100%', textAlign: 'left',
                                                padding: '9px 14px', fontSize: 13, background: 'none',
                                                border: 'none', cursor: 'pointer', color: 'inherit',
                                                fontWeight: selectedLang === l.id ? 600 : 400,
                                                background: selectedLang === l.id ? 'rgba(0,184,163,0.12)' : 'transparent',
                                                color: selectedLang === l.id ? '#00b8a3' : 'inherit',
                                            }}
                                            className="hover:bg-base-200"
                                        >
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reset button */}
                        <button
                            onClick={handleResetCode}
                            title="Reset to starter code"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                background: 'none', border: '1px solid rgba(100,110,140,0.2)',
                                borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', opacity: 0.6, color: 'inherit'
                            }}
                            className="hover:opacity-100 hover:bg-base-200"
                        >
                            <RotateCcw size={12} /> Reset
                        </button>
                    </div>

                    {/* Monaco Editor */}
                    <div className="problem-editor-container" style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                        <Editor
                            height="100%"
                            language={monacoLang}
                            value={currentCode}
                            onChange={handleEditorChange}
                            theme={isDark ? 'vs-dark' : 'vs-light'}
                            onMount={(editor) => { editorRef.current = editor; }}
                            options={{
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                                fontLigatures: true,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                lineNumbers: 'on',
                                glyphMargin: false,
                                folding: true,
                                lineDecorationsWidth: 0,
                                lineNumbersMinChars: 3,
                                renderLineHighlight: 'line',
                                automaticLayout: true,
                                tabSize: 2,
                                wordWrap: 'off',
                                padding: { top: 12, bottom: 12 },
                                scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                                suggestOnTriggerCharacters: true,
                                quickSuggestions: true,
                                bracketPairColorization: { enabled: true },
                            }}
                        />
                    </div>

                    {/* ── Bottom panel: Testcases | Result ──────────────── */}
                    <div className="problem-bottom-panel" style={{
                        height: 220,
                        flexShrink: 0,
                        borderTop: '1px solid var(--tc-border, rgba(100,110,140,0.18))',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}>
                        {/* Bottom tab bar */}
                        <div style={{
                            display: 'flex',
                            borderBottom: '1px solid var(--tc-border, rgba(100,110,140,0.18))',
                            flexShrink: 0,
                        }}>
                            {[
                                { id: 'testcases', label: 'Testcases' },
                                { id: 'result', label: 'Result' },
                            ].map(tab => {
                                const active = rightBottomTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setRightBottomTab(tab.id)}
                                        style={{
                                            padding: '8px 16px', fontSize: 13,
                                            fontWeight: active ? 600 : 400,
                                            border: 'none', background: 'none', cursor: 'pointer',
                                            borderBottom: active ? '2px solid #00b8a3' : '2px solid transparent',
                                            color: active ? '#00b8a3' : 'inherit',
                                            opacity: active ? 1 : 0.55,
                                            transition: 'all 0.15s ease',
                                        }}
                                        className="hover:opacity-100"
                                    >
                                        {tab.label}
                                        {tab.id === 'result' && result && (
                                            <span style={{
                                                marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 10,
                                                background: result?.status?.id === 3 || (result?.status?.description || '').toLowerCase().includes('accepted') ? 'rgba(0,184,163,0.2)' : 'rgba(255,55,95,0.2)',
                                                color: result?.status?.id === 3 || (result?.status?.description || '').toLowerCase().includes('accepted') ? '#00b8a3' : '#ff375f',
                                                fontWeight: 600,
                                            }}>●</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Bottom content */}
                        <div className="problem-bottom-content" style={{ flex: 1, overflowY: 'auto' }}>
                            {rightBottomTab === 'testcases' && (
                                <div style={{ padding: '14px 20px' }}>
                                    {problem.visibleTestCases?.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {problem.visibleTestCases.slice(0, 3).map((tc, i) => (
                                                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                                    <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.5, paddingTop: 2, minWidth: 60 }}>Case {i + 1}</span>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontFamily: 'monospace', fontSize: 12.5, background: 'rgba(100,110,140,0.1)', borderRadius: 6, padding: '8px 10px', marginBottom: 6 }}>
                                                            <div style={{ opacity: 0.5, fontSize: 11, marginBottom: 4, fontWeight: 600 }}>Input:</div>
                                                            <div style={{ whiteSpace: 'pre-wrap' }}>{tc.input}</div>
                                                        </div>
                                                        <div style={{ fontFamily: 'monospace', fontSize: 12.5, background: 'rgba(100,110,140,0.1)', borderRadius: 6, padding: '8px 10px' }}>
                                                            <div style={{ opacity: 0.5, fontSize: 11, marginBottom: 4, fontWeight: 600 }}>Expected Output:</div>
                                                            <div style={{ whiteSpace: 'pre-wrap' }}>{tc.output}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ opacity: 0.4, fontSize: 13 }}>No test cases available.</p>
                                    )}
                                </div>
                            )}
                            {rightBottomTab === 'result' && (
                                <ResultPanel result={result} isRunning={isRunning} isSubmitting={isSubmitting} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Click outside to close language dropdown */}
            {langOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                    onClick={() => setLangOpen(false)}
                />
            )}
        </div>
    );
}
