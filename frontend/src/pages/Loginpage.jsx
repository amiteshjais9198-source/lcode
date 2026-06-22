import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser } from '../authSlice.js';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
    emailId: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
});

function Loginpage() {
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) });
    const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onSubmit = (data) => { dispatch(loginUser(data)); };

    useEffect(() => {
        if (isAuthenticated) navigate('/');
    }, [isAuthenticated]);

    return (
        <div className="auth-bg min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm">

                {/* Card */}
                <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">

                    {/* Green top bar */}
                    <div className="h-1.5 bg-gradient-to-r from-[#00b8a3] to-[#00d4bc]" />

                    <div className="p-8">
                        {/* Logo */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-extrabold text-primary tracking-tight">AlgoVerse</h1>
                            <p className="text-base-content/50 text-sm mt-1.5">Welcome back! Sign in to continue</p>
                        </div>

                        {error && (
                            <div className="bg-error/10 border border-error/30 text-error text-sm px-4 py-2.5 rounded-lg mb-5 text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                            <div className="form-control">
                                <label className="label py-1">
                                    <span className="label-text font-semibold text-sm">Email Address</span>
                                </label>
                                <input
                                    type="email"
                                    {...register('emailId')}
                                    placeholder="you@example.com"
                                    className={`input input-bordered w-full text-sm ${errors.emailId ? 'input-error' : ''}`}
                                />
                                {errors.emailId && (
                                    <span className="text-error text-xs mt-1.5 flex items-center gap-1">
                                        {errors.emailId.message}
                                    </span>
                                )}
                            </div>

                            <div className="form-control">
                                <label className="label py-1">
                                    <span className="label-text font-semibold text-sm">Password</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password')}
                                        placeholder="••••••••"
                                        className={`input input-bordered w-full pr-11 text-sm ${errors.password ? 'input-error' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors p-0.5"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <span className="text-error text-xs mt-1.5">{errors.password.message}</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full mt-1 text-sm font-semibold"
                            >
                                {loading ? <span className="loading loading-spinner loading-sm" /> : 'Sign In'}
                            </button>
                        </form>

                        <div className="divider text-xs text-base-content/30 my-5">or</div>

                        <p className="text-center text-sm text-base-content/50">
                            Don't have an account?{' '}
                            <a href="/register" className="text-primary font-semibold hover:underline underline-offset-2">
                                Create one
                            </a>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-base-content/30 mt-5">
                    AlgoVerse · Competitive Coding Platform
                </p>
            </div>
        </div>
    );
}

export default Loginpage;