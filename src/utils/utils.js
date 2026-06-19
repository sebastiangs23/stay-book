//Static Data
export const RESERVATION_STATUS = {
  UPCOMING: "UPCOMING",
  ACTIVE: "ACTIVE",
  CANCELLED: "CANCELLED",
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

export const AMENITY_OPTIONS = [
  { value: "WIFI", label: "Wi-Fi" },
  { value: "TV", label: "TV" },
  { value: "AIR_CONDITIONING", label: "Air conditioning" },
  { value: "PRIVATE_BATHROOM", label: "Private bathroom" },
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "DESK", label: "Desk" },
  { value: "PARKING", label: "Parking" },
];

export const emptyForm = {
  name: "",
  description: "",
  price: "",
  floor: "",
  isActive: true,
  amenities: [],
};

export const roomImages = [
  "https://technical-test-abu-dhabi.s3.us-east-1.amazonaws.com/room.jpg",
  "https://technical-test-abu-dhabi.s3.us-east-1.amazonaws.com/room1.jpg",
];

export const DEFAULT_LIMIT = 12;

//Helpers fns()
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

export const getRoomImage = (room, index) => {
  if (Array.isArray(room?.photos) && room.photos.length > 0) {
    return room.photos[0];
  }

  return roomImages[index % roomImages.length];
};

export const formatPrice = (price) => {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return "$0.00";
  }

  return `$${numericPrice.toFixed(2)}`;
};

export const formatDateForApi = (date) => {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
