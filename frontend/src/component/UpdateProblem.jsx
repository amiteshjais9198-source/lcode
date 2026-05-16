import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Save, ArrowLeft, Plus, Trash2, Beaker, Code, Eye, EyeOff } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const UpdateProblem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'Easy',
        tags: '', 
        role: '',
        visibleTestCases: [{ input: '', output: '', explaination: '' }],
        invisibleTestCases: [{ input: '', output: '' }],
        startcode: [{ language: '', initialCode: '' }], // Changed 'code' to 'initialCode'
        refrencesolution: [{ language: '', solution: '' }],
    });

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setLoading(true);
                const { data } = await axiosClient.get(`/admin/problem/${id}`);
                
                // Ensure tags is handled as a string as per your working JSON
                setFormData({
                    ...data,
                    tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
                    visibleTestCases: Array.isArray(data.visibleTestCases) && data.visibleTestCases.length > 0
                        ? data.visibleTestCases
                        : [{ input: '', output: '', explaination: '' }],
                    invisibleTestCases: Array.isArray(data.invisibleTestCases) && data.invisibleTestCases.length > 0
                        ? data.invisibleTestCases
                        : [{ input: '', output: '' }],
                    startcode: Array.isArray(data.startcode) && data.startcode.length > 0
                        ? data.startcode
                        : [{ language: '', initialCode: '' }],
                    refrencesolution: Array.isArray(data.refrencesolution) && data.refrencesolution.length > 0
                        ? data.refrencesolution
                        : [{ language: '', solution: '' }],
                });
            } catch (err) {
                console.error("Fetch Error:", err);
                alert("Failed to load problem data");
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const updateArrayField = (field, index, key, value) => {
        const updatedArray = [...formData[field]];
        updatedArray[index][key] = value;
        setFormData(prev => ({ ...prev, [field]: updatedArray }));
    };

    const addArrayItem = (field, template) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], template] }));
    };

    const removeArrayItem = (field, index) => {
        const updatedArray = formData[field].filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, [field]: updatedArray }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        // Directly use the state. Based on your working JSON, tags is a string "Dp"
        // We send the formData exactly as the backend expects it.
        try {
            const response = await axiosClient.put(`/admin/update/${id}`, formData);
            if(response.status === 200) {
                alert("Successfully updated!");
                navigate('/admin/updateList'); 
            }
        } catch (err) {
            console.error("Submit Error:", err);
            alert(err.response?.data?.message || "Update Failed");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="min-h-screen bg-base-200 pb-10">
            <div className="max-w-5xl mx-auto p-4 md:p-8">
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-8 bg-base-100 p-4 rounded-xl shadow">
                    <button onClick={() => navigate(-1)} className="btn btn-ghost gap-2">
                        <ArrowLeft size={20} /> Back
                    </button>
                    <h1 className="text-2xl font-bold italic">Editing: {formData.title}</h1>
                    <button onClick={handleSubmit} disabled={saving} className="btn btn-primary">
                        {saving ? <span className="loading loading-spinner"></span> : <Save size={20} />}
                        Save Changes
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label font-bold">Title</label>
                                    <input name="title" value={formData.title} onChange={handleInputChange} className="input input-bordered" />
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold">Difficulty</label>
                                    <select name="difficulty" value={formData.difficulty} onChange={handleInputChange} className="select select-bordered">
                                        <option>Easy</option><option>Medium</option><option>Hard</option>
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold">Tags</label>
                                    <input name="tags" value={formData.tags} onChange={handleInputChange} className="input input-bordered" placeholder="e.g. Dp" />
                                </div>
                            </div>
                            <div className="form-control mt-4">
                                <label className="label font-bold">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} className="textarea textarea-bordered h-32 font-mono" />
                            </div>
                        </div>
                    </div>

                    {/* Reference Solution - Matches your JSON keys */}
                    <div className="card bg-base-100 shadow-sm border-l-4 border-warning">
                        <div className="card-body">
                            <h2 className="card-title text-warning"><Beaker /> Reference Solutions</h2>
                            {formData.refrencesolution.map((sol, index) => (
                                <div key={index} className="bg-base-200 p-4 rounded-lg relative mb-4">
                                    <button onClick={() => removeArrayItem('refrencesolution', index)} className="btn btn-circle btn-xs btn-error absolute top-2 right-2"><Trash2 size={12}/></button>
                                    <input placeholder="language" value={sol.language} onChange={(e) => updateArrayField('refrencesolution', index, 'language', e.target.value)} className="input input-sm mb-2 w-full max-w-xs" />
                                    <textarea placeholder="solution code" value={sol.solution} onChange={(e) => updateArrayField('refrencesolution', index, 'solution', e.target.value)} className="textarea textarea-bordered w-full font-mono h-40" />
                                </div>
                            ))}
                            <button type="button" onClick={() => addArrayItem('refrencesolution', { language: '', solution: '' })} className="btn btn-outline btn-sm">Add Solution</button>
                        </div>
                    </div>

                    {/* Start Code - Uses 'initialCode' as per your Postman input */}
                    <div className="card bg-base-100 shadow-sm border-l-4 border-success">
                        <div className="card-body">
                            <h2 className="card-title text-success"><Code /> Start Code</h2>
                            {formData.startcode.map((sc, index) => (
                                <div key={index} className="bg-base-200 p-4 rounded-lg relative mb-4">
                                    <button onClick={() => removeArrayItem('startcode', index)} className="btn btn-circle btn-xs btn-error absolute top-2 right-2"><Trash2 size={12}/></button>
                                    <input placeholder="language" value={sc.language} onChange={(e) => updateArrayField('startcode', index, 'language', e.target.value)} className="input input-sm mb-2 w-full max-w-xs" />
                                    <textarea placeholder="initial boilerplate code" value={sc.initialCode} onChange={(e) => updateArrayField('startcode', index, 'initialCode', e.target.value)} className="textarea textarea-bordered w-full font-mono h-32" />
                                </div>
                            ))}
                            <button type="button" onClick={() => addArrayItem('startcode', { language: '', initialCode: '' })} className="btn btn-outline btn-sm">Add Start Code</button>
                        </div>
                    </div>

                    {/* Test Cases */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="card bg-base-100 shadow-sm">
                            <div className="card-body">
                                <h2 className="card-title text-info font-bold uppercase text-xs">Visible Test Cases</h2>
                                {formData.visibleTestCases.map((tc, index) => (
                                    <div key={index} className="space-y-2 p-2 border-b border-base-200">
                                        <textarea placeholder="Input" value={tc.input} onChange={(e) => updateArrayField('visibleTestCases', index, 'input', e.target.value)} className="textarea textarea-xs w-full" />
                                        <input placeholder="Output" value={tc.output} onChange={(e) => updateArrayField('visibleTestCases', index, 'output', e.target.value)} className="input input-xs w-full" />
                                        <input placeholder="Explaination" value={tc.explaination} onChange={(e) => updateArrayField('visibleTestCases', index, 'explaination', e.target.value)} className="input input-xs w-full italic" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Invisible Test Cases */}
                        <div className="card bg-base-100 shadow-sm">
                            <div className="card-body">
                                <h2 className="card-title opacity-50 font-bold uppercase text-xs text-error">Invisible Test Cases</h2>
                                {formData.invisibleTestCases.map((tc, index) => (
                                    <div key={index} className="space-y-2 p-2 border-b border-base-200">
                                        <textarea placeholder="Input" value={tc.input} onChange={(e) => updateArrayField('invisibleTestCases', index, 'input', e.target.value)} className="textarea textarea-xs w-full" />
                                        <input placeholder="Output" value={tc.output} onChange={(e) => updateArrayField('invisibleTestCases', index, 'output', e.target.value)} className="input input-xs w-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateProblem;