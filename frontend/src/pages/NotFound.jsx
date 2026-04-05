import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Visual Element */}
      <div className="relative mb-8">
        <h1 className="text-[12rem] font-black text-slate-100 leading-none select-none">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-blue-600 text-white px-6 py-2 rounded-2xl font-black text-2xl shadow-xl shadow-blue-200 rotate-3">
            Page Lost!
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="max-w-md space-y-4">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Oops! You've wandered off the map.
        </h2>
        <p className="text-slate-500 font-medium leading-relaxed">
          The page you are looking for doesn't exist or has been moved to a new financial vault. 
          Let's get you back to your dashboard.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
        >
          Back to Dashboard
        </button>
        
        <button 
          onClick={() => navigate(-1)}
          className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 active:scale-95 transition-all"
        >
          Go Back
        </button>
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl -z-10 opacity-60"></div>
      <div className="fixed bottom-20 right-10 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 opacity-60"></div>
    </div>
  );
};

export default NotFound;