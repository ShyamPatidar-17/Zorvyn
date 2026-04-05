import { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const authRoutes = ['/', '/login']; 
  if (authRoutes.includes(location.pathname)) {
    return null;
  }
  

  const isActive = (path) => 
    location.pathname === path 
      ? "text-blue-500 bg-blue-50 md:bg-transparent" 
      : "text-slate-600 hover:text-blue-500";

  const navLinks = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      show: true 
    },
    { 
    
      name: user?.role === 'Viewer' ? 'My Transactions' : ' Recent Transactions', 
      path: '/transactions', 
      show: ['Analyst', 'Admin', 'Viewer'].includes(user?.role) 
    },

   { 
    name: user?.role === 'Viewer' ? 'My Profile' : 'All Users', 
    path: user?.role === 'Viewer' ? '/my-profile' : '/users', 
    show: ['Admin', 'Viewer'].includes(user?.role) 
  },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <h2 className="text-2xl font-black tracking-tighter text-blue-600">
                FINANCE<span className="text-slate-900">.IO</span>
              </h2>
              <div className="hidden sm:flex ml-4 items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {user?.role}
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => link.show && (
              <Link 
                key={link.path}
                to={link.path} 
                className={`text-sm font-bold transition-all ${isActive(link.path)}`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
            
            <button 
              onClick={logout}
              className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} bg-white border-t border-slate-100`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => link.show && (
            <Link 
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-4 rounded-xl text-base font-bold ${isActive(link.path)}`}
            >
              {link.name}
            </Link>
          ))}
          <button 
            onClick={logout}
            className="w-full text-left block px-3 py-4 rounded-xl text-base font-bold text-red-500 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;