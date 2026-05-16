import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';
import { Trophy, ArrowRight, CheckCircle2, Search, Filter, Sparkles, Terminal, Flame, Target, Zap } from 'lucide-react';

const HomePage = () => {
  const [problems, setProblems] = useState([]);
  const [solvedIds, setSolvedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const directoryRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [problemsRes, solvedRes] = await Promise.all([
          axiosClient.get('/admin/fetchAll/1/50'),
          axiosClient.get('/admin/solvedByUser'),
        ]);
        setProblems(problemsRes.data || []);
        const solved = new Set((solvedRes.data || []).map((p) => p._id));
        setSolvedIds(solved);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProblems = useMemo(() => {
    return problems.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [problems, searchQuery]);

  const scrollToDirectory = () => {
    directoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'text-success bg-success/10 border-success/20',
      medium: 'text-warning bg-warning/10 border-warning/20',
      hard: 'text-error bg-error/10 border-error/20'
    };
    return colors[difficulty?.toLowerCase()] || 'text-gray-500 bg-gray-500/10 border-gray-500/20';
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return <Zap size={12} />;
      case 'medium': return <Flame size={12} />;
      case 'hard': return <Target size={12} />;
      default: return null;
    }
  };

  const solvedCount = solvedIds.size;
  const totalCount = problems.length;
  const progressPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  // Stats breakdown
  const easyCount = problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length;
  const mediumCount = problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length;
  const hardCount = problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length;

  return (
    <div className="min-h-screen bg-base-200/30 pb-20">
      {/* ── Hero Section ── */}
      <div className="relative bg-base-100 pt-12 pb-28 border-b border-base-200/50 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 -mt-32 -mr-32 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-32 -ml-32 w-[400px] h-[400px] bg-accent/6 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/4 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider animate-fade-in-up">
            <Sparkles size={14} />
            Powered by JDoodle Engine
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-base-content mb-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Master Your{' '}
            <span className="gradient-text">Code.</span>
          </h1>
          <p className="text-base md:text-lg text-base-content/50 mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Solve hand-picked algorithmic challenges, get AI-powered hints, and track your progress — all in one place.
          </p>

          {/* Stats Cards */}
          {!loading && (
            <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 w-full max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {/* Progress Card */}
              <div className="flex-1 bg-base-100 border border-base-200/60 shadow-xl rounded-2xl p-6 text-left hover-lift">
                <div className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-base-content/35 mb-3">Your Progress</div>
                <div className="flex items-end gap-3 mb-4">
                  <div className="text-4xl font-black gradient-text font-mono">{solvedCount}</div>
                  <div className="text-xs font-bold text-base-content/40 mb-1.5">/ {totalCount} solved</div>
                </div>
                <div className="w-full bg-base-200 h-2 rounded-full overflow-hidden mb-4">
                  <div
                    className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="flex gap-4 text-xs font-semibold">
                  <span className="text-success flex items-center gap-1"><Zap size={11} /> {easyCount} Easy</span>
                  <span className="text-warning flex items-center gap-1"><Flame size={11} /> {mediumCount} Med</span>
                  <span className="text-error flex items-center gap-1"><Target size={11} /> {hardCount} Hard</span>
                </div>
              </div>

              {/* CTA Card */}
              <button
                onClick={scrollToDirectory}
                className="flex-1 btn btn-primary h-auto py-8 text-xl shadow-primary/25 shadow-2xl group rounded-2xl border-none bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="font-extrabold text-lg">Start Solving</span>
                  <span className="text-xs font-medium opacity-70">Browse {totalCount} challenges</span>
                </div>
                <ArrowRight className="group-hover:translate-x-1 transition-transform ml-3" size={24} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Problem Directory ── */}
      <div ref={directoryRef} className="max-w-6xl mx-auto p-4 md:p-8 -mt-12 relative z-20">
        <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-200/50 overflow-hidden">

          {/* Sticky Header */}
          <div className="p-5 md:p-6 border-b border-base-200/50 bg-base-100/90 backdrop-blur-xl sticky top-16 z-30">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Terminal className="text-primary" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight">Challenge Directory</h2>
                  <p className="text-[10px] font-bold text-base-content/35 uppercase tracking-[0.15em]">
                    {filteredProblems.length} problems available
                  </p>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <div className="relative group flex-1 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/25 group-focus-within:text-primary transition-colors" size={15} />
                  <input
                    type="text"
                    placeholder="Search problems..."
                    className="input input-sm w-full pl-9 bg-base-200/40 border-base-200/60 focus:border-primary/40 focus:bg-base-100 rounded-xl h-9 text-sm transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex bg-base-200/40 rounded-xl p-0.5 items-center px-2 gap-1 overflow-x-auto no-scrollbar border border-base-200/40">
                  <Filter size={13} className="text-base-content/25 shrink-0 mr-1" />
                  {['All', 'Array', 'String', 'Dp', 'Tree', 'Graph'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (tag === 'All') { setSearchQuery(''); setActiveFilter(''); }
                        else { setSearchQuery(tag === activeFilter ? '' : tag); setActiveFilter(tag === activeFilter ? '' : tag); }
                      }}
                      className={`btn btn-xs rounded-lg border-none shadow-none text-[11px] font-semibold whitespace-nowrap ${
                        (tag === 'All' && !activeFilter) || activeFilter === tag
                          ? 'bg-primary text-primary-content'
                          : 'bg-transparent text-base-content/50 hover:bg-base-300/60'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center p-24">
                <span className="loading loading-ring loading-lg text-primary"></span>
              </div>
            ) : (
              <table className="table table-lg w-full">
                <thead>
                  <tr className="text-base-content/25 uppercase text-[10px] tracking-[0.15em] font-extrabold border-none">
                    <th className="w-20 text-center">Status</th>
                    <th>Title</th>
                    <th className="w-28">Difficulty</th>
                    <th>Topics</th>
                  </tr>
                </thead>
                <tbody className="text-base-content/75">
                  {filteredProblems.length > 0 ? (
                    filteredProblems.map((prob, idx) => {
                      const isSolved = solvedIds.has(prob._id);
                      return (
                        <tr
                          key={prob._id}
                          className="hover:bg-primary/[0.03] transition-all cursor-pointer group border-base-200/30 animate-fade-in-up"
                          style={{ animationDelay: `${idx * 0.03}s` }}
                          onClick={() => navigate(`/problem/${prob._id}`)}
                        >
                          <td className="text-center">
                            {isSolved ? (
                              <CheckCircle2 className="text-success w-5 h-5 mx-auto drop-shadow-sm" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-base-content/10 mx-auto group-hover:border-primary/40 transition-colors"></div>
                            )}
                          </td>
                          <td className="font-bold text-sm group-hover:text-primary transition-colors py-5">
                            {prob.title}
                          </td>
                          <td>
                            <div className={`inline-flex items-center gap-1 badge badge-sm border py-2 px-2.5 font-bold uppercase text-[10px] ${getDifficultyColor(prob.difficulty)}`}>
                              {getDifficultyIcon(prob.difficulty)}
                              {prob.difficulty}
                            </div>
                          </td>
                          <td>
                            <div className="flex flex-wrap gap-1">
                              {prob.tags?.split(',').map((tag, i) => (
                                <span key={i} className="badge badge-ghost badge-xs text-[9px] font-bold uppercase opacity-40">{tag.trim()}</span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-32">
                        <div className="flex flex-col items-center gap-3 opacity-25">
                          <Search size={48} />
                          <p className="font-bold uppercase tracking-widest text-xs">No matching problems</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;