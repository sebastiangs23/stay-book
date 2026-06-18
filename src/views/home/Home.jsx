import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiArrowRight,
  FiCalendar,
  FiHome,
  FiSearch,
  FiUsers,
} from "react-icons/fi";
import { fetchSubmodules } from "../../store/slices/subodulesSlice";

import RoomCard from "./components/RoomCard";
import StatCard from "./components/StatCard";

const roomImages = [
  "https://technical-test-abu-dhabi.s3.us-east-1.amazonaws.com/room.jpg",
  "https://technical-test-abu-dhabi.s3.us-east-1.amazonaws.com/room1.jpg",
];

function getSubmodulePath(name) {
  const normalized = name.toLowerCase();

  if (normalized === "home") return "/home";
  if (normalized === "users") return "/users";
  if (normalized === "rooms") return "/rooms";
  if (normalized === "reservations") return "/reservations";

  return `/${normalized}`;
}

export default function Home() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { submodules, loading, error } = useSelector(
    (state) => state.submodules,
  );

  useEffect(() => {
    dispatch(fetchSubmodules());
  }, [dispatch]);

  const activeSubmodules = submodules.filter((item) => item.isActive);

  return (
    <div className="pb-24 md:pb-10">
      <section className="">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8 lg:min-h-[430px]">
          <img
            src={roomImages[0]}
            alt="StayBook room"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-black/10" />

          <div className="relative z-10 flex min-h-[360px] flex-col justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-md">
                StayBook Platform
              </p>

              <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Hey, {user?.name || "there"}! Tell us where you want to go
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-white/80">
                Browse available rooms, manage reservations, and keep hotel
                operations organized from one clean dashboard.
              </p>
            </div>

            <div className="mt-8 max-w-2xl rounded-3xl bg-white/15 p-3 backdrop-blur-xl">
              <div className="grid gap-3 rounded-2xl bg-white p-3 text-slate-900 shadow-lg sm:grid-cols-[1fr_1fr_auto]">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3">
                  <FiSearch className="text-slate-500" />
                  <div>
                    <p className="text-xs font-medium text-slate-500">Search</p>
                    <p className="text-sm font-semibold">Available rooms</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3">
                  <FiCalendar className="text-slate-500" />
                  <div>
                    <p className="text-xs font-medium text-slate-500">Dates</p>
                    <p className="text-sm font-semibold">Check availability</p>
                  </div>
                </div>

                <Link
                  to="/rooms"
                  className="flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Explore
                </Link>
              </div>
            </div>
          </div>
        </div>

      </section>

      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              The most relevant
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Featured rooms for guests
            </p>
          </div>

          <Link
            to="/rooms"
            className="hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 sm:block"
          >
            View all
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <RoomCard
            image={roomImages[0]}
            title="The WonderInn Riverside Retreat"
            description="2 bedrooms · 2 beds · 1 bathroom"
            price="C$87"
            total="C$261 total"
            rating="4.93"
          />

          <RoomCard
            image={roomImages[1]}
            title="Tiny home in Reilingen"
            description="4 guests · 2 bedrooms · 2 beds"
            price="C$91"
            total="C$273 total"
            rating="4.96"
          />

          <RoomCard
            image={roomImages[0]}
            title="Entire cabin with mountain view"
            description="2 guests · 1 bedroom · Wi-Fi"
            price="C$108"
            total="C$324 total"
            rating="4.92"
          />
        </div>
      </section>
      
      {/* TODO: Make it dynamic and bring real data */}
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <StatCard
          icon={<FiHome />}
          title="Rooms"
          value="10+"
          description="Manage available inventory"
        />

        <StatCard
          icon={<FiCalendar />}
          title="Reservations"
          value="Live"
          description="Track guest bookings"
        />
      </section>
    </div>
  );
}
