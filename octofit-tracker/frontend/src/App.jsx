import { NavLink, Route, Routes } from 'react-router-dom'
import octofitLogo from '../../../docs/octofitapp-small.png'
import './App.css'

function Dashboard() {
  return (
    <main className="container py-5">
      <div className="row align-items-center g-5">
        <div className="col-lg-7">
          <p className="text-uppercase text-success fw-semibold mb-2">Move together</p>
          <h1 className="display-4 fw-bold">Make every move count.</h1>
          <p className="lead text-secondary">
            Track your activities, team up with friends, and celebrate your
            progress with OctoFit Tracker.
          </p>
          <NavLink className="btn btn-success btn-lg mt-2" to="/activities">
            Explore activities
          </NavLink>
        </div>
        <div className="col-lg-5 text-center">
          <img className="img-fluid octofit-logo" src={octofitLogo} alt="OctoFit Tracker" />
        </div>
      </div>
    </main>
  )
}

function Activities() {
  return (
    <main className="container py-5">
      <h1 className="fw-bold">Activities</h1>
      <p className="text-secondary">Your activity tracking workspace is ready to build.</p>
    </main>
  )
}

function App() {
  return (
    <div className="min-vh-100">
      <nav className="navbar navbar-expand bg-white border-bottom">
        <div className="container">
          <NavLink className="navbar-brand fw-bold text-success" to="/">
            OctoFit Tracker
          </NavLink>
          <div className="navbar-nav">
            <NavLink className="nav-link" to="/">Dashboard</NavLink>
            <NavLink className="nav-link" to="/activities">Activities</NavLink>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="*" element={<main className="container py-5"><h1>Page not found</h1></main>} />
      </Routes>
    </div>
  )
}

export default App
