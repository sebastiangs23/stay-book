export const RESERVATION_STATUS = {
  UPCOMING: "upcoming",
  ACTIVE: "active",
  CANCELLED: "cancelled",
};

export const STATUS_TABS = [
  {
    label: "Upcoming",
    value: RESERVATION_STATUS.UPCOMING,
  },
  {
    label: "Active",
    value: RESERVATION_STATUS.ACTIVE,
  },
  {
    label: "Cancelled",
    value: RESERVATION_STATUS.CANCELLED,
  },
];

export function getStoredUser() {
  const storedUser = localStorage.getItem("staybook_user");

  if (!storedUser || storedUser === "undefined" || storedUser === "null") {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("staybook_user");
    return null;
  }
}

export function getStatusLabel(status) {
  if (status === RESERVATION_STATUS.UPCOMING) return "UPCOMING";
  if (status === RESERVATION_STATUS.ACTIVE) return "ACTIVE";
  if (status === RESERVATION_STATUS.CANCELLED) return "CANCELLED";

  return status;
}

export function getStatusClassName(status) {
  if (status === RESERVATION_STATUS.UPCOMING) {
    return "bg-blue-100 text-blue-700";
  }

  if (status === RESERVATION_STATUS.ACTIVE) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === RESERVATION_STATUS.CANCELLED) {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

export function formatDateForInput(date) {
  if (!date) return "";

  return new Date(date).toISOString().split("T")[0];
}

export function formatDateLabel(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}
