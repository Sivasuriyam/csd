export function Loader({ label = 'Loading tickets…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 py-14 px-6 text-center">
      <div className="text-3xl">⚠️</div>
      <p className="font-medium text-red-700">We couldn't load the tickets</p>
      <p className="max-w-md text-sm text-red-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title = 'No tickets found', subtitle = 'Try adjusting your search or filters.' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <div className="text-3xl">🗂️</div>
      <p className="font-medium text-slate-700">{title}</p>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
  )
}
