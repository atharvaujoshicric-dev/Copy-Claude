import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkAdminPw, hasAdminPw, setAdminPw, setAuthed } from '../utils/store.js'

export default function AdminLoginPage() {
  const [pw,    setPw]    = useState('')
  const [pw2,   setPw2]   = useState('')
  const [error, setError] = useState('')
  const navigate  = useNavigate()
  const firstTime = !hasAdminPw()

  function submit(e) {
    e.preventDefault()
    setError('')
    if (firstTime) {
      if (pw.length < 6) return setError('Password must be at least 6 characters.')
      if (pw !== pw2)    return setError('Passwords do not match.')
      setAdminPw(pw)
      setAuthed()
      navigate('/admin')
    } else {
      if (checkAdminPw(pw)) { setAuthed(); navigate('/admin') }
      else setError('Incorrect password.')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-11 h-11 bg-ink-900 rounded-sm flex items-center justify-center mx-auto mb-4">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2.5" y="7" width="11" height="8" rx="1.5" stroke="#D4A847" strokeWidth="1.5"/>
              <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="#D4A847" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="8" cy="11.5" r="1" fill="#D4A847"/>
            </svg>
          </div>
          <h1 className="font-display text-2xl text-ink-900 mb-1">
            {firstTime ? 'Set Admin Password' : 'Admin Login'}
          </h1>
          <p className="text-sm text-ink-600">
            {firstTime ? 'Create a password to protect admin settings' : 'Manage projects and settings'}
          </p>
        </div>
        <div className="card p-7">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">{firstTime ? 'Choose Password' : 'Password'}</label>
              <input type="password" className="input-field" autoFocus required
                placeholder={firstTime ? 'Min. 6 characters' : 'Enter password'}
                value={pw} onChange={e => setPw(e.target.value)} />
            </div>
            {firstTime && (
              <div>
                <label className="label">Confirm Password</label>
                <input type="password" className="input-field" required placeholder="Repeat password"
                  value={pw2} onChange={e => setPw2(e.target.value)} />
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-sm px-4 py-2.5">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}
            <button type="submit" disabled={!pw} className="btn-primary w-full">
              {firstTime ? 'Create Password & Enter' : 'Login'}
            </button>
          </form>
        </div>
        <p className="text-center text-[11px] text-ink-600/40 mt-5">
          Password is stored locally in this browser only.
        </p>
      </div>
    </div>
  )
}
