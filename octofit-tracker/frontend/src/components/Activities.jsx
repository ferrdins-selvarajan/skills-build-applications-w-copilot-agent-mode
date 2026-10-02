import useApiCollection from '../hooks/useApiCollection.js'

const apiEndpoint = import.meta.env.VITE_CODESPACE_NAME
  ? `https://${import.meta.env.VITE_CODESPACE_NAME}-8000.app.github.dev/api/activities/`
  : null

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString()
}

function Activities() {
  const { records, loading, error } = useApiCollection(apiEndpoint)

  return (
    <main className="container py-5">
      <h1 className="fw-bold mb-4">Activities</h1>
      {loading && <p role="status">Loading activities...</p>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {!loading && !error && records.length === 0 && (
        <p className="text-secondary">No activities have been logged yet.</p>
      )}
      <div className="row g-3">
        {records.map((activity, index) => (
          <div className="col-md-6 col-lg-4" key={activity._id || activity.id || index}>
            <article className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h5 text-capitalize">{activity.type || 'Activity'}</h2>
                <p className="text-secondary mb-2">{formatDate(activity.date)}</p>
                <p className="mb-1">{activity.durationMinutes ?? '—'} minutes</p>
                <p className="mb-1">{activity.distanceKm ?? 0} km</p>
                <p className="mb-1">{activity.points ?? 0} points</p>
                {activity.notes && <p className="mb-0 mt-3">{activity.notes}</p>}
              </div>
            </article>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Activities
