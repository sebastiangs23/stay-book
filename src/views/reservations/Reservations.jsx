import { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiEdit2, FiUser, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";

export default function Reservations() {
  const user = JSON.parse(localStorage.getItem("staybook_user"));
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);

  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [editNumberOfGuest, setEditNumberOfGuest] = useState(1);
  const isStaff = user?.role === "STAFF";
  const isGuest = user?.role === "GUEST";

  useEffect(() => {
    if (!user?.id) return;

    fetchReservations();
  }, [user?.id, user?.role]);

  async function fetchReservations() {
    try {
      setLoading(true);

      const params = isStaff ? {} : { userId: user.id };

      const response = await axiosClient.get("/reservations", {
        params,
      });

      setReservations(response.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not load reservations",
      );
    } finally {
      setLoading(false);
    }
  }

  function isPastReservation(reservation) {
    const today = new Date();
    const checkOut = new Date(reservation.checkOut);

    return checkOut < today;
  }

  function isUpcomingReservation(reservation) {
    const today = new Date();
    const checkOut = new Date(reservation.checkOut);

    return checkOut >= today;
  }

  function canCancelReservation(reservation) {
    if (reservation.status === "CANCELLED") return false;

    const now = new Date();
    const checkIn = new Date(reservation.checkIn);

    const diffMs = checkIn.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours > 24;
  }

  function canEditReservation(reservation) {
    if (reservation.status === "CANCELLED") return false;
    if (isPastReservation(reservation)) return false;

    return true;
  }

  const upcomingReservations = useMemo(() => {
    return reservations.filter(isUpcomingReservation);
  }, [reservations]);

  const pastReservations = useMemo(() => {
    return reservations.filter(isPastReservation);
  }, [reservations]);

  async function handleCancelReservation(reservation) {
    if (!canCancelReservation(reservation)) {
      toast.error(
        "You can only cancel a reservation more than 24 hours before check-in.",
      );
      return;
    }

    try {
      await axiosClient.patch(`/reservations/${reservation.id}/cancel`);

      toast.success("Reservation cancelled successfully");
      fetchReservations();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not cancel reservation",
      );
    }
  }

  function openEditModal(reservation) {
    setEditingReservation(reservation);

    setEditCheckIn(formatDateForInput(reservation.checkIn));
    setEditCheckOut(formatDateForInput(reservation.checkOut));
    setEditNumberOfGuest(reservation.numberOfGuest || 1);
  }

  function closeEditModal() {
    setEditingReservation(null);
    setEditCheckIn("");
    setEditCheckOut("");
    setEditNumberOfGuest(1);
  }

  async function handleUpdateReservation() {
    if (!editingReservation) return;

    const nights = calculateNights(editCheckIn, editCheckOut);

    if (nights <= 0) {
      toast.error("Check-out must be after check-in.");
      return;
    }

    if (editNumberOfGuest < 1 || editNumberOfGuest > 15) {
      toast.error("Number of guests must be between 1 and 15.");
      return;
    }

    try {
      await axiosClient.patch(`/reservations/${editingReservation.id}`, {
        checkIn: editCheckIn,
        checkOut: editCheckOut,
        numberOfGuest: editNumberOfGuest,
      });

      toast.success("Reservation updated successfully");
      closeEditModal();
      fetchReservations();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "The room is not available for the selected dates.",
      );
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-950">Reservations</h2>

        <p className="mt-2 text-sm text-slate-500">
          {isStaff
            ? "Manage all reservations and see guest information."
            : "View, edit, or cancel your reservations."}
        </p>
      </div>

      {loading && (
        <div className="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading reservations...
        </div>
      )}

      {!loading && (
        <>
          <ReservationSection
            title="Upcoming reservations"
            reservations={upcomingReservations}
            isStaff={isStaff}
            canCancelReservation={canCancelReservation}
            canEditReservation={canEditReservation}
            onCancel={handleCancelReservation}
            onEdit={openEditModal}
          />

          <ReservationSection
            title="Past reservations"
            reservations={pastReservations}
            isStaff={isStaff}
            canCancelReservation={canCancelReservation}
            canEditReservation={canEditReservation}
            onCancel={handleCancelReservation}
            onEdit={openEditModal}
          />
        </>
      )}

      {editingReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeEditModal}
          />

          <div className="relative z-10 w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-950">
                  Edit reservation
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Update the reservation dates or number of guests.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              >
                <FiX />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FiCalendar />
                  Check-in
                </label>

                <input
                  type="date"
                  value={editCheckIn}
                  onChange={(event) => {
                    setEditCheckIn(event.target.value);

                    if (
                      editCheckOut &&
                      new Date(event.target.value) >= new Date(editCheckOut)
                    ) {
                      setEditCheckOut("");
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
                  value={editCheckOut}
                  min={editCheckIn}
                  disabled={!editCheckIn}
                  onChange={(event) => setEditCheckOut(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FiUser />
                Number of guests
              </label>

              <input
                type="number"
                min={1}
                max={15}
                value={editNumberOfGuest}
                onChange={(event) => {
                  const value = Number(event.target.value);

                  if (value > 15) {
                    setEditNumberOfGuest(15);
                    return;
                  }

                  if (value < 1) {
                    setEditNumberOfGuest(1);
                    return;
                  }

                  setEditNumberOfGuest(value);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdateReservation}
                className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReservationSection({
  title,
  reservations,
  isStaff,
  canCancelReservation,
  canEditReservation,
  onCancel,
  onEdit,
}) {
  return (
    <section>
      <h3 className="mb-4 text-xl font-bold text-slate-950">{title}</h3>

      {reservations.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-sm">
          No reservations found.
        </div>
      ) : (
        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              isStaff={isStaff}
              canCancel={canCancelReservation(reservation)}
              canEdit={canEditReservation(reservation)}
              onCancel={() => onCancel(reservation)}
              onEdit={() => onEdit(reservation)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ReservationCard({
  reservation,
  isStaff,
  canCancel,
  canEdit,
  onCancel,
  onEdit,
}) {
  const checkIn = formatDateLabel(reservation.checkIn);
  const checkOut = formatDateLabel(reservation.checkOut);

  return (
    <article className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-lg font-bold text-slate-950">
              Room{" "}
              {reservation.roomName ||
                reservation.room?.name ||
                reservation.roomId}
            </h4>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                reservation.status === "CONFIRMED"
                  ? "bg-emerald-100 text-emerald-700"
                  : reservation.status === "CANCELLED"
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-700"
              }`}
            >
              {reservation.status}
            </span>
          </div>

          {isStaff && (
            <p className="mt-2 text-sm text-slate-500">
              Guest:{" "}
              <span className="font-semibold text-slate-700">
                {reservation.guestName ||
                  reservation.user?.name ||
                  reservation.userName ||
                  "Guest name not available"}
              </span>
            </p>
          )}

          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
            <p>
              <span className="font-semibold text-slate-800">Check-in:</span>{" "}
              {checkIn}
            </p>

            <p>
              <span className="font-semibold text-slate-800">Check-out:</span>{" "}
              {checkOut}
            </p>

            <p>
              <span className="font-semibold text-slate-800">Guests:</span>{" "}
              {reservation.numberOfGuest || 1}
            </p>

            <p>
              <span className="font-semibold text-slate-800">Total:</span> $
              {Number(reservation.totalPrice || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
          <button
            type="button"
            onClick={onEdit}
            disabled={!canEdit}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiEdit2 />
            Edit
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={!canCancel}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiX />
            Cancel
          </button>
        </div>
      </div>

      {!canCancel && reservation.status !== "CANCELLED" && (
        <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-medium text-amber-700">
          This reservation can only be cancelled more than 24 hours before
          check-in.
        </p>
      )}
    </article>
  );
}

function formatDateForInput(date) {
  if (!date) return "";

  return new Date(date).toISOString().split("T")[0];
}

function formatDateLabel(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}
