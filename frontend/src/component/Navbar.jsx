import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, LogOut, Zap, Settings, Terminal } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="navbar bg-base-100/80 backdrop-blur-xl shadow-sm border-b border-base-200/60 sticky top-0 z-50 px-4 md:px-8 h-16">
      {/* Brand / Logo */}
      <div className="flex-1">
        <button
          onClick={() => navigate('/')}
          className="btn btn-ghost hover:bg-transparent normal-case text-xl md:text-2xl font-extrabold gap-2 px-0 flex items-center group"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
            <Terminal size={20} className="text-primary" />
          </div>
          <span className="gradient-text tracking-tight">AlgoVerse</span>
        </button>
      </div>

      {/* Right-hand side */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle btn-sm flex items-center justify-center transition-all active:scale-90 hover:bg-base-200/50"
          title="Toggle Theme"
        >
          {isDark ? (
            <Sun size={18} className="text-warning" />
          ) : (
            <Moon size={18} className="text-primary" />
          )}
        </button>

        {/* Admin Button */}
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin')}
            className="btn btn-sm border-none font-bold px-4 gap-2 flex items-center bg-gradient-to-r from-warning/90 to-warning text-warning-content shadow-sm hover:shadow-md transition-all"
          >
            <Settings size={14} />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}

        {/* Profile Dropdown */}
        <div className="dropdown dropdown-end flex items-center">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar placeholder hover:bg-base-200/50 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-sm font-bold uppercase text-white select-none">
                {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
          </div>

          <ul
            tabIndex={0}
            className="mt-4 z-[1] p-2 shadow-2xl menu menu-sm dropdown-content bg-base-100 rounded-2xl w-64 border border-base-200/60 backdrop-blur-xl right-0"
          >
            <li className="px-4 py-3">
              <div className="flex flex-col gap-0.5 p-0 bg-transparent hover:bg-transparent cursor-default">
                <span className="font-bold text-sm text-base-content truncate">
                  {user?.firstName || 'User Account'}
                </span>
                <span className="text-xs opacity-50 truncate font-medium">
                  {user?.emailId}
                </span>
              </div>
            </li>
            <div className="divider my-0 opacity-30"></div>
            <li>
              <button
                onClick={handleLogout}
                className="text-error hover:bg-error/10 font-semibold flex items-center gap-2 m-1 rounded-xl"
              >
                <LogOut size={16} />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;