import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, Mail, Lock, User,
  ShoppingBag, AlertCircle, Check,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/slices/authSlice";
import toast from "react-hot-toast";

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "One uppercase letter",  pass: /[A-Z]/.test(password) },
    { label: "One number",            pass: /[0-9]/.test(password) },
    { label: "One special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const strength = checks.filter((c) => c.pass).length;
  const colors   = ["bg-red-400", "bg-orange-400", "bg-amber-400", "bg-green-400"];
  const labels   = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i < strength ? colors[strength - 1] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${strength <= 1 ? "text-red-500" : strength === 2 ? "text-amber-500" : strength === 3 ? "text-amber-600" : "text-green-600"}`}>
        {labels[strength - 1] || ""}
      </p>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${c.pass ? "bg-green-500" : "bg-gray-200"}`}>
              {c.pass && <Check size={8} className="text-white" />}
            </div>
            <span className={`text-xs ${c.pass ? "text-green-600" : "text-gray-400"}`}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Register = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "", agree: false,
  });
  const [errors,   setErrors]   = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const update = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Full name is required";
    if (!form.email.trim())   e.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password)       e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!form.agree) e.agree = "You must accept the terms to continue";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1400));
      const mockUser = {
        _id:   "u2",
        name:  form.name,
        email: form.email,
        role:  "user",
      };
      dispatch(loginSuccess({ user: mockUser, token: "mock-jwt-token-new" }));
      toast.success(`Welcome to ShopVerse, ${form.name.split(" ")[0]}!`);
      navigate("/");
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-primary-200 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-white rounded-full blur-3xl" />
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
            Join millions of<br />
            <span className="text-primary-200">happy shoppers</span>
          </h2>
          <p className="text-primary-100 text-base leading-relaxed max-w-sm">
            Create your free account and start exploring thousands of premium products today.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "50K+",  label: "Products" },
              { value: "2M+",   label: "Customers" },
              { value: "4.9★",  label: "Avg rating" },
              { value: "Free",  label: "Shipping $75+" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/10 border border-white/20 rounded-xl p-4 text-center"
              >
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-primary-200 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-primary-300">
          © 2025 ShopVerse. All rights reserved.
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-6">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 justify-center mb-8 lg:hidden">
            <ShoppingBag size={24} className="text-primary-600" />
            <span className="text-xl font-bold text-gray-900">
              Shop<span className="text-primary-600">Verse</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary-600 font-medium hover:text-primary-800 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {errors.general && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle size={16} className="shrink-0" />
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">Full name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="John Smith"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={`input-field pl-10 ${errors.name ? "border-red-400" : ""}`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={`input-field pl-10 ${errors.email ? "border-red-400" : ""}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className={`input-field pl-10 pr-10 ${errors.password ? "border-red-400" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">Confirm password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConf ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  className={`input-field pl-10 pr-10 ${errors.confirmPassword ? "border-red-400" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConf((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword}</p>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check size={11} /> Passwords match
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="flex flex-col gap-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agree}
                  onChange={(e) => update("agree", e.target.checked)}
                  className="accent-primary-600 w-4 h-4 mt-0.5 shrink-0"
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  I agree to ShopVerse's{" "}
                  <a href="#" className="text-primary-600 hover:underline font-medium">Terms of service</a>{" "}
                  and{" "}
                  <a href="#" className="text-primary-600 hover:underline font-medium">Privacy policy</a>
                </span>
              </label>
              {errors.agree && (
                <p className="text-xs text-red-500 ml-6">{errors.agree}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-800 disabled:bg-primary-400 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create free account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or sign up with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Google", bg: "bg-white border-gray-200",     color: "text-gray-700" },
              { label: "GitHub", bg: "bg-gray-900 border-gray-900",  color: "text-white"   },
            ].map((s) => (
              <button
                key={s.label}
                className={`flex items-center justify-center gap-2 ${s.bg} ${s.color} border text-sm font-medium py-2.5 rounded-xl hover:opacity-90 transition-opacity`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;