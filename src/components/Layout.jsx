import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { clearAuthed, isAuthed } from '../utils/store.js'

export default function Layout() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()
  const authed       = isAuthed()
  const onAdmin      = pathname.startsWith('/admin')

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-parchment-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-ink-900 rounded-sm flex items-center justify-center">
              <span className="text-gold-400 font-display font-bold text-xs">C</span>
            </div>
            <span className="font-display text-base font-semibold text-ink-900">CopyDesk</span>
            <span className="hidden sm:block text-[10px] text-ink-600 uppercase tracking-[.14em] ml-1 opacity-60">AI Copy Generator</span>
          </Link>
          <nav className="flex items-center gap-1">
            {onAdmin && authed ? (
              <>
                <Link to="/" className="btn-ghost text-xs">Generator</Link>
                <button onClick={() => { clearAuthed(); navigate('/') }} className="btn-ghost text-xs text-red-400 hover:text-red-600 hover:bg-red-50">Logout</button>
              </>
            ) : (
              <Link to={authed ? '/admin' : '/admin/login'} className="text-[10px] uppercase tracking-[.14em] text-ink-600 hover:text-ink-900 font-medium px-2 py-1">Admin</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t border-parchment-100 py-5 mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[11px] text-ink-600/40">CopyDesk · Powered by Gemini AI</p>
        </div>
      </footer>
    </div>
  )
}
