import ReservationCard from "./ReservationCard";

export default function ReservationSection({
  title,
  reservations,
  isStaff,
  canCancelReservation,
  canEditReservation,
  onCancel,
  onEdit,
  getReservationStatus,
}) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-950">{title}</h3>

          <p className="mt-1 text-sm text-slate-500">
            {reservations.length} reservation
            {reservations.length === 1 ? "" : "s"} found.
          </p>
        </div>
      </div>

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
              status={getReservationStatus(reservation)}
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
