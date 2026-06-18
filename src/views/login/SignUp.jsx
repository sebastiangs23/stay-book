import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthMessages, registerUser } from "../../store/slices/authSlice";

export default function SignUp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, successMessage } = useSelector((state) => state.auth);

  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    role: "GUEST",
    password: "",
    confirmPassword: "",
    isActive: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(clearAuthMessages());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timeoutId = setTimeout(() => {
        navigate("/auth/sign-in");
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [successMessage, navigate]);

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

    if (!inputs.name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (inputs.name.trim().length < 3) {
      newErrors.name = "Full name must have at least 3 characters.";
    } else if (inputs.name.trim().length > 30) {
      newErrors.name = "Full name must have 30 characters or less.";
    }

    if (!inputs.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(inputs.email)) {
      newErrors.email = "Enter a valid email address.";
    } else if (inputs.email.trim().length > 40) {
      newErrors.email = "Email must have 40 characters or less.";
    }

    if (!inputs.password) {
      newErrors.password = "Password is required.";
    } else if (inputs.password.length < 8) {
      newErrors.password = "Password must have at least 8 characters.";
    }

    if (!inputs.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (inputs.password !== inputs.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    dispatch(
      registerUser({
        name: inputs.name.trim(),
        role: inputs.role,
        email: inputs.email.trim(),
        password: inputs.password,
        isActive: inputs.isActive,
      }),
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Create account
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Register as a guest and start booking rooms.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700"
          >
            Full name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            value={inputs.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />

          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

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
            placeholder="At least 8 characters"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />

          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-slate-700"
          >
            Confirm password
          </label>

          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={inputs.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />

          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/auth/sign-in" className="font-medium text-slate-900">
          Sign in
        </Link>
      </p>
    </div>
  );
}
