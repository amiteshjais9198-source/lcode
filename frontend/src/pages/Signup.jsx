import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum 3 characters required"),
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => dispatch(registerUser(data));

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm relative">
        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-800/60 shadow-2xl shadow-black/40">

          {/* Error alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-800/40 text-red-300 text-sm flex items-center gap-2">
              <span className="shrink-0 text-base">⚠</span>
              <span>{typeof error === 'string' ? error : 'Registration failed. Please try again.'}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <input
                id="signup-name"
                type="text"
                placeholder="Full Name"
                className={`w-full px-4 py-3 rounded-xl bg-slate-800/70 border text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.firstName
                    ? 'border-red-600/60 focus:ring-red-500/30'
                    : 'border-slate-700/50 focus:border-emerald-500/60 focus:ring-emerald-500/20'
                }`}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                id="signup-email"
                type="email"
                placeholder="Email"
                className={`w-full px-4 py-3 rounded-xl bg-slate-800/70 border text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.emailId
                    ? 'border-red-600/60 focus:ring-red-500/30'
                    : 'border-slate-700/50 focus:border-emerald-500/60 focus:ring-emerald-500/20'
                }`}
                {...register('emailId')}
              />
              {errors.emailId && (
                <p className="mt-1 text-xs text-red-400">{errors.emailId.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl bg-slate-800/70 border text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.password
                      ? 'border-red-600/60 focus:ring-red-500/30'
                      : 'border-slate-700/50 focus:border-emerald-500/60 focus:ring-emerald-500/20'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 transition-all duration-300 active:scale-[0.98]"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={16} />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <NavLink
              to="/login"
              className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Sign in
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;