import { FiHeart, FiStar } from "react-icons/fi";

export default function RoomCard({
  image,
  title,
  description,
  price,
  total,
  rating,
  onClick,
}) {
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

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            // favorite logic here later
          }}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-sm backdrop-blur-md"
        >
          <FiHeart />
        </button>
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

        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="font-bold text-slate-950">{price}</span>

          {total && <span className="text-slate-500">· {total}</span>}
        </div>
      </div>
    </article>
  );
}
