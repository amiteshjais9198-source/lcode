import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Reusable problem table — same look everywhere in the app
function ProblemTable({ problems, solvedIds = [], loading = false, emptyMessage = 'No problems found.' }) {
    const navigate = useNavigate();

    const isSolved = (id) => solvedIds.includes(id);

    const diffColor = (d) => {
        if (d === 'easy')   return 'text-[#00b8a3]';
        if (d === 'medium') return 'text-[#ffc01e]';
        if (d === 'hard')   return 'text-[#ff375f]';
        return 'text-base-content/50';
    };

    const diffBg = (d) => {
        if (d === 'easy')   return 'bg-[#00b8a3]/10';
        if (d === 'medium') return 'bg-[#ffc01e]/10';
        if (d === 'hard')   return 'bg-[#ff375f]/10';
        return '';
    };

    if (loading) {
        return (
            <div className="bg-base-100 rounded-xl border border-base-300 overflow-hidden">
                <div className="py-20 flex flex-col items-center gap-3 text-base-content/30">
                    <span className="loading loading-spinner loading-md" />
                    <span className="text-sm">Loading problems...</span>
                </div>
            </div>
        );
    }

    if (problems.length === 0) {
        return (
            <div className="bg-base-100 rounded-xl border border-base-300 overflow-hidden">
                <div className="py-16 text-center text-sm text-base-content/30">
                    {emptyMessage}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-base-100 rounded-xl border border-base-300 overflow-hidden shadow-sm">
            <table className="table w-full">
                <thead>
                    <tr className="bg-base-200/60 text-[11px] text-base-content/40 uppercase tracking-wide border-b border-base-300">
                        <th className="w-10 text-center font-semibold py-3 px-4"></th>
                        <th className="font-semibold py-3 w-10">#</th>
                        <th className="font-semibold py-3">Title</th>
                        <th className="font-semibold py-3">Tags</th>
                        <th className="font-semibold py-3 text-right pr-6">Difficulty</th>
                    </tr>
                </thead>
                <tbody>
                    {problems.map((p, i) => {
                        const solved = isSolved(p._id || p.id);
                        return (
                            <tr
                                key={p._id || p.id || i}
                                onClick={() => navigate(`/problem/${p._id || p.id}`)}
                                className="border-b border-base-200 last:border-0 hover:bg-primary/[0.03] cursor-pointer transition-colors group"
                            >
                                {/* Solved status */}
                                <td className="text-center px-4 py-3.5">
                                    {solved
                                        ? <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                                        : <div className="w-4 h-4 rounded-full border-[1.5px] border-base-300 mx-auto group-hover:border-primary/40 transition-colors" />
                                    }
                                </td>

                                {/* Row number */}
                                <td className="text-[12px] text-base-content/25 py-3.5">{i + 1}</td>

                                {/* Title */}
                                <td className="py-3.5">
                                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                        {p.title}
                                    </span>
                                </td>

                                {/* Tags */}
                                <td className="py-3.5">
                                    <div className="flex gap-1.5 flex-wrap">
                                        {p.tags?.slice(0, 3).map(tag => (
                                            <span
                                                key={tag}
                                                className="text-[11px] px-2 py-0.5 rounded-full bg-base-200 text-base-content/50 capitalize"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {p.tags?.length > 3 && (
                                            <span className="text-[11px] text-base-content/30">+{p.tags.length - 3}</span>
                                        )}
                                    </div>
                                </td>

                                {/* Difficulty */}
                                <td className="py-3.5 text-right pr-6">
                                    <span className={`text-xs font-bold capitalize px-2.5 py-1 rounded-full ${diffColor(p.difficulty)} ${diffBg(p.difficulty)}`}>
                                        {p.difficulty}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default ProblemTable;
