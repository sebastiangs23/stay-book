import { FiStar } from "react-icons/fi";

const AMENITY_LABELS = {
  WIFI: "Wi-Fi",
  TV: "TV",
  AIR_CONDITIONING: "Air conditioning",
  PRIVATE_BATHROOM: "Private bathroom",
  BREAKFAST: "Breakfast",
  DESK: "Desk",
  PARKING: "Parking",
};

function normalizeAmenities(amenities) {
  if (!Array.isArray(amenities)) {
    return [];
  }

  return amenities
    .flatMap((item) => {
      if (typeof item === "string" && item.trim().startsWith("[")) {
        try {
          const parsed = JSON.parse(item);

          if (Array.isArray(parsed)) {
            return parsed;
          }

          return item;
        } catch {
          return item;
        }
      }

      return item;
    })
    .filter(Boolean);
}

function formatAmenityLabel(amenityValue) {
  const key = String(amenityValue || "")
    .trim()
    .toUpperCase()
    .replaceAll(" ", "_")
    .replaceAll("-", "_");

  if (AMENITY_LABELS[key]) {
    return AMENITY_LABELS[key];
  }

  return String(amenityValue)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function RoomCard({
  image,
  title,
  description,
  price,
  total,
  rating,
  amenities = [],
  onClick,
}) {
  const cleanAmenities = normalizeAmenities(amenities);

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-[1.75rem] bg-white p-3 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative overflow-hidden rounded-[1.4rem]">
        <img
          src={image}
          alt={title}
          className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="px-2 pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-950">{title}</h3>

            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>

          {rating && (
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-900">
              <FiStar className="fill-slate-900" size={14} />
              {rating}
            </div>
          )}
        </div>

        {cleanAmenities.length > 0 && (
          <p className="mt-3 line-clamp-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-700">Amenities: </span>
            {cleanAmenities.map(formatAmenityLabel).join(", ")}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="font-bold text-slate-950">{price}</span>

          {total && <span className="text-slate-500">· {total}</span>}
        </div>
      </div>
    </article>
  );
}
