import useApiCollection from '../hooks/useApiCollection.js'

function Users() {
  const { records, loading, error } = useApiCollection('users')

  return (
    <main className="container py-5">
      <h1 className="fw-bold mb-4">Users</h1>
      {loading && <p role="status">Loading users...</p>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {!loading && !error && records.length === 0 && (
        <p className="text-secondary">No users are available yet.</p>
      )}
      <div className="row g-3">
        {records.map((user, index) => (
          <div className="col-md-6 col-lg-4" key={user._id || user.id || index}>
            <article className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h5">{user.name || 'OctoFit member'}</h2>
                {user.email && <p className="text-secondary">{user.email}</p>}
                <p className="mb-0">Team: {user.team?.name || user.team || 'Not on a team'}</p>
              </div>
            </article>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Users
