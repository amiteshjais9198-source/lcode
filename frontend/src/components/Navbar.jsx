import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../authslice';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Sun, Moon, Shield, ChevronDown } from 'lucide-react';

function Navbar() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const theme = document.documentElement.getAttribute('data-theme');
        setIsDark(theme !== 'light');
    }, []);

    const toggleTheme = () => {
        const next = isDark ? 'light' : 'dark';
        setIsDark(!isDark);
        document.documentElement.setAttribute('data-theme', next);
    };

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    // Check if on problem page to hide nav links
    const onProblemPage = location.pathname.startsWith('/problem/');

    return (
        <nav className="bg-base-100/80 backdrop-blur-md border-b border-base-300 sticky top-0 z-50 shadow-sm">
            <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-[60px]">

                {/* Logo */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 group"
                >
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <span className="text-white font-black text-sm leading-none">A</span>
                    </div>
                    <span className="text-xl font-extrabold text-primary tracking-tight group-hover:opacity-80 transition-opacity">
                        AlgoVerse
                    </span>
                </button>

                {/* Right side */}
                <div className="flex items-center gap-2">

                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-primary"
                        title={isDark ? 'Switch to light' : 'Switch to dark'}
                    >
                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>

                    {/* User dropdown */}
                    <div className="dropdown dropdown-end">
                        <div
                            tabIndex={0}
                            role="button"
                            className="flex items-center gap-2 btn btn-ghost btn-sm rounded-lg px-2 hover:bg-base-200"
                        >
                            {/* Avatar */}
                            <div className="w-7 h-7 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs font-bold shrink-0">
                                {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-sm font-medium hidden sm:block">{user?.firstName}</span>
                            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                        </div>

                        <ul
                            tabIndex={0}
                            className="dropdown-content z-50 mt-2 w-52 bg-base-100 border border-base-300 rounded-xl shadow-xl p-1.5 space-y-0.5"
                        >
                            {/* User info header */}
                            <div className="px-3 py-2 mb-1">
                                <p className="text-sm font-semibold">{user?.firstName}</p>
                                <p className="text-xs text-base-content/40 truncate">{user?.emailId}</p>
                            </div>
                            <div className="border-t border-base-300 mb-1" />

                            {user?.role === 'admin' && (
                                <li>
                                    <button
                                        onClick={() => navigate('/admin')}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-left"
                                    >
                                        <Shield className="w-4 h-4 shrink-0" />
                                        Admin Panel
                                    </button>
                                </li>
                            )}
                            <li>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-base-200 transition-colors text-left"
                                >
                                    <User className="w-4 h-4 shrink-0" />
                                    My Profile
                                </button>
                            </li>
                            <div className="border-t border-base-300 my-1" />
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-error/10 text-error transition-colors text-left"
                                >
                                    <LogOut className="w-4 h-4 shrink-0" />
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
