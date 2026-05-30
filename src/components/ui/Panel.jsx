export default function Panel({ title, children }) {
  return (
    <div className="card">
      <h3 className="mb-4 text-lg font-black">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
