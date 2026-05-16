import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  tags: z.enum(['Array', 'LinkedList', 'Graph', 'Dp', 'String', 'Math', 'Sorting', 'Stack', 'Tree']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explaination: z.string().min(1, 'Explanation is required')
    })
  ).min(1),
  invisibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1),
  startcode: z.array(
    z.object({
      language: z.enum(['cpp', 'java', 'javascript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).min(1),
  refrencesolution: z.array(
    z.object({
      language: z.enum(['cpp', 'java', 'javascript']),
      solution: z.string().min(1, 'Complete code is required')
    })
  ).min(1)
});

function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      difficulty: 'Easy',
      tags: 'Array',
      visibleTestCases: [{ input: '', output: '', explaination: '' }],
      invisibleTestCases: [{ input: '', output: '' }],
      // THIS PRE-LOADS ALL 3 LANGUAGES INTO THE FORM ARRAYS
      startcode: [
        { language: 'javascript', initialCode: '' },
        { language: 'cpp', initialCode: '' },
        { language: 'java', initialCode: '' }
      ],
      refrencesolution: [
        { language: 'javascript', solution: '' },
        { language: 'cpp', solution: '' },
        { language: 'java', solution: '' }
      ]
    }
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: 'visibleTestCases' });
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ control, name: 'invisibleTestCases' });
  const { fields: startCodeFields } = useFieldArray({ control, name: 'startcode' });
  const { fields: refSolutionFields } = useFieldArray({ control, name: 'refrencesolution' });

  const onSubmit = async (data) => {
    if (!user) return alert("You must be logged in as an admin.");
    try {
      const payload = { ...data, problemCreator: user._id || user.id };
      const response = await axiosClient.post('/admin/problem', payload);
      alert('Problem created successfully!');
      navigate('/');
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-base-200 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Create New Multi-Language Problem</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Basic Info */}
        <div className="card bg-base-100 shadow-xl p-6 border-t-4 border-primary">
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control md:col-span-2">
              <label className="label font-semibold">Title</label>
              <input {...register('title')} className="input input-bordered w-full" placeholder="e.g. Reverse a String" />
              {errors.title && <span className="text-error text-sm">{errors.title.message}</span>}
            </div>
            <div className="form-control">
              <label className="label font-semibold">Difficulty</label>
              <select {...register('difficulty')} className="select select-bordered">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label font-semibold">Tag</label>
              <select {...register('tags')} className="select select-bordered">
                {['Array', 'LinkedList', 'Graph', 'Dp', 'String', 'Math', 'Sorting', 'Stack', 'Tree'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-control md:col-span-2">
              <label className="label font-semibold">Description</label>
              <textarea {...register('description')} className="textarea textarea-bordered h-28" placeholder="Problem explanation..." />
            </div>
          </div>
        </div>

        {/* Test Cases Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-base-100 shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4">Visible Test Cases</h2>
            {visibleFields.map((field, index) => (
              <div key={field.id} className="bg-base-200 p-4 rounded-lg mb-4 relative border border-base-300">
                <button type="button" onClick={() => removeVisible(index)} className="btn btn-circle btn-xs btn-error absolute top-2 right-2">✕</button>
                <textarea {...register(`visibleTestCases.${index}.input`)} placeholder="Input" className="textarea textarea-sm textarea-bordered w-full mb-2 font-mono" rows={2}/>
                <textarea {...register(`visibleTestCases.${index}.output`)} placeholder="Output" className="textarea textarea-sm textarea-bordered w-full mb-2 font-mono" rows={2}/>
                <textarea {...register(`visibleTestCases.${index}.explaination`)} placeholder="Explanation" className="textarea textarea-sm textarea-bordered w-full" rows={1}/>
              </div>
            ))}
            <button type="button" onClick={() => appendVisible({ input: '', output: '', explaination: '' })} className="btn btn-outline btn-sm">Add Visible Case</button>
          </div>

          <div className="card bg-base-100 shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4">Hidden Test Cases</h2>
            {hiddenFields.map((field, index) => (
              <div key={field.id} className="bg-base-200 p-4 rounded-lg mb-4 relative border border-base-300">
                <button type="button" onClick={() => removeHidden(index)} className="btn btn-circle btn-xs btn-error absolute top-2 right-2">✕</button>
                <textarea {...register(`invisibleTestCases.${index}.input`)} placeholder="Input" className="textarea textarea-sm textarea-bordered w-full mb-2 font-mono" rows={2}/>
                <textarea {...register(`invisibleTestCases.${index}.output`)} placeholder="Output" className="textarea textarea-sm textarea-bordered w-full mb-2 font-mono" rows={2}/>
              </div>
            ))}
            <button type="button" onClick={() => appendHidden({ input: '', output: '' })} className="btn btn-outline btn-sm">Add Hidden Case</button>
          </div>
        </div>

        {/* Languages Section */}
        <div className="card bg-base-100 shadow-xl p-6 border-t-4 border-secondary">
          <h2 className="text-2xl font-bold mb-6 text-center">Language Support (Javascript, C++, Java)</h2>
          
          <div className="space-y-10">
            {/* Start Code Templates */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center">1</span>
                Initial Code Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {startCodeFields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-base-200 rounded-lg border border-base-300">
                    <label className="label uppercase font-black text-secondary">{field.language}</label>
                    <textarea 
                      {...register(`startcode.${index}.initialCode`)} 
                      className="textarea textarea-bordered w-full h-64 font-mono text-xs" 
                      placeholder={`${field.language} boilerplate...`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Reference Solutions */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center">2</span>
                Reference Solutions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {refSolutionFields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-base-200 rounded-lg border border-base-300">
                    <label className="label uppercase font-black text-accent">{field.language}</label>
                    <textarea 
                      {...register(`refrencesolution.${index}.solution`)} 
                      className="textarea textarea-bordered w-full h-64 font-mono text-xs" 
                      placeholder={`${field.language} solution...`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block text-lg shadow-xl py-4 h-auto">Create Problem</button>
      </form>
    </div>
  );
}

export default AdminPanel;