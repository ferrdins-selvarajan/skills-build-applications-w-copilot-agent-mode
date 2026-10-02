import useApiCollection from '../hooks/useApiCollection.js'

function Teams() {
  const { records, loading, error } = useApiCollection('teams')

  return (
    <main className="container py-5">
      <h1 className="fw-bold mb-4">Teams</h1>
      {loading && <p role="status">Loading teams...</p>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {!loading && !error && records.length === 0 && (
        <p className="text-secondary">No teams are available yet.</p>
      )}
      <div className="row g-3">
        {records.map((team, index) => (
          <div className="col-md-6 col-lg-4" key={team._id || team.id || index}>
            <article className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h5">{team.name || 'Team'}</h2>
                {team.description && <p className="text-secondary">{team.description}</p>}
                <p className="mb-1">Captain: {team.owner?.name || team.owner || '—'}</p>
                <p className="mb-0">Members: {Array.isArray(team.members) ? team.members.length : 0}</p>
              </div>
            </article>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Teams
