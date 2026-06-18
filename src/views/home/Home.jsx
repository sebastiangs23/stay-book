import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { useDispatch, useSelector } from "react-redux";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiSearch,
  FiX,
} from "react-icons/fi";

import { fetchSubmodules } from "../../store/slices/submodulesSlice";
import { fetchRooms } from "../../store/slices/roomsSlice";

import RoomCard from "./components/RoomCard";
import StatCard from "./components/StatCard";
import ReservationModal from "./components/ReservationModal";
import axiosClient from "../../api/axiosClient";
import { Flip, toast } from "react-toastify";

const roomImages = [
  "https://technical-test-abu-dhabi.s3.us-east-1.amazonaws.com/room.jpg",
  "https://technical-test-abu-dhabi.s3.us-east-1.amazonaws.com/room1.jpg",
];

const DEFAULT_LIMIT = 12;

const getRoomImage = (room, index) => {
  if (Array.isArray(room?.photos) && room.photos.length > 0) {
    return room.photos[0];
  }

  return roomImages[index % roomImages.length];
};

const formatPrice = (price) => {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return "$0.00";
  }

  return `$${numericPrice.toFixed(2)}`;
};

const formatDateForApi = (date) => {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function Home() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { rooms, meta, loading, error } = useSelector((state) => state.rooms);

  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const [currentPage, setCurrentPage] = useState(1);
  const [formError, setFormError] = useState("");

  const totalResults = meta?.total || rooms.length;
  const totalPages = meta?.totalPages || 1;
  const page = meta?.page || currentPage;

  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [reservationLoading, setReservationLoading] = useState(false);

  const storedUser = JSON.parse(
    localStorage.getItem("staybook_user") || "null",
  );
  const userId = user?.id || storedUser?.id;

  useEffect(() => {
    dispatch(fetchSubmodules());

    dispatch(
      fetchRooms({
        isActive: true,
        page: 1,
        limit: DEFAULT_LIMIT,
      }),
    );
  }, [dispatch]);

  const buildParams = (pageToLoad = 1) => {
    const params = {
      isActive: true,
      page: pageToLoad,
      limit: DEFAULT_LIMIT,
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (startDate && endDate) {
      params.checkIn = formatDateForApi(startDate);
      params.checkOut = formatDateForApi(endDate);
    }

    return params;
  };

  const loadRooms = (pageToLoad = 1) => {
    setCurrentPage(pageToLoad);
    dispatch(fetchRooms(buildParams(pageToLoad)));
  };

  const handleSearch = (event) => {
    event.preventDefault();

    if ((startDate && !endDate) || (!startDate && endDate)) {
      setFormError("Please select a complete date range.");
      return;
    }

    if (startDate && endDate && endDate <= startDate) {
      setFormError("Check-out must be after check-in.");
      return;
    }

    setFormError("");
    loadRooms(1);
  };

  async function handleCreateReservation(payload) {
    try {
      if (!userId) {
        throw new Error("You need to login before making a reservation.");
      }

      setReservationLoading(true);
      setFormError("");

      await axiosClient.post("/reservations", {
        ...payload,
        userId,
      });
      setSelectedRoom(null);

      dispatch(fetchRooms(buildParams(page)));
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
      toast.error(
        "This room is already reserved. Use the filters to find an available one.",
        {
          position: "top-center",
          autoClose: 4000,
          theme: "light",
          transition: Flip,
        },
      );
    } finally {
      setReservationLoading(false);
    }
  }

  const handleClearFilters = () => {
    setSearch("");
    setDateRange([null, null]);
    setFormError("");
    setCurrentPage(1);

    dispatch(
      fetchRooms({
        isActive: true,
        page: 1,
        limit: DEFAULT_LIMIT,
      }),
    );
  };

  const handlePreviousPage = () => {
    if (!hasPreviousPage || loading) return;

    loadRooms(page - 1);
  };

  const handleNextPage = () => {
    if (!hasNextPage || loading) return;

    loadRooms(page + 1);
  };

  return (
    <div className="pb-24 md:pb-10">
      <ReservationModal
        isOpen={Boolean(selectedRoom)}
        room={selectedRoom}
        userId={userId}
        loading={reservationLoading}
        onClose={() => setSelectedRoom(null)}
        onConfirm={handleCreateReservation}
      />

      <section>
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

            <form
              onSubmit={handleSearch}
              className="mt-8 max-w-6xl rounded-3xl bg-white/15 p-3 backdrop-blur-xl"
            >
              <div className="grid gap-3 rounded-2xl bg-white p-3 text-slate-900 shadow-lg lg:grid-cols-[1.2fr_1.4fr_auto_auto]">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3">
                  <FiSearch className="text-slate-500" />

                  <div className="w-full">
                    <label className="text-xs font-medium text-slate-500">
                      Search
                    </label>

                    <input
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setFormError("");
                      }}
                      placeholder="Search by room name or description"
                      className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3">
                  <FiCalendar className="text-slate-500" />

                  <div className="w-full">
                    <label className="text-xs font-medium text-slate-500">
                      Date range
                    </label>

                    <DatePicker
                      selectsRange
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => {
                        setDateRange(update);
                        setFormError("");

                        const [selectedStart, selectedEnd] = update;

                        if (selectedStart && selectedEnd) {
                          setCurrentPage(1);

                          dispatch(
                            fetchRooms({
                              isActive: true,
                              page: 1,
                              limit: DEFAULT_LIMIT,
                              ...(search.trim()
                                ? { search: search.trim() }
                                : {}),
                              checkIn: formatDateForApi(selectedStart),
                              checkOut: formatDateForApi(selectedEnd),
                            }),
                          );
                        }
                      }}
                      minDate={new Date()}
                      monthsShown={1}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select check-in and check-out"
                      className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                      wrapperClassName="w-full"
                      isClearable={false}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loading ? "Searching..." : "Search"}
                </button>

                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <FiX />
                  Clear
                </button>
              </div>

              {formError && (
                <div className="mt-3 rounded-2xl bg-red-500/20 px-4 py-3 text-sm text-white">
                  {formError}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Available rooms
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select a date range to show only rooms available for those dates.
          </p>
        </div>

        {!loading && !error && meta && (
          <div className="my-6 flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {totalResults} result{totalResults === 1 ? "" : "s"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Page {page} of {totalPages}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={!hasPreviousPage || loading}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronLeft />
                Previous
              </button>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={!hasNextPage || loading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[360px] animate-pulse rounded-[1.75rem] bg-slate-200"
              />
            ))}
          </div>
        )}

        {!loading && !error && rooms.length === 0 && (
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <FiCalendar className="text-xl text-slate-600" />
            </div>

            <h3 className="text-xl font-bold text-slate-950">
              No rooms available
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              All rooms are unavailable for the selected dates, or no room
              matches your search. Try another date range or search term.
            </p>
          </div>
        )}

        {!loading && !error && rooms.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rooms
              .filter((room) => storedUser.role === "STAFF" || room.isActive)
              .map((room, index) => (
                <RoomCard
                  onClick={() => setSelectedRoom(room)}
                  key={room.id}
                  image={getRoomImage(room, index)}
                  title={room.name}
                  description={room.description}
                  price={formatPrice(room.price)}
                  total={`Floor ${room.floor}`}
                />
              ))}
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <StatCard
          icon={<FiHome />}
          title="Rooms"
          value={String(totalResults)}
          description="Available with current filters"
        />
      </section>
    </div>
  );
}
