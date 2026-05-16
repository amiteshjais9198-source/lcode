import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { loginUser } from "../authSlice";
import { useEffect, useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak")
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => dispatch(loginUser(data));

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm relative">
        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-800/60 shadow-2xl shadow-black/40">

          {/* Error alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-800/40 text-red-300 text-sm flex items-center gap-2">
              <span className="shrink-0 text-base">⚠</span>
              <span>{typeof error === 'string' ? error : 'Login failed. Please try again.'}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <input
                id="login-email"
                type="email"
                placeholder="Email"
                className={`w-full px-4 py-3 rounded-xl bg-slate-800/70 border text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.emailId
                    ? 'border-red-600/60 focus:ring-red-500/30'
                    : 'border-slate-700/50 focus:border-blue-500/60 focus:ring-blue-500/20'
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
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl bg-slate-800/70 border text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.password
                      ? 'border-red-600/60 focus:ring-red-500/30'
                      : 'border-slate-700/50 focus:border-blue-500/60 focus:ring-blue-500/20'
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
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 transition-all duration-300 active:scale-[0.98]"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Signup link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <NavLink
              to="/signup"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Sign up
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;