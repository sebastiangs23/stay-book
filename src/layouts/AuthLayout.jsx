import { Link, Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <section className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="text-3xl font-bold text-slate-900">
            StayBook
          </Link>
          <p className="mt-2 text-sm text-slate-600">
            Hotel room booking made simple.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <Outlet />
        </div>
      </section>
    </main>
  );
}
