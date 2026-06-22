import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utilis/axiosClient';
import { Plus, Trash2, Pencil, RefreshCw, AlertCircle } from 'lucide-react';

const TAGS = ['array', 'recursion', 'linked list', 'queue', 'tree', 'graph'];
const LANGS = ['python', 'c++', 'java'];

// Map display labels to what backend expects
const LANG_LABELS = { 'python': 'Python', 'c++': 'C++', 'java': 'Java' };

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string()).min(1, 'Select at least one tag'),
  visibleTestCases: z.array(z.object({
    input: z.string().min(1, 'Required'),
    output: z.string().min(1, 'Required'),
    explanation: z.string().min(1, 'Required'),
  })).min(1),
  hiddenTestCases: z.array(z.object({
    input: z.string().min(1, 'Required'),
    output: z.string().min(1, 'Required'),
  })).min(1),
  startCode: z.array(z.object({
    language: z.string(),
    initialCode: z.string(),
  })),
  referenceSolution: z.array(z.object({
    language: z.string(),
    completeCode: z.string(),
  })),
});

const defaultValues = {
  title: '', description: '', difficulty: 'easy', tags: [],
  visibleTestCases: [{ input: '', output: '', explanation: '' }],
  hiddenTestCases: [{ input: '', output: '' }],
  startCode: LANGS.map(l => ({ language: l, initialCode: '' })),
  referenceSolution: LANGS.map(l => ({ language: l, completeCode: '' })),
};

// ─── Shared form fields ───────────────────────────────────────────────
function ProblemForm({ onSubmit, defaultVals, isSubmitting, submitLabel, onCancel }) {
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: defaultVals || defaultValues,
  });

  const { fields: visFields, append: addVis, remove: rmVis } = useFieldArray({ control, name: 'visibleTestCases' });
  const { fields: hidFields, append: addHid, remove: rmHid } = useFieldArray({ control, name: 'hiddenTestCases' });

  const selectedTags = watch('tags') || [];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setValue('tags', selectedTags.filter(t => t !== tag));
    } else {
      setValue('tags', [...selectedTags, tag]);
    }
  };

  const submit = (data) => {
    const filtered = {
      ...data,
      startCode: data.startCode.filter(s => s.initialCode.trim()),
      referenceSolution: data.referenceSolution.filter(r => r.completeCode.trim()),
    };
    onSubmit(filtered);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">

      {/* Basic Info */}
      <div className="bg-base-100 border border-base-300 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-base border-b border-base-300 pb-3">Basic Info</h3>

        <div className="form-control">
          <label className="label py-1"><span className="label-text font-medium">Title</span></label>
          <input {...register('title')} placeholder="e.g. Two Sum" className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`} />
          {errors.title && <span className="text-error text-xs mt-1">{errors.title.message}</span>}
        </div>

        <div className="form-control">
          <label className="label py-1"><span className="label-text font-medium">Description</span></label>
          <textarea {...register('description')} placeholder="Problem description..." className={`textarea textarea-bordered h-32 w-full ${errors.description ? 'textarea-error' : ''}`} />
          {errors.description && <span className="text-error text-xs mt-1">{errors.description.message}</span>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label py-1"><span className="label-text font-medium">Difficulty</span></label>
            <select {...register('difficulty')} className="select select-bordered w-full">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label py-1"><span className="label-text font-medium">Tags</span></label>
            <div className="flex flex-wrap gap-2 mt-1">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`badge badge-md cursor-pointer capitalize transition-all ${selectedTags.includes(tag) ? 'badge-primary' : 'badge-ghost'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {errors.tags && <span className="text-error text-xs mt-1">{errors.tags.message}</span>}
          </div>
        </div>
      </div>

      {/* Visible Test Cases */}
      <div className="bg-base-100 border border-base-300 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-base-300 pb-3">
          <div>
            <h3 className="font-semibold text-base">Visible Test Cases</h3>
            <p className="text-xs text-base-content/50 mt-0.5">Shown to users as examples</p>
          </div>
          <button type="button" onClick={() => addVis({ input: '', output: '', explanation: '' })} className="btn btn-sm btn-outline gap-1">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {visFields.map((f, i) => (
          <div key={f.id} className="bg-base-200/50 border border-base-300 rounded-lg p-4 relative group">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-base-content/50 uppercase">Example {i + 1}</span>
              {visFields.length > 1 && (
                <button type="button" onClick={() => rmVis(i)} className="btn btn-xs btn-ghost text-error opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label py-0.5"><span className="label-text-alt">Input</span></label>
                <textarea {...register(`visibleTestCases.${i}.input`)} className="textarea textarea-bordered textarea-sm font-mono h-20" placeholder="e.g. 4\n1 3 5 6\n5" />
              </div>
              <div className="form-control">
                <label className="label py-0.5"><span className="label-text-alt">Output</span></label>
                <textarea {...register(`visibleTestCases.${i}.output`)} className="textarea textarea-bordered textarea-sm font-mono h-20" placeholder="e.g. 2" />
              </div>
              <div className="form-control col-span-2">
                <label className="label py-0.5"><span className="label-text-alt">Explanation</span></label>
                <textarea {...register(`visibleTestCases.${i}.explanation`)} className="textarea textarea-bordered textarea-sm" placeholder="Explain the output..." />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hidden Test Cases */}
      <div className="bg-base-100 border border-base-300 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-base-300 pb-3">
          <div>
            <h3 className="font-semibold text-base">Hidden Test Cases</h3>
            <p className="text-xs text-base-content/50 mt-0.5">Used by the evaluator, hidden from users</p>
          </div>
          <button type="button" onClick={() => addHid({ input: '', output: '' })} className="btn btn-sm btn-outline gap-1">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {hidFields.map((f, i) => (
            <div key={f.id} className="bg-base-200/50 border border-base-300 rounded-lg p-3 relative group">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-base-content/50 uppercase">Case {i + 1}</span>
                {hidFields.length > 1 && (
                  <button type="button" onClick={() => rmHid(i)} className="btn btn-xs btn-ghost text-error opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <textarea {...register(`hiddenTestCases.${i}.input`)} className="textarea textarea-bordered textarea-sm font-mono w-full mb-2 h-20" placeholder="Input" />
              <textarea {...register(`hiddenTestCases.${i}.output`)} className="textarea textarea-bordered textarea-sm font-mono w-full h-20" placeholder="Expected Output" />
            </div>
          ))}
        </div>
      </div>

      {/* Code Templates */}
      <div className="bg-base-100 border border-base-300 rounded-xl p-6 space-y-4">
        <div className="border-b border-base-300 pb-3">
          <h3 className="font-semibold text-base">Code Templates</h3>
          <p className="text-xs text-base-content/50 mt-0.5">At least 1 language needs starter code + reference solution</p>
        </div>

        {LANGS.map((lang, i) => (
          <div key={lang} className="border border-base-300 rounded-lg overflow-hidden">
            <div className="bg-base-200/70 px-4 py-2 border-b border-base-300">
              <span className="font-semibold text-sm">{LANG_LABELS[lang]}</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-base-300 bg-[#1e1e1e]">
              <div>
                <div className="px-3 py-1.5 bg-[#252526] text-gray-400 text-xs border-b border-[#333]">Starter Code</div>
                <textarea
                  {...register(`startCode.${i}.initialCode`)}
                  className="w-full h-40 bg-transparent text-gray-200 p-3 font-mono text-sm resize-none focus:outline-none focus:bg-[#252526] transition-colors"
                  placeholder={`// ${LANG_LABELS[lang]} starter code`}
                  spellCheck={false}
                />
              </div>
              <div>
                <div className="px-3 py-1.5 bg-[#252526] text-gray-400 text-xs border-b border-[#333]">Reference Solution</div>
                <textarea
                  {...register(`referenceSolution.${i}.completeCode`)}
                  className="w-full h-40 bg-transparent text-gray-200 p-3 font-mono text-sm resize-none focus:outline-none focus:bg-[#252526] transition-colors"
                  placeholder={`// ${LANG_LABELS[lang]} solution`}
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit row */}
      <div className="flex justify-end gap-3 pb-8">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-ghost">Cancel</button>
        )}
        <button type="submit" disabled={isSubmitting} className="btn btn-primary px-8">
          {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : submitLabel}
        </button>
      </div>
    </form>
  );
}


// ─── Main Admin Page ──────────────────────────────────────────────────
function Adminpage() {
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit'
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [toast, setToast] = useState(null); // { msg, type }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProblems = async () => {
    setLoadingProblems(true);
    try {
      const res = await axiosClient.get('/problem/getallproblems');
      if (res.data.success) setProblems(res.data.data);
    } catch (e) {
      showToast('Failed to load problems', 'error');
    } finally {
      setLoadingProblems(false);
    }
  };

  useEffect(() => { fetchProblems(); }, []);

  // ── Create ───────────────────────────────────────────────────────
  const handleCreate = async (data) => {
    setIsSubmitting(true);
    try {
      await axiosClient.post('/problem/create', data);
      showToast('Problem created successfully!');
      setView('list');
      fetchProblems();
    } catch (e) {
      showToast(e.response?.data?.message || 'Error creating problem', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Update ───────────────────────────────────────────────────────
  const handleUpdate = async (data) => {
    setIsSubmitting(true);
    try {
      await axiosClient.patch(`/problem/update/${selectedProblem._id}`, data);
      showToast('Problem updated!');
      setView('list');
      fetchProblems();
    } catch (e) {
      showToast(e.response?.data?.message || 'Error updating problem', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await axiosClient.delete(`/problem/delete/${id}`);
      showToast('Problem deleted');
      fetchProblems();
    } catch (e) {
      showToast('Error deleting problem', 'error');
    }
  };

  // ── Open edit: fetch full problem first ──────────────────────────
  const openEdit = async (problem) => {
    try {
      const res = await axiosClient.get(`/problem/admin/getbyid/${problem._id}`);
      if (res.data.success) {
        const p = res.data.data;
        // Normalise startCode and referenceSolution to match all 4 langs
        const mergeCode = (arr, field) =>
          LANGS.map(lang => {
            const found = arr?.find(s => s.language === lang);
            return { language: lang, [field]: found?.[field] || '' };
          });

        setSelectedProblem({
          ...p,
          startCode: mergeCode(p.startCode, 'initialCode'),
          referenceSolution: mergeCode(p.referenceSolution, 'completeCode'),
        });
        setView('edit');
      }
    } catch (e) {
      showToast('Could not load problem details', 'error');
    }
  };

  const diffBadge = (d) => {
    if (d === 'easy') return 'badge-success';
    if (d === 'medium') return 'badge-warning';
    if (d === 'hard') return 'badge-error';
    return '';
  };

  // ── RENDER ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-base-200/30">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Toast */}
        {toast && (
          <div className={`toast toast-top toast-end z-50`}>
            <div className={`alert ${toast.type === 'error' ? 'alert-error' : 'alert-success'} shadow-lg`}>
              <span>{toast.msg}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {view === 'list' ? 'Problem Management' : view === 'create' ? 'Create Problem' : 'Edit Problem'}
            </h1>
            <p className="text-sm text-base-content/50 mt-0.5">
              {view === 'list' ? 'Manage all problems on the platform' : view === 'create' ? 'Fill in the details to publish a new problem' : `Editing: ${selectedProblem?.title}`}
            </p>
          </div>
          {view === 'list' ? (
            <div className="flex gap-2">
              <button onClick={fetchProblems} className="btn btn-sm btn-ghost gap-1">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={() => setView('create')} className="btn btn-sm btn-primary gap-1">
                <Plus className="w-4 h-4" /> New Problem
              </button>
            </div>
          ) : (
            <button onClick={() => setView('list')} className="btn btn-sm btn-ghost">← Back</button>
          )}
        </div>

        {/* ── Problem List ─────────────────────────────────── */}
        {view === 'list' && (
          <div className="bg-base-100 rounded-xl border border-base-300 overflow-hidden">
            {loadingProblems ? (
              <div className="py-20 text-center text-base-content/40">
                <span className="loading loading-spinner loading-md block mx-auto mb-2" />
                Loading problems...
              </div>
            ) : problems.length === 0 ? (
              <div className="py-20 text-center text-base-content/40">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No problems yet.</p>
                <button onClick={() => setView('create')} className="btn btn-primary btn-sm mt-4">Create First Problem</button>
              </div>
            ) : (
              <table className="table w-full">
                <thead className="bg-base-200/60 text-xs text-base-content/50 uppercase">
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Difficulty</th>
                    <th>Tags</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((p, i) => (
                    <tr key={p._id} className="border-b border-base-200 last:border-0 hover:bg-base-200/30 transition-colors">
                      <td className="text-base-content/30 text-sm w-10">{i + 1}</td>
                      <td className="font-medium text-sm">{p.title}</td>
                      <td>
                        <span className={`badge badge-sm capitalize ${diffBadge(p.difficulty)}`}>{p.difficulty}</span>
                      </td>
                      <td>
                        <div className="flex gap-1 flex-wrap">
                          {p.tags?.map(t => (
                            <span key={t} className="badge badge-ghost badge-xs capitalize">{t}</span>
                          ))}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            className="btn btn-xs btn-ghost gap-1 hover:text-primary"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p._id, p.title)}
                            className="btn btn-xs btn-ghost gap-1 hover:text-error"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Create Form ──────────────────────────────────── */}
        {view === 'create' && (
          <ProblemForm
            onSubmit={handleCreate}
            isSubmitting={isSubmitting}
            submitLabel="Publish Problem"
            onCancel={() => setView('list')}
          />
        )}

        {/* ── Edit Form ─────────────────────────────────────── */}
        {view === 'edit' && selectedProblem && (
          <ProblemForm
            onSubmit={handleUpdate}
            defaultVals={selectedProblem}
            isSubmitting={isSubmitting}
            submitLabel="Save Changes"
            onCancel={() => setView('list')}
          />
        )}
      </div>
    </div>
  );
}

export default Adminpage;
