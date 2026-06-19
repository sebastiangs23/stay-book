import {
  formatDateLabel,
  getStatusClassName,
  RESERVATION_STATUS,
} from "../../../utils/utils";
import { FiX, FiEdit2 } from "react-icons/fi";

export default function ReservationCard({
  reservation,
  isStaff,
  status,
  isCancelled,
  canCancel,
  canEdit,
  onCancel,
  onEdit,
}) {
  const checkIn = formatDateLabel(reservation.checkIn);
  const checkOut = formatDateLabel(reservation.checkOut);

  const cancelled = isCancelled || status === RESERVATION_STATUS.CANCELLED;

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
              className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClassName(
                status,
              )}`}
            >
              {status}
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
        
        {!cancelled && (
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
        )}
      </div>

      {!cancelled && !canCancel && (
        <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-medium text-amber-700">
          This reservation can only be cancelled more than 24 hours before
          check-in.
        </p>
      )}

      {cancelled && (
        <p className="mt-4 rounded-2xl bg-red-50 p-3 text-xs font-medium text-red-700">
          This reservation was cancelled and can no longer be edited or
          cancelled again.
        </p>
      )}
    </article>
  );
}
