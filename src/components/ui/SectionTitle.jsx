export default function SectionTitle({ eyebrow, title }) {
  return (
    <div className="mb-6 mt-14">
      <p className="text-sm font-bold uppercase tracking-widest text-ocean">{eyebrow}</p>
      <h2 className="mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
    </div>
  );
}
