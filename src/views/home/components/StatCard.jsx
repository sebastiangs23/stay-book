export default function StatCard({ icon, title, value, description }) {
  return (
    <article className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-800">
        {icon}
      </div>

      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="mt-1 text-3xl font-bold text-slate-950">{value}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </article>
  );
}
