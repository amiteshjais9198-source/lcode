import React from 'react';
import { useSelector } from 'react-redux';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProblemTable from '../components/ProblemTable';

function Profilepage() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const solved     = user?.problemSolved?.length || 0;
    const total      = user?.totalProblems || 0;
    const percent    = total ? Math.round((solved / total) * 100) : 0;
    const solvedIds  = user?.problemSolved?.map(p => p._id || p.id) || [];

    return (
        <div className="min-h-screen bg-base-200/40 py-8">
            <div className="max-w-3xl mx-auto px-4 space-y-4">

                {/* Profile card */}
                <div className="bg-base-100 rounded-xl border border-base-300 shadow-sm overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-[#00b8a3] to-[#00d4bc]" />
                    <div className="p-6 flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-primary text-primary-content flex items-center justify-center text-2xl font-extrabold shrink-0">
                            {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-bold">{user?.firstName || 'User'}</h1>
                            <p className="text-xs text-base-content/40 flex items-center gap-1 mt-1">
                                <Mail className="w-3 h-3 shrink-0" /> {user?.emailId}
                            </p>
                        </div>
                        <div className="text-center shrink-0">
                            <div className="text-3xl font-extrabold text-primary leading-none">{solved}</div>
                            <div className="text-[10px] text-base-content/40 mt-1 uppercase font-semibold tracking-wide">Solved</div>
                        </div>
                    </div>
                </div>

                {/* Progress */}
                <div className="bg-base-100 rounded-xl border border-base-300 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-2.5">
                        <span className="text-sm font-semibold">Overall Progress</span>
                        <span className="text-sm font-bold text-primary">{percent}%</span>
                    </div>
                    <progress className="progress progress-primary w-full h-2.5" value={solved} max={total || 1} />
                    <div className="flex justify-between text-xs text-base-content/35 mt-2">
                        <span>{solved} solved</span>
                        <span>{total} total</span>
                    </div>

                    {/* Easy / Medium / Hard breakdown */}
                    <div className="grid grid-cols-3 gap-3 mt-5">
                        {[
                            { label: 'Easy',   color: '#00b8a3', count: user?.problemSolved?.filter(p => p.difficulty === 'easy').length   || 0 },
                            { label: 'Medium', color: '#ffc01e', count: user?.problemSolved?.filter(p => p.difficulty === 'medium').length || 0 },
                            { label: 'Hard',   color: '#ff375f', count: user?.problemSolved?.filter(p => p.difficulty === 'hard').length   || 0 },
                        ].map(({ label, color, count }) => (
                            <div key={label} className="bg-base-200/50 rounded-lg p-3 text-center border border-base-300">
                                <div className="text-2xl font-extrabold leading-none" style={{ color }}>{count}</div>
                                <div className="text-[11px] text-base-content/40 mt-1 font-medium">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Solved problems — same ProblemTable used on homepage */}
                <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h2 className="text-sm font-semibold text-base-content/70">Solved Problems</h2>
                        <span className="badge badge-sm bg-primary/10 text-primary border-none font-semibold">{solved}</span>
                    </div>

                    {solved > 0 ? (
                        <ProblemTable
                            problems={user.problemSolved}
                            solvedIds={solvedIds}
                            emptyMessage="No problems solved yet."
                        />
                    ) : (
                        <div className="bg-base-100 rounded-xl border border-base-300 py-14 text-center">
                            <p className="text-sm text-base-content/40 mb-3">No problems solved yet.</p>
                            <button className="btn btn-primary btn-sm" onClick={() => navigate('/')}>
                                Browse Problems
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default Profilepage;
