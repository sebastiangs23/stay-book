import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiLogOut,
  FiGrid,
  FiMenu,
} from "react-icons/fi";
import { logout } from "../store/slices/authSlice";

const iconByName = {
  Home: FiHome,
  Users: FiUsers,
  Rooms: FiGrid,
  Reservations: FiCalendar,
};

export default function MainLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { submodules } = useSelector((state) => state.submodules);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/sign-in");
  };

  const getSubmodulePath = (name) => {
    const normalized = name.toLowerCase();

    if (normalized === "home") return "/home";
    if (normalized === "users") return "/users";
    if (normalized === "rooms") return "/rooms";
    if (normalized === "reservations") return "/reservations";

    return `/${normalized}`;
  };

  const visibleSubmodules = submodules.filter((item) => item.isActive);

  return (
    <main className="min-h-screen bg-[#f3f4f6]">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white">
              <FiGrid size={18} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-950">
                StayBook
              </h1>
              <p className="text-xs text-slate-500">Hotel booking platform</p>
            </div>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            {visibleSubmodules.map((item) => {
              const Icon = iconByName[item.name] || FiGrid;
              const path = getSubmodulePath(item.name);

              return (
                <NavLink
                  key={item.id}
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-black text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`
                  }
                >
                  <Icon size={16} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-500">{user?.role || "GUEST"}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 md:flex md:items-center md:gap-2"
            >
              <FiLogOut size={16} />
              Logout
            </button>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 md:hidden"
            >
              <FiMenu size={18} />
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </section>

      <nav className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-around rounded-full bg-black/95 px-4 py-3 text-white shadow-2xl md:hidden">
        {visibleSubmodules.slice(0, 4).map((item) => {
          const Icon = iconByName[item.name] || FiGrid;
          const path = getSubmodulePath(item.name);

          return (
            <NavLink
              key={item.id}
              to={path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] transition ${
                  isActive ? "text-white" : "text-white/50"
                }`
              }
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 text-[11px] text-white/50"
        >
          <FiLogOut size={18} />
          Exit
        </button>
      </nav>
    </main>
  );
}
