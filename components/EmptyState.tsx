export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  );
}
