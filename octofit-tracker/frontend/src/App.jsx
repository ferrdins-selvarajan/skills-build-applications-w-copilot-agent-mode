import { NavLink, Route, Routes } from 'react-router-dom'
import octofitLogo from '../../../docs/octofitapp-small.png'
import Activities from './components/Activities.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import Teams from './components/Teams.jsx'
import Users from './components/Users.jsx'
import Workouts from './components/Workouts.jsx'
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
            <NavLink className="nav-link" to="/leaderboard">Leaderboard</NavLink>
            <NavLink className="nav-link" to="/teams">Teams</NavLink>
            <NavLink className="nav-link" to="/users">Users</NavLink>
            <NavLink className="nav-link" to="/workouts">Workouts</NavLink>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/users" element={<Users />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="*" element={<main className="container py-5"><h1>Page not found</h1></main>} />
      </Routes>
    </div>
  )
}

export default App
