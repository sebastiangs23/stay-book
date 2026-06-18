import { useEffect, useState } from "react";
import { FiCalendar, FiRefreshCw, FiUser, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";
import ReservationSection from "./components/ReservationSection";

import {
  RESERVATION_STATUS,
  STATUS_TABS,
  getStatusLabel,
  getStoredUser,
  formatDateForInput,
  calculateNights,
} from "../../utils/utils";

export default function Reservations() {
  const user = getStoredUser();

  const [reservations, setReservations] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(
    RESERVATION_STATUS.UPCOMING,
  );
  const [loading, setLoading] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);

  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [editNumberOfGuest, setEditNumberOfGuest] = useState(1);

  const isStaff = user?.role === "STAFF";
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!user?.id) return;

    fetchReservations(selectedStatus);
  }, [user?.id, user?.role, selectedStatus]);

  async function fetchReservations(status = selectedStatus) {
    try {
      setLoading(true);

      const params = {
        status,
      };

      if (!isStaff) {
        params.userId = user.id;
      }

      const response = await axiosClient.get("/reservations", {
        params,
      });

      setReservations(response.data?.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not load reservations",
      );
    } finally {
      setLoading(false);
    }
  }

  function getReservationStatus(reservation) {
    if (reservation.status === RESERVATION_STATUS.CANCELLED) {
      return RESERVATION_STATUS.CANCELLED;
    }

    if (reservation.status === RESERVATION_STATUS.UPCOMING) {
      return RESERVATION_STATUS.UPCOMING;
    }

    if (reservation.status === RESERVATION_STATUS.ACTIVE) {
      return RESERVATION_STATUS.ACTIVE;
    }

    const now = new Date();
    const checkIn = new Date(reservation.checkIn);
    const checkOut = new Date(reservation.checkOut);

    if (checkIn > now) return RESERVATION_STATUS.UPCOMING;
    if (checkIn <= now && checkOut > now) return RESERVATION_STATUS.ACTIVE;

    return "PAST";
  }

  function canCancelReservation(reservation) {
    const status = getReservationStatus(reservation);

    if (status === RESERVATION_STATUS.CANCELLED) return false;

    /**
     * This matches your current backend rule:
     * any user can cancel only if the reservation is more than 24 hours
     * before check-in.
     *
     * If later you want STAFF to cancel any reservation, the backend must also
     * be changed to receive/authenticate the user role.
     */
    if (status !== RESERVATION_STATUS.UPCOMING) return false;

    const now = new Date();
    const checkIn = new Date(reservation.checkIn);

    const diffMs = checkIn.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours > 24;
  }

  function canEditReservation(reservation) {
    const status = getReservationStatus(reservation);

    if (status === RESERVATION_STATUS.CANCELLED) return false;
    if (status === RESERVATION_STATUS.ACTIVE) return false;
    if (status === "PAST") return false;

    return true;
  }

  async function handleCancelReservation(reservation) {
    if (!canCancelReservation(reservation)) {
      toast.error(
        "You can only cancel an upcoming reservation more than 24 hours before check-in.",
      );
      return;
    }

    try {
      await axiosClient.patch(`/reservations/${reservation.id}/cancel`);

      toast.success("Reservation cancelled successfully");
      fetchReservations(selectedStatus);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not cancel reservation",
      );
    }
  }

  function openEditModal(reservation) {
    setEditingReservation(reservation);

    const reservationCheckIn = formatDateForInput(reservation.checkIn);
    const reservationCheckOut = formatDateForInput(reservation.checkOut);

    setEditCheckIn(reservationCheckIn < today ? today : reservationCheckIn);
    setEditCheckOut(reservationCheckOut);
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
      fetchReservations(selectedStatus);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "The room is not available for the selected dates.",
      );
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">Reservations</h2>

          <p className="mt-2 text-sm text-slate-500">
            {isStaff
              ? "Manage all reservations and see guest information."
              : "View, edit, or cancel your reservations."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchReservations(selectedStatus)}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="rounded-3xl bg-white p-2 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-3">
          {STATUS_TABS.map((tab) => {
            const isActive = selectedStatus === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedStatus(tab.value)}
                className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  isActive
                    ? "bg-black text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading reservations...
        </div>
      )}

      {!loading && (
        <ReservationSection
          title={`${getStatusLabel(selectedStatus)} reservations`}
          reservations={reservations}
          isStaff={isStaff}
          canCancelReservation={canCancelReservation}
          canEditReservation={canEditReservation}
          onCancel={handleCancelReservation}
          onEdit={openEditModal}
          getReservationStatus={getReservationStatus}
        />
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
                  min={today}
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
                  min={editCheckIn || today}
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
