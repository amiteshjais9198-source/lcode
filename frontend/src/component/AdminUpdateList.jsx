import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Edit3, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const AdminUpdateList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosClient.get(`/admin/fetchAll/1/10?t=${new Date().getTime()}`);
      setProblems(data);
    } catch (err) {
      setError('Failed to fetch problems. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-success bg-success/10 border-success/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'hard': return 'text-error bg-error/10 border-error/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[calc(100vh-100px)]">
      <span className="loading loading-ring loading-lg text-primary"></span>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-65px)] bg-base-200/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200">
          <div>
            <button onClick={() => navigate('/admin')} className="btn btn-ghost btn-sm gap-2 mb-2 px-0 hover:bg-transparent text-base-content/60">
              <ArrowLeft size={16} /> Back to Admin Panel
            </button>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Edit3 className="text-warning" /> Update Problems
            </h1>
            <p className="text-base-content/60 mt-1">Select a problem from the directory to modify its contents and test cases.</p>
          </div>
          <button onClick={fetchProblems} className="btn btn-outline gap-2 shadow-sm">
            <RefreshCw size={16} /> Refresh List
          </button>
        </div>

        {error && (
          <div className="alert alert-error shadow-lg mb-6 rounded-xl">
            <AlertCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Table Container */}
        <div className="bg-base-100 rounded-2xl shadow-xl shadow-base-content/5 border border-base-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-base-200/50 text-base-content/70">
                  <th className="w-16 text-center">#</th>
                  <th className="text-base font-semibold">Title</th>
                  <th className="text-base font-semibold w-32">Difficulty</th>
                  <th className="text-base font-semibold">Tags</th>
                  <th className="text-center text-base font-semibold w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="text-base-content/80">
                {problems.map((problem, index) => (
                  <tr key={problem._id} className="hover:bg-base-200/50 transition-colors">
                    <th className="text-center font-normal opacity-50">{index + 1}</th>
                    <td className="font-semibold text-base">{problem.title}</td>
                    <td>
                      <span className={`badge badge-sm border py-2 px-3 font-medium ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td>
                      {problem.tags ? (
                        <div className="flex flex-wrap gap-1">
                          {problem.tags.split(',').map((tag, i) => (
                            <span key={i} className="badge badge-ghost badge-sm bg-base-200 border-none text-xs">{tag.trim()}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-base-content/30 text-sm italic">None</span>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => navigate(`/admin/update/${problem._id}`)}
                        className="btn btn-sm btn-warning btn-outline gap-2 w-full"
                      >
                        <Edit3 size={14} /> Update
                      </button>
                    </td>
                  </tr>
                ))}
                {problems.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-base-content/50 italic">
                      No problems found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUpdateList;