import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthMessages, loginUser } from "../../store/slices/authSlice";

export default function SignIn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(clearAuthMessages());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/home");
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    dispatch(clearAuthMessages());
  };

  const validateForm = () => {
    const newErrors = {};

    if (!inputs.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(inputs.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!inputs.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const result = await dispatch(
      loginUser({
        email: inputs.email.trim(),
        password: inputs.password,
      }),
    );

    if(result.payload?.id){
      navigate("/home");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-600">
          Access your StayBook account.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={inputs.email}
            onChange={handleChange}
            placeholder="guest@example.com"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />

          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700"
          >
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            value={inputs.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />

          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link to="/auth/sign-up" className="font-medium text-slate-900">
          Create one
        </Link>
      </p>
    </div>
  );
}
