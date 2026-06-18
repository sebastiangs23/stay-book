import { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiImage, FiUsers, FiX } from "react-icons/fi";

export default function ReservationModal({
  isOpen,
  room,
  userId,
  loading = false,
  onClose,
  onConfirm,
}) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numberOfGuest, setNumberOfGuest] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setCheckIn("");
      setCheckOut("");
      setNumberOfGuest(1);
    }
  }, [isOpen]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }, [checkIn, checkOut]);

  const pricePerNight = Number(room?.price || 0);
  const totalPrice = nights * pricePerNight;

  const today = new Date().toISOString().split("T")[0];

  const canConfirm = Boolean(
    room?.id &&
    userId &&
    checkIn &&
    checkOut &&
    nights > 0 &&
    numberOfGuest >= 1 &&
    numberOfGuest <= 15,
  );

  if (!isOpen || !room) return null;

  const image =
    room.photos?.[0] ||
    "https://placehold.co/600x400,https://placehold.co/600x401";

  function handleConfirm() {
    if (!canConfirm) return;

    onConfirm({
      roomId: room.id,
      userId,
      checkIn,
      checkOut,
      numberOfGuest,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white shadow-xl">
        <div className="relative h-64 bg-slate-100">
          <img
            src={image}
            alt={room.name}
            className="h-full w-full object-cover"
          />

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiX />
          </button>

          <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-slate-700">
            Floor {room.floor}
          </div>

          <div
            className={`absolute bottom-4 right-4 rounded-full px-4 py-2 text-sm font-bold ${
              room.isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {room.isActive ? "Active" : "Inactive"}
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Reserve room {room.name}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {room.description}
              </p>
            </div>

            <p className="whitespace-nowrap text-xl font-bold text-slate-950">
              ${pricePerNight.toFixed(2)}
              <span className="text-sm font-medium text-slate-500">
                {" "}
                / night
              </span>
            </p>
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
            <FiImage />
            <span>{room.photos?.length || 0} photos</span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FiCalendar />
                Check-in
              </label>

              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(event) => {
                  setCheckIn(event.target.value);

                  if (
                    checkOut &&
                    new Date(event.target.value) >= new Date(checkOut)
                  ) {
                    setCheckOut("");
                  }
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FiCalendar />
                Check-out
              </label>

              <input
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(event) => setCheckOut(event.target.value)}
                disabled={!checkIn}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FiUsers />
              Number of guests
            </label>

            <input
              type="number"
              min={1}
              max={15}
              value={numberOfGuest}
              onChange={(event) => {
                const value = Number(event.target.value);

                if (value > 15) {
                  setNumberOfGuest(15);
                  return;
                }

                if (value < 1) {
                  setNumberOfGuest(1);
                  return;
                }

                setNumberOfGuest(value);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />
          </div>

          <div className="mt-6 rounded-3xl bg-slate-50 p-5">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Price per night</span>
              <span className="font-semibold">${pricePerNight.toFixed(2)}</span>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
              <span>Nights</span>
              <span className="font-semibold">{nights}</span>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
              <span>Guests</span>
              <span className="font-semibold">{numberOfGuest}</span>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-950">
                  Total
                </span>

                <span className="text-2xl font-bold text-slate-950">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {checkIn && checkOut && nights === 0 && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Check-out must be after check-in.
            </div>
          )}

          {(numberOfGuest < 1 || numberOfGuest > 15) && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Number of guests must be between 1 and 15.
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm || loading}
              className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Reserving..." : "Confirm reservation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
