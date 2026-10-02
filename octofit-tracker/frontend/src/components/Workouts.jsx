import useApiCollection from '../hooks/useApiCollection.js'

const apiEndpoint = import.meta.env.VITE_CODESPACE_NAME
  ? `https://${import.meta.env.VITE_CODESPACE_NAME}-8000.app.github.dev/api/workouts/`
  : null

function Workouts() {
  const { records, loading, error } = useApiCollection(apiEndpoint)

  return (
    <main className="container py-5">
      <h1 className="fw-bold mb-4">Workouts</h1>
      {loading && <p role="status">Loading workouts...</p>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {!loading && !error && records.length === 0 && (
        <p className="text-secondary">No workouts are available yet.</p>
      )}
      <div className="row g-3">
        {records.map((workout, index) => (
          <div className="col-md-6 col-lg-4" key={workout._id || workout.id || index}>
            <article className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h5">{workout.title || 'Workout'}</h2>
                <p className="text-secondary">{workout.description}</p>
                <p className="mb-1 text-capitalize">{workout.activityType} · {workout.difficulty}</p>
                <p className="mb-2">{workout.durationMinutes ?? '—'} minutes</p>
                {Array.isArray(workout.tags) && workout.tags.length > 0 && (
                  <div className="d-flex flex-wrap gap-2">
                    {workout.tags.map((tag) => (
                      <span className="badge text-bg-light" key={tag}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Workouts
