import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient"
import SubmissionHistory from '../component/SubmissionHistory';
import ChatAi from '../component/AiChatBot';
import Editorial from '../component/Editorial';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { useTheme } from '../context/ThemeContext';
import { Code2, Terminal, AlignLeft, Bot, LayoutTemplate, Play, Send, CheckCircle2, AlertTriangle, BookOpen, FileText, ChevronUp } from 'lucide-react';

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('testcase');
  const editorRef = useRef(null);
  const { problemId } = useParams();
  const { isDark } = useTheme();

  // Mobile detection
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [mobileView, setMobileView] = useState('description');
  const [mobileConsoleOpen, setMobileConsoleOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/admin/fetch/${problemId}`);
        const problemData = response.data;
        setProblem(problemData);

        const foundEntry = problemData?.startcode?.find(
          (sc) => sc.language.toLowerCase() === selectedLanguage.toLowerCase()
        );
        const initialCode = foundEntry?.initialCode;
        if (initialCode) {
          setCode(initialCode);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId, selectedLanguage]);

  useEffect(() => {
    if (problem) {
      const initialCode = problem.startcode.find(sc => sc.language === selectedLanguage)?.initialCode || '';
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    setActiveRightTab('testcase');
    if (!isDesktop) setMobileConsoleOpen(true);

    try {
      const response = await axiosClient.post(`/user/runcode/${problemId}`, {
        code,
        language: selectedLanguage
      });
      setRunResult(response.data);
    } catch (error) {
      setRunResult({ success: false, error: 'Internal server error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    setActiveRightTab('result');
    if (!isDesktop) setMobileConsoleOpen(true);

    try {
      const response = await axiosClient.post(`/user/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });
      setSubmitResult(response.data);
    } catch (error) {
      setSubmitResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50';
      case 'medium': return 'text-amber-400 bg-amber-950/40 border-amber-800/50';
      case 'hard': return 'text-red-400 bg-red-950/40 border-red-800/50';
      default: return 'text-gray-400 bg-gray-800/30 border-gray-700/50';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <span className="loading loading-bars loading-lg text-primary"></span>
      </div>
    );
  }

  /* ─── Shared JSX blocks ─── */

  // Description panel tabs + content (used by both layouts)
  const descriptionPanel = (
    <>
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto bg-slate-800/50 border-b border-slate-700 p-0.5 gap-0.5 shrink-0" style={{ scrollbarWidth: 'none' }}>
        {[
          { id: 'description', label: 'Description', icon: AlignLeft, color: 'text-blue-400' },
          { id: 'editorial', label: 'Editorial', icon: BookOpen, color: 'text-violet-400' },
          { id: 'solutions', label: 'Solutions', icon: LayoutTemplate, color: 'text-cyan-400' },
          { id: 'submissions', label: 'Submissions', icon: Terminal, color: 'text-sky-400' },
          { id: 'aihelp', label: 'AiHelp', icon: Bot, color: 'text-amber-400' }
        ].map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            className={`flex items-center gap-1.5 px-3 md:px-4 py-2.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-200 ${activeLeftTab === id
              ? 'bg-slate-700 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            onClick={() => setActiveLeftTab(id)}
          >
            <Icon size={14} className={activeLeftTab === id ? color : 'opacity-60'} />
            {label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 scroll-smooth bg-slate-900">
        {problem && (
          <div className="animate-in fade-in duration-300">
            {activeLeftTab === 'description' && (
              <div className="max-w-3xl">
                {/* Title and Difficulty */}
                <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{problem.title}</h1>
                  <span className={`px-3 py-1 md:px-4 md:py-2 text-xs font-bold uppercase rounded-full border-2 ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>

                {/* Description */}
                <div className="mb-6 md:mb-8">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                    {problem.description}
                  </p>
                </div>

                {/* Examples */}
                <div className="space-y-3 md:space-y-4">
                  {problem.visibleTestCases.map((example, index) => (
                    <div key={index} className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700 hover:border-slate-600 transition-colors">
                      <div className="bg-slate-800 px-3 md:px-4 py-2 md:py-3 font-semibold text-xs uppercase tracking-wider text-slate-300 border-b border-slate-700">
                        Example {index + 1}
                      </div>
                      <div className="p-3 md:p-4 space-y-3 font-mono text-xs md:text-[13px] text-slate-300">
                        <div>
                          <span className="text-slate-500 select-none">Input:</span>
                          <div className="mt-1 bg-slate-900 p-2 md:p-3 rounded border border-slate-700 text-slate-200 whitespace-pre-wrap break-all">{example.input}</div>
                        </div>
                        <div>
                          <span className="text-slate-500 select-none">Output:</span>
                          <div className="mt-1 bg-slate-900 p-2 md:p-3 rounded border border-slate-700 text-slate-200 whitespace-pre-wrap break-all">{example.output}</div>
                        </div>
                        {example.explanation && (
                          <div>
                            <span className="text-slate-500 select-none">Explanation:</span>
                            <div className="mt-1 bg-slate-900 p-2 md:p-3 rounded border border-slate-700 text-slate-200 whitespace-pre-wrap">{example.explanation}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeLeftTab === 'editorial' && (
              <div className="max-w-3xl">
                <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration} problem={problem}></Editorial>
              </div>
            )}

            {activeLeftTab === 'solutions' && (
              <div className="max-w-3xl space-y-6">
                {problem.refrencesolution?.map((item, index) => (
                  <div key={item._id || index} className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/50 hover:border-slate-600 transition-colors">
                    <div className="bg-slate-800 px-4 py-3 font-medium border-b border-slate-700 flex justify-between items-center">
                      <span className="text-slate-200">Reference Solution</span>
                      <span className="px-3 py-1 text-xs font-semibold bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">{item.language}</span>
                    </div>
                    <pre className="bg-slate-900 p-4 overflow-x-auto text-xs font-mono text-slate-300 max-h-96">
                      <code>{item.solution}</code>
                    </pre>
                  </div>
                )) || <p className="text-slate-500 italic">Solutions will be available after you solve the problem.</p>}
              </div>
            )}

            {activeLeftTab === 'submissions' && (
              <SubmissionHistory problemId={problemId} />
            )}

            {activeLeftTab === 'aihelp' && (
              <ChatAi problem={problem}></ChatAi>
            )}
          </div>
        )}
      </div>
    </>
  );

  // Console content (testcase + result tabs)
  const consoleContent = (
    <>
      {/* Tabs */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 px-3 md:px-4 shrink-0">
        <div className="flex items-center gap-0">
          <button
            className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 text-xs font-medium border-b-2 transition-all duration-200 ${activeRightTab === 'testcase'
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            onClick={() => setActiveRightTab('testcase')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={activeRightTab === 'testcase' ? 'text-emerald-400' : 'text-slate-500'}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Testcase
          </button>
          <div className="text-slate-600 px-2">|</div>
          <button
            className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 text-xs font-medium border-b-2 transition-all duration-200 ${activeRightTab === 'result'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            onClick={() => setActiveRightTab('result')}
          >
            <Terminal size={13} className={activeRightTab === 'result' ? 'text-blue-400' : 'text-slate-500'} />
            Result
          </button>
        </div>
      </div>

      {/* Scrollable Console Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 md:p-4 font-mono text-[13px] bg-slate-950">
        {activeRightTab === 'testcase' && (
          <div className="h-full">
            {!runResult && (
              <div className="text-slate-500 flex items-center justify-center h-full italic text-sm">
                You must run your code first
              </div>
            )}

            {runResult && (
              <div className="animate-in fade-in duration-300 space-y-4">
                <div className={`p-3 md:p-4 rounded-lg flex items-center gap-3 border ${runResult.status_id === 3 ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300' : 'bg-red-950/40 border-red-800/50 text-red-300'}`}>
                  {runResult.status_id === 3 ? <CheckCircle2 size={24} className="text-emerald-400 shrink-0" /> : <AlertTriangle size={24} className="text-red-400 shrink-0" />}
                  <div>
                    <div className="font-bold text-white">{runResult.status_id === 3 ? 'All Tests Passed' : 'Test Failed'}</div>
                    <div className="text-xs opacity-70">Runtime: {runResult.time}s | Memory: {runResult.memory}KB</div>
                  </div>
                </div>
                <div className="space-y-3 pr-2">
                  {runResult.testCases?.map((tc, i) => (
                    <div key={i} className={`border rounded-lg overflow-hidden ${tc.status_id === 3 ? 'border-emerald-800/50 bg-emerald-950/20' : 'border-red-800/50 bg-red-950/20'}`}>
                      <div className={`px-4 py-2 font-bold text-sm ${tc.status_id === 3 ? 'bg-emerald-950/40 text-emerald-300' : 'bg-red-950/40 text-red-300'}`}>
                        Test Case {i + 1} {tc.status_id === 3 ? '✓' : '✗'}
                      </div>
                      <div className="p-3 space-y-2 text-xs">
                        <div>
                          <span className="text-slate-400 block mb-1">Input</span>
                          <div className="bg-slate-900 p-2 rounded border border-slate-800 text-slate-200 overflow-x-auto">{tc.stdin}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-1">Expected</span>
                          <div className="bg-slate-900 p-2 rounded border border-slate-800 text-slate-200 overflow-x-auto">{tc.expected_output}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-1">Output</span>
                          <div className={`p-2 rounded border overflow-x-auto ${tc.stdout ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                            {tc.stdout || "(no output)"}
                          </div>
                        </div>
                        {tc.stderr && (
                          <div>
                            <span className="text-red-400 block mb-1">Error</span>
                            <div className="bg-red-950/30 text-red-300 p-2 rounded border border-red-800/50 whitespace-pre-wrap text-xs overflow-x-auto">{tc.stderr}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeRightTab === 'result' && (
          <div className="h-full">
            {!submitResult && (
              <div className="text-slate-500 flex items-center justify-center h-full italic text-sm">
                Submit your code to see evaluation metrics.
              </div>
            )}
            {submitResult && (
              <div className="animate-in fade-in flex items-center justify-center h-full">
                <div className="max-w-md w-full text-center p-6 md:p-8 bg-slate-800/50 rounded-2xl border border-slate-700">
                  {submitResult.status === "accepted" ? (
                    <>
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-950/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-800/50">
                        <CheckCircle2 size={36} />
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-emerald-400 mb-2">Accepted! 🎉</h2>
                      <p className="text-slate-300 text-sm mb-6">You've successfully solved this problem!</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                          <div className="text-xs text-slate-400 mb-1">Runtime</div>
                          <div className="font-semibold text-white">{submitResult.runtime}s</div>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                          <div className="text-xs text-slate-400 mb-1">Memory</div>
                          <div className="font-semibold text-white">{submitResult.memory}KB</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-red-950/40 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-800/50">
                        <AlertTriangle size={36} />
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-red-400 mb-2">{submitResult.errormessage || "Wrong Answer"}</h2>
                      <p className="text-slate-300 text-sm mb-6">Keep trying! Check the testcases to see where it failed.</p>
                      <div className="inline-block bg-slate-700/50 px-6 py-3 rounded-lg border border-slate-600">
                        Passed: <span className="font-bold text-white">{submitResult.testcasespassed} / {submitResult.totaltestcases}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  // Run + Submit action bar
  const actionBar = (
    <div className="shrink-0 border-t border-slate-700 bg-slate-800/80 backdrop-blur-sm px-3 md:px-4 py-2 md:py-2.5 flex items-center justify-end gap-2">
      <button
        className="flex items-center gap-2 px-3 md:px-4 py-1.5 text-xs font-semibold rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-slate-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleRun}
        disabled={loading}
      >
        {loading && activeRightTab === 'testcase' ? (
          <span className="loading loading-spinner w-3 h-3"></span>
        ) : (
          <Play size={12} className="text-emerald-400 fill-emerald-400" />
        )}
        Run
      </button>
      <button
        className="flex items-center gap-2 px-4 md:px-5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
        onClick={handleSubmitCode}
        disabled={loading}
      >
        {loading && activeRightTab === 'result' ? (
          <span className="loading loading-spinner w-3 h-3"></span>
        ) : (
          <Send size={12} />
        )}
        Submit
      </button>
    </div>
  );


  /* ═══════════════════════════════════════════════
     MOBILE LAYOUT — Tab-based (Description ↔ Code)
     ═══════════════════════════════════════════════ */
  if (!isDesktop) {
    return (
      <div className="h-[calc(100dvh-64px)] flex flex-col bg-slate-950 overflow-hidden text-sm">
        {/* Top: Description / Code toggle */}
        <div className="flex bg-slate-900 border-b border-slate-700 shrink-0">
          <button
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-all ${
              mobileView === 'description'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-500'
            }`}
            onClick={() => setMobileView('description')}
          >
            <FileText size={14} />
            Description
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-all ${
              mobileView === 'code'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-500'
            }`}
            onClick={() => setMobileView('code')}
          >
            <Code2 size={14} />
            Code
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {mobileView === 'description' ? (
            /* ── Full-screen Description ── */
            <div className="flex-1 min-h-0 flex flex-col bg-slate-900">
              {descriptionPanel}
            </div>
          ) : (
            /* ── Code + Console ── */
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Code Editor */}
              <div className={`flex flex-col bg-slate-900 ${mobileConsoleOpen ? 'h-[40%] shrink-0' : 'flex-1 min-h-0'}`}>
                {/* Language bar */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-700 bg-slate-800/50 shrink-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <Code2 size={14} className="text-blue-400" />
                    <span>Code</span>
                  </div>
                  <button
                    className="p-1 rounded-md hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-200"
                    title="Reset code"
                    onClick={() => setCode(problem?.startcode?.find(sc => sc.language === selectedLanguage)?.initialCode || '')}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 .49-3.36" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center px-3 py-1.5 border-b border-slate-700 bg-slate-800/30 shrink-0">
                  <div className="flex bg-slate-800 rounded-lg p-0.5 gap-0.5">
                    {['javascript', 'java', 'cpp'].map((lang) => (
                      <button
                        key={lang}
                        className={`px-3 py-1 text-[11px] rounded-md font-semibold transition-all duration-200 ${selectedLanguage === lang
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                          : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                          }`}
                        onClick={() => setSelectedLanguage(lang)}
                      >
                        {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JS' : 'Java'}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Editor */}
                <div className="flex-1 min-h-0">
                  <Editor
                    height="100%"
                    width="100%"
                    language={getLanguageForMonaco(selectedLanguage)}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme={isDark ? "vs-dark" : "light"}
                    options={{
                      fontSize: 13,
                      minimap: { enabled: false },
                      padding: { top: 8, bottom: 8 },
                      scrollBeyondLastLine: false,
                      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                      tabSize: 2,
                      smoothScrolling: true,
                      cursorSmoothCaretAnimation: "on",
                      automaticLayout: true,
                      wordWrap: 'on',
                      lineNumbersMinChars: 3,
                    }}
                  />
                </div>
              </div>

              {/* Console toggle */}
              <button
                className="shrink-0 flex items-center justify-between px-3 py-2 bg-slate-800 border-y border-slate-700 active:bg-slate-700"
                onClick={() => setMobileConsoleOpen(!mobileConsoleOpen)}
              >
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                  <Terminal size={13} className="text-blue-400" />
                  Console
                </div>
                <ChevronUp size={14} className={`text-slate-500 transition-transform duration-200 ${mobileConsoleOpen ? '' : 'rotate-180'}`} />
              </button>

              {/* Console content (conditional) */}
              {mobileConsoleOpen && (
                <div className="flex-1 min-h-0 flex flex-col bg-slate-900 border-t border-slate-700">
                  {consoleContent}
                </div>
              )}

              {/* Action bar always at bottom */}
              {actionBar}
            </div>
          )}
        </div>
      </div>
    );
  }


  /* ═══════════════════════════════════════
     DESKTOP LAYOUT — Your original layout
     ═══════════════════════════════════════ */
  return (
    <div className="h-[calc(100vh-65px)] bg-slate-950 p-2 overflow-hidden text-sm">
      <PanelGroup direction="horizontal" className="rounded-xl overflow-hidden border border-slate-800 shadow-2xl">

        {/* Left Panel: Description & Details */}
        <Panel defaultSize={45} minSize={30}>
          <div className="h-full bg-slate-900 flex flex-col">
            {descriptionPanel}
          </div>
        </Panel>

        {/* Vertical Resize Handle */}
        <PanelResizeHandle className="w-1 bg-slate-700 hover:bg-blue-500/50 transition-colors cursor-col-resize relative group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 rounded-full bg-slate-600 group-hover:bg-blue-400 transition-colors"></div>
        </PanelResizeHandle>

        {/* Right Panel: Code & Console */}
        <Panel defaultSize={55} minSize={30}>
          <div className="h-full flex flex-col bg-slate-900">
            <PanelGroup direction="vertical" className="h-full">
              {/* Code Editor Panel */}
              <Panel defaultSize={65} minSize={20}>
                <div className="h-full bg-slate-900 flex flex-col border-b border-slate-700">

                  {/* Code Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50 shrink-0">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <Code2 size={16} className="text-blue-400" />
                      <span>Code</span>
                    </div>
                    <button
                      className="p-1.5 rounded-md hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-200"
                      title="Reset code"
                      onClick={() => setCode(problem?.startcode?.find(sc => sc.language === selectedLanguage)?.initialCode || '')}
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 .49-3.36" />
                      </svg>
                    </button>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700 bg-slate-800/30 shrink-0">
                    <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
                      {['javascript', 'java', 'cpp'].map((lang) => (
                        <button
                          key={lang}
                          className={`px-4 py-1.5 text-xs rounded-md font-semibold transition-all duration-200 ${selectedLanguage === lang
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                            }`}
                          onClick={() => setSelectedLanguage(lang)}
                        >
                          {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JS' : 'Java'}
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Auto
                    </div>
                  </div>

                  {/* Monaco Editor */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <Editor
                      height="100%"
                      language={getLanguageForMonaco(selectedLanguage)}
                      value={code}
                      onChange={handleEditorChange}
                      onMount={handleEditorDidMount}
                      theme={isDark ? "vs-dark" : "light"}
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        padding: { top: 16, bottom: 16 },
                        scrollBeyondLastLine: false,
                        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                        tabSize: 2,
                        smoothScrolling: true,
                        cursorSmoothCaretAnimation: "on",
                        automaticLayout: true,
                        contextmenu: true,
                      }}
                    />
                  </div>
                </div>
              </Panel>

              {/* Horizontal Resize Handle */}
              <PanelResizeHandle className="h-1 bg-slate-700 hover:bg-blue-500/50 transition-colors cursor-row-resize relative group shrink-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-12 rounded-full bg-slate-600 group-hover:bg-blue-400 transition-colors"></div>
              </PanelResizeHandle>

              {/* Console/Results Panel */}
              <Panel defaultSize={35} minSize={10}>
                <div className="h-full bg-slate-900 flex flex-col border-t border-slate-700">
                  {consoleContent}
                  {actionBar}
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default ProblemPage;