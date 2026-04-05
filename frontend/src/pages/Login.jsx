import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; 
import axios from "../api/axiosInstance"; 
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Auth() {
  const { login } = useContext(AuthContext); 
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "", 
    confirmPassword: "",
    role: "Viewer"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async () => {
    const { firstName, lastName, email, password, confirmPassword, role } = formData;

    // Basic Validation
    if (!email || !password) return toast.error("Email and Password are required");
    
    if (!isLogin) {
      if (!firstName || !lastName || !confirmPassword) {
        return toast.error("Please fill in all registration fields");
      }
      if (password !== confirmPassword) {
        return toast.error("Passwords do not match");
      }
    }

    try {
      setIsLoading(true);
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      
      const payload = isLogin 
        ? { email, password } 
        : { firstName, lastName, email, password, role };

      const res = await axios.post(endpoint, payload);

      if (isLogin) {
        /** * CRITICAL FIX: 
         * Instead of manual localStorage.setItem, we call the context login function.
         * This updates the React State ('user') globally, triggering an immediate UI update.
         */
        login(res.data.user, res.data.token); 
        
        toast.success(`Welcome back, ${res.data.user.firstName}!`);
        navigate("/dashboard");
      } else {
        toast.success("Account created successfully! Please log in.");
        setIsLogin(true); 
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Authentication failed";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-12 font-sans">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {isLogin ? "Welcome Back" : "Join the Platform"}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {isLogin ? "Access your financial insights" : "Register to start managing records"}
          </p>
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">First Name</label>
                <input
                  name="firstName"
                  type="text"
                  placeholder="Shyam"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 outline-none transition-all"
                  onChange={handleChange}
                  value={formData.firstName}
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Last Name</label>
                <input
                  name="lastName"
                  type="text"
                  placeholder="Patidar"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 outline-none transition-all"
                  onChange={handleChange}
                  value={formData.lastName}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="shyam@example.com"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 outline-none transition-all"
              onChange={handleChange}
              value={formData.email}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 outline-none transition-all"
              onChange={handleChange}
              value={formData.password}
            />
          </div>

          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 outline-none transition-all"
                  onChange={handleChange}
                  value={formData.confirmPassword}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Select Role</label>
                <select
                  name="role"
                  value={formData.role}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 outline-none transition-all cursor-pointer"
                  onChange={handleChange}
                >
                  <option value="Viewer">Viewer (Read Only)</option>
                  <option value="Analyst">Analyst (View & Insights)</option>
                  <option value="Admin">Admin (Full Control)</option>
                </select>
              </div>
            </>
          )}

          <button
            disabled={isLoading}
            onClick={handleAuth}
            className={`w-full py-4 mt-2 rounded-2xl text-white font-bold shadow-lg transition-all ${
              isLoading 
                ? "bg-blue-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-200"
            }`}
          >
            {isLoading ? "Authenticating..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="ml-2 text-blue-600 font-bold hover:underline"
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;