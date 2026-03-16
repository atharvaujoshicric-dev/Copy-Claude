import { useState, useEffect } from 'react'
import {
  getApiKey, setApiKey,
  fetchProjects, createProject, updateProject, deleteProject,
} from '../utils/store.js'

export default function AdminDashboard() {
  const [tab, setTab] = useState('projects')
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[.16em] text-gold-500 font-semibold mb-1">Admin Panel</p>
        <h1 className="font-display text-3xl text-ink-900">Dashboard</h1>
      </div>
      <div className="flex gap-1 mb-8 border-b border-parchment-200">
        {[['projects','Projects & CTB'],['settings','Settings']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all
              ${tab === id ? 'border-ink-900 text-ink-900' : 'border-transparent text-ink-600 hover:text-ink-900'}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'projects' ? <ProjectsTab /> : <SettingsTab />}
    </div>
  )
}

/* ─── PROJECTS TAB ─── */
function ProjectsTab() {
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState(null)

  function notify(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function load() {
    fetchProjects().then(setProjects)
  }

  useEffect(() => { load() }, [])

  async function handleSave(data) {
    setSaving(true)
    try {
      if (editItem) await updateProject(editItem.id, data)
      else await createProject(data)
      notify(editItem ? 'Project updated!' : 'Project created!')
      setShowForm(false)
      load()
    } catch (e) {
      notify(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    await deleteProject(id)
    notify('Project deleted')
    setDeleteId(null)
    load()
  }

  return (
    <>
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-sm shadow-lg text-sm font-medium
          ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-ink-900 text-parchment-50'}`}>
          {toast.msg}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-ink-950/60 z-40 flex items-center justify-center px-6">
          <div className="card p-8 max-w-sm w-full text-center shadow-xl">
            <p className="font-display text-lg mb-2">Delete Project?</p>
            <p className="text-sm text-ink-600 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-600 text-white font-medium px-5 py-2.5 rounded-sm text-sm hover:bg-red-700 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-ink-600">{projects.length} project{projects.length !== 1 ? 's' : ''} saved</p>
        <button onClick={() => { setEditItem(null); setShowForm(true) }} className="btn-gold">
          + New Project
        </button>
      </div>

      {projects.length === 0 && (
        <div className="card p-10 text-center border-dashed border-parchment-200">
          <p className="text-sm text-ink-600 mb-4">No projects yet. Create your first one.</p>
          <button onClick={() => { setEditItem(null); setShowForm(true) }} className="btn-gold">
            Create First Project
          </button>
        </div>
      )}

      {projects.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-parchment-200">
                {['Project', 'Description', 'CTB Brief', 'Created', ''].map((h, i) => (
                  <th key={i} className={`py-2.5 px-4 text-[10px] uppercase tracking-[.1em] font-semibold text-ink-600 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} className="border-b border-parchment-100 last:border-0 hover:bg-parchment-50/50">
                  <td className="py-3 px-4 text-sm font-medium text-ink-900">{p.name}</td>
                  <td className="py-3 px-4 text-sm text-ink-600 max-w-[160px]">
                    <span className="line-clamp-1">{p.description || '—'}</span>
                  </td>
                  <td className="py-3 px-4">
                    {p.ctbContent
                      ? <span className="text-[11px] text-sage-500">✓ {p.ctbContent.length.toLocaleString()} chars</span>
                      : <span className="text-[11px] text-ink-600/40">No brief</span>}
                  </td>
                  <td className="py-3 px-4 text-xs text-ink-600/50">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => { setEditItem(p); setShowForm(true) }}
                        className="text-xs px-3 py-1.5 border border-parchment-200 rounded-sm hover:border-ink-700 text-ink-600 hover:text-ink-900 transition-all">
                        Edit
                      </button>
                      <button onClick={() => setDeleteId(p.id)}
                        className="text-xs px-3 py-1.5 border border-red-200 rounded-sm hover:border-red-400 text-red-400 hover:text-red-600 transition-all">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ProjectForm
          initial={editItem}
          saving={saving}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  )
}

/* ─── PROJECT FORM ─── */
function ProjectForm({ initial, saving, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '')
  const [desc, setDesc] = useState(initial?.description || '')
  const [ctb,  setCtb]  = useState(initial?.ctbContent || '')
  const [fileLoading, setFileLoading] = useState(false)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileLoading(true)
    try {
      const text = await file.text()
      setCtb(prev => prev ? prev + '\n\n' + text : text)
    } catch {
      alert('Could not read file. Please paste content manually.')
    } finally {
      setFileLoading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="fixed inset-0 bg-ink-950/60 z-40 flex items-start justify-end">
      <div className="bg-white h-full w-full max-w-md shadow-2xl overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-7 py-5 border-b border-parchment-100">
          <h2 className="font-display text-lg text-ink-900">{initial ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose} className="text-ink-600 hover:text-ink-900 p-1 text-xl">✕</button>
        </div>
        <form
          onSubmit={e => { e.preventDefault(); onSave({ name, description: desc, ctbContent: ctb }) }}
          className="flex-1 px-7 py-6 space-y-5">
          <div>
            <label className="label">Project Name *</label>
            <input className="input-field" placeholder="e.g. Prestige Lakeside Habitat"
              value={name} onChange={e => setName(e.target.value)} required autoFocus />
          </div>
          <div>
            <label className="label">Project Description</label>
            <textarea className="input-field resize-none" rows={3}
              placeholder="Developer, location, target audience, positioning…"
              value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div>
            <label className="label">CTB / Project Brief Content</label>
            <p className="text-[11px] text-ink-600/60 mb-2 leading-relaxed">
              Paste your project brief here. This is sent to the AI as context when generating copy.
            </p>
            <textarea className="input-field resize-none font-mono text-[12px]" rows={12}
              placeholder="Paste your CTB / project brief content here…"
              value={ctb} onChange={e => setCtb(e.target.value)} />
            <div className="mt-2 flex items-center gap-3">
              <label className={`flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 border border-parchment-200 rounded-sm cursor-pointer hover:border-ink-700 text-ink-600 transition-all ${fileLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                ↑ {fileLoading ? 'Reading…' : 'Upload .txt file'}
                <input type="file" accept=".txt,.md" className="hidden" onChange={handleFile} />
              </label>
              {ctb && <span className="text-[11px] text-ink-600/50">{ctb.length.toLocaleString()} chars</span>}
            </div>
            <p className="text-[10px] text-ink-600/40 mt-1.5">For PDF/DOCX — copy-paste the content manually.</p>
          </div>
          <div className="flex gap-3 pt-2 pb-6">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
            <button type="submit" disabled={saving || !name} className="btn-gold flex-1 flex items-center justify-center gap-2">
              {saving
                ? <><span className="spinner text-white" style={{ width: 14, height: 14 }}></span> Saving…</>
                : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── SETTINGS TAB ─── */
function SettingsTab() {
  const [apiKey, setApiKeyLocal] = useState(getApiKey())
  const [saved,  setSaved]       = useState(false)

  function save(e) {
    e.preventDefault()
    setApiKey(apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-xl space-y-6">

      <div className="card p-6">
        <h2 className="font-display text-lg text-ink-900 mb-1">Gemini API Key</h2>
        <p className="text-xs text-ink-600 mb-4 leading-relaxed">
          Powers all AI copy generation. Completely free — no credit card needed.
          Get your key at{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
            className="text-gold-600 underline underline-offset-2">
            aistudio.google.com/apikey
          </a>.
          Free tier gives <strong>1,500 requests/day</strong>.
        </p>
        <label className="label">API Key (starts with AIzaSy…)</label>
        <input className="input-field font-mono text-xs" type="password"
          placeholder="AIzaSy…"
          value={apiKey} onChange={e => setApiKeyLocal(e.target.value)} />
        {apiKey && (
          <p className="text-[11px] text-sage-500 mt-1.5">✓ Key configured — {apiKey.slice(0, 12)}…</p>
        )}
      </div>

      <div className="card p-5 bg-parchment-50/50">
        <p className="text-[11px] font-semibold text-ink-800 mb-2 uppercase tracking-widest">How data is stored</p>
        <p className="text-xs text-ink-600 leading-relaxed">
          Projects and CTB content are saved in <strong>your browser's localStorage</strong> on this device.
          The Gemini API key is also stored locally — never sent to any server except Google's AI directly.
          If you clear your browser data, you'll need to re-enter your projects and key.
        </p>
      </div>

      <form onSubmit={save}>
        <button type="submit" className="btn-gold">
          {saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
