import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import axiosClient from '../utilis/axiosClient';
import ProblemTable from '../components/ProblemTable';

function Homepage() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [topicFilter, setTopicFilter] = useState('All Topics');
    const { user } = useSelector((state) => state.auth);

    const solvedIds = user?.problemSolved?.map(sp => sp._id || sp.id) || [];

    const filtered = problems.filter((p) => {
        const matchSearch   = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchTopic    = topicFilter === 'All Topics' || p.tags?.some(t => t.toLowerCase() === topicFilter.toLowerCase());
        const matchDiff     = difficultyFilter === 'All'   || p.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();
        const solved        = solvedIds.includes(p._id);
        const matchStatus   = statusFilter === 'All' || (statusFilter === 'Solved' ? solved : !solved);
        return matchSearch && matchTopic && matchDiff && matchStatus;
    });

    useEffect(() => {
        axiosClient.get('/problem/getallproblems')
            .then(res => { if (res.data.success) setProblems(res.data.data); })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const solvedCount = solvedIds.length;
    const totalCount  = problems.length;

    return (
        <div className="min-h-screen bg-base-200/40">
            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-7">
                    <div>
                        <h1 className="text-xl font-bold">Problem Set</h1>
                        <p className="text-sm text-base-content/40 mt-0.5">
                            {totalCount} problems · {solvedCount} solved
                        </p>
                    </div>

                    {/* Progress pill */}
                    {totalCount > 0 && (
                        <div className="flex items-center gap-3 bg-base-100 border border-base-300 rounded-xl px-4 py-2.5 shadow-sm">
                            <div className="text-right">
                                <div className="text-xl font-extrabold text-primary leading-none">{solvedCount}</div>
                                <div className="text-[10px] text-base-content/40 mt-0.5">of {totalCount}</div>
                            </div>
                            <div className="w-24 h-2 bg-base-300 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-700"
                                    style={{ width: `${totalCount ? (solvedCount / totalCount) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between mb-5">
                    <div className="flex flex-row flex-nowrap gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                        <select
                            className="select select-bordered select-sm bg-base-100"
                            value={topicFilter}
                            onChange={e => setTopicFilter(e.target.value)}
                        >
                            {['All Topics', 'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math', 'Two Pointers', 'Binary Search'].map(t => (
                                <option key={t}>{t}</option>
                            ))}
                        </select>

                        <select
                            className="select select-bordered select-sm bg-base-100"
                            value={difficultyFilter}
                            onChange={e => setDifficultyFilter(e.target.value)}
                        >
                            <option value="All">Difficulty</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>

                        <select
                            className="select select-bordered select-sm bg-base-100"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Solved">Solved</option>
                            <option value="Unsolved">Unsolved</option>
                        </select>
                    </div>

                    <label className="input input-bordered input-sm flex items-center gap-2 bg-base-100 w-56">
                        <Search className="w-3.5 h-3.5 shrink-0 text-base-content/40" />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            className="grow bg-transparent outline-none text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </label>
                </div>

                {/* Problem table — same component used everywhere */}
                <ProblemTable
                    problems={filtered}
                    solvedIds={solvedIds}
                    loading={loading}
                    emptyMessage="No problems match your filters."
                />

                {!loading && (
                    <p className="text-xs text-center text-base-content/20 mt-3">
                        Showing {filtered.length} of {totalCount} problems
                    </p>
                )}
            </div>
        </div>
    );
}

export default Homepage;