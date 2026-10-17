import { useState } from "react";
import {Navigate, useNavigate } from "react-router-dom";
import {
  FiCloud,
  FiMessageCircle,
  FiUsers,
  FiMail,
  FiLock,
  FiArrowRight,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { useAuth } from "../context/useAuth";
import { homePathFor } from "../utils/navigation";
import background from "../images/background.jpg";
import logo from "../images/logo.png";

const features = [
  { icon: FiCloud, label: "Track royalties" },
  { icon: FiMessageCircle, label: "Get support" },
  { icon: FiUsers, label: "Grow your audience" },
];

export default function LoginPage() {
    const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
    
  if (isAuthenticated) return <Navigate to={homePathFor(user.role)} replace />;
 

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
            const loggedInUser = await login({ email, password });
      navigate(homePathFor(loggedInUser.role), { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080b16] p-3 sm:p-5 lg:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1440px] overflow-hidden rounded-2xl bg-white shadow-2xl sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-4rem)]">
        {/* Left panel */}
        <section
          className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#101a35] bg-cover bg-center p-10 text-white md:flex lg:p-12 xl:p-16"
          style={{ backgroundImage: `url(${background})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#071126]/65 via-[#071126]/35 to-[#071126]/90" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="BookLeaf"
                className="h-10 w-10 object-contain"
              />
              <span className="text-2xl font-semibold tracking-tight">
                BookLeaf
              </span>
            </div>

            <div className="mt-16 max-w-md lg:mt-24">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#c2d1ff]">
                Your author journey
              </p>

              <h1 className="text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
                Your stories.
                <br />
                Our support.
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-6 text-slate-200 lg:text-base">
                From published books to royalty updates, manage your
                publishing journey and get the support you need, all in one
                place.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-white/20 pt-7 lg:gap-6">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-[#d5e0ff]">
                  <Icon size={20} />
                </div>
                <span className="text-xs font-medium leading-5 text-slate-200 lg:text-sm">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Right panel */}
        <section className="flex w-full items-center justify-center bg-[#fcfcfe] px-6 py-12 sm:px-12 md:w-1/2 md:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="mb-10 flex items-center justify-center gap-3 md:hidden">
              <img
                src={logo}
                alt="BookLeaf"
                className="h-10 w-10 object-contain"
              />
              <span className="text-2xl font-semibold tracking-tight text-[#171a35]">
                BookLeaf
              </span>
            </div>

            <div className="mb-8">
              <div className="mb-8 border-b border-gray-200">
                <div className="w-1/2 border-b-2 border-[#29265f] pb-4 text-center text-sm font-semibold text-[#29265f]">
                  Login
                </div>
              </div>

              <h2 className="text-3xl font-semibold tracking-tight text-[#171a35]">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Sign in to your BookLeaf account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 transition focus-within:border-[#7775b9] focus-within:ring-2 focus-within:ring-[#7775b9]/15">
                  <FiMail className="shrink-0 text-gray-400" size={18} />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 transition focus-within:border-[#7775b9] focus-within:ring-2 focus-within:ring-[#7775b9]/15">
                  <FiLock className="shrink-0 text-gray-400" size={18} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="shrink-0 text-gray-400 transition hover:text-[#29265f]"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#29265f] px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#29265f]/15 transition hover:bg-[#393580] focus:outline-none focus:ring-2 focus:ring-[#7775b9] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Log in"}
                {!isSubmitting && <FiArrowRight size={17} />}
              </button>
            </form>

            <div className="mt-8 border-t border-gray-200 pt-6 text-center">
              <p className="text-xs leading-5 text-gray-400">
                Your publishing journey, all in one place.
              </p>
              <p className="mt-2 text-xs font-medium tracking-wide text-[#29265f]">
                BOOKLEAF AUTHOR PORTAL
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}