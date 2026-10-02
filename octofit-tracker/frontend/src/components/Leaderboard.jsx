import useApiCollection from '../hooks/useApiCollection.js'

function Leaderboard() {
  const { records, loading, error } = useApiCollection('leaderboard')

  return (
    <main className="container py-5">
      <h1 className="fw-bold mb-4">Leaderboard</h1>
      {loading && <p role="status">Loading leaderboard...</p>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {!loading && !error && records.length === 0 && (
        <p className="text-secondary">The leaderboard is waiting for its first activity.</p>
      )}
      {!loading && !error && records.length > 0 && (
        <div className="table-responsive">
          <table className="table table-hover align-middle bg-white">
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Athlete</th>
                <th scope="col">Team</th>
                <th scope="col">Activities</th>
                <th scope="col">Points</th>
              </tr>
            </thead>
            <tbody>
              {records.map((entry, index) => (
                <tr key={entry._id || entry.id || entry.user?._id || index}>
                  <th scope="row">{index + 1}</th>
                  <td>{entry.user?.name || entry.name || 'Athlete'}</td>
                  <td>{entry.user?.team?.name || entry.user?.team || '—'}</td>
                  <td>{entry.activitiesCount ?? 0}</td>
                  <td className="fw-semibold">{entry.points ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

export default Leaderboard
