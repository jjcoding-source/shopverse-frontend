import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ShoppingBag, AlertCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "@/store/slices/authSlice";
import toast from "react-hot-toast";

const Login = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || "/";

  const [form, setForm]         = useState({ email: "", password: "" });
  const [errors, setErrors]     = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const update = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim())    e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password.trim()) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(loginStart());
    setLoading(true);
    try {
      // Simulated API call
      await new Promise((r) => setTimeout(r, 1200));
      const mockUser = {
        _id:   "u1",
        name:  "James Kumar",
        email: form.email,
        role:  form.email.includes("admin") ? "admin" : "user",
      };
      dispatch(loginSuccess({ user: mockUser, token: "mock-jwt-token" }));
      toast.success(`Welcome back, ${mockUser.name.split(" ")[0]}!`);
      navigate(from, { replace: true });
    } catch (err) {
      dispatch(loginFailure("Invalid email or password"));
      setErrors({ general: "Invalid email or password. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary-200 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2">
            <ShoppingBag size={28} className="text-primary-200" />
            <span className="text-2xl font-bold text-white tracking-tight">
              Shop<span className="text-primary-200">Verse</span>
            </span>
          </Link>
        </div>
        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Welcome back to<br />
            <span className="text-primary-200">ShopVerse</span>
          </h2>
          <p className="text-primary-100 text-base leading-relaxed max-w-sm">
            Sign in to access your orders, wishlist, and personalised recommendations.
          </p>
          <div className="flex flex-col gap-3">
            {[
              "Track all your orders in real time",
              "Save items to your wishlist",
              "Exclusive member-only deals",
              "Faster checkout every time",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-primary-100">
                <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
            <p className="text-white text-sm leading-relaxed italic mb-3">
              "ShopVerse has the best deals and fastest delivery. I shop here exclusively now."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center text-xs font-bold text-white">
                SW
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Sarah Williams</p>
                <p className="text-primary-300 text-xs">Verified customer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 justify-center mb-8 lg:hidden">
            <ShoppingBag size={24} className="text-primary-600" />
            <span className="text-xl font-bold text-gray-900">
              Shop<span className="text-primary-600">Verse</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
            <p className="text-gray-500 text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary-600 font-medium hover:text-primary-800 transition-colors">
                Create one free
              </Link>
            </p>
          </div>

          {/* General error */}
          {errors.general && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle size={16} className="shrink-0" />
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={`input-field pl-10 ${errors.email ? "border-red-400 focus:border-red-400 focus:ring-red-50" : ""}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700">
                  Password
                </label>
                <a href="#" className="text-xs text-primary-600 hover:text-primary-800 font-medium transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className={`input-field pl-10 pr-10 ${errors.password ? "border-red-400 focus:border-red-400 focus:ring-red-50" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="accent-primary-600 w-4 h-4"
              />
              <span className="text-sm text-gray-600">Remember me for 30 days</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-800 disabled:bg-primary-400 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social logins */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Google",  bg: "bg-white border-gray-200", color: "text-gray-700" },
              { label: "GitHub",  bg: "bg-gray-900 border-gray-900", color: "text-white" },
            ].map((s) => (
              <button
                key={s.label}
                className={`flex items-center justify-center gap-2 ${s.bg} ${s.color} border text-sm font-medium py-2.5 rounded-xl hover:opacity-90 transition-opacity`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center mt-8">
            By signing in you agree to our{" "}
            <a href="#" className="text-primary-600 hover:underline">Terms</a>{" "}
            and{" "}
            <a href="#" className="text-primary-600 hover:underline">Privacy policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;