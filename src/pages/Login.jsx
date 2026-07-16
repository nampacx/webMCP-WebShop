import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { dummyUsers } from '../data/users.js'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const result = login(email, password)
    if (result.ok) {
      navigate(from, { replace: true })
    } else {
      setError(result.error)
    }
  }

  function fillDemo(user) {
    setEmail(user.email)
    setPassword(user.password)
    setError('')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-sub">Sign in to build your cart and check out.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@contoso.com"
              autoComplete="username"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block">
            Sign in
          </button>
        </form>

        <div className="demo-hint">
          <p className="demo-hint-title">Demo accounts</p>
          {dummyUsers.map((u) => (
            <button key={u.id} className="demo-account" onClick={() => fillDemo(u)}>
              <span className="demo-email">{u.email}</span>
              <span className="demo-pass">{u.password}</span>
              <span className="demo-use">Use →</span>
            </button>
          ))}
        </div>

        <p className="auth-foot">
          <Link to="/">← Back to catalog</Link>
        </p>
      </div>
    </div>
  )
}
