// ─── All data stored in localStorage — no external database needed ───
// Projects + CTB content live in the admin's browser.
// No CORS issues, no Google Sheets, works 100% offline.

const K = {
  API_KEY:  'cd_api_key',
  ADMIN_PW: 'cd_admin_pw',
  AUTHED:   'cd_authed',
  PROJECTS: 'cd_projects',
}

// ─── Gemini API Key ──────────────────────────────────────────────
export const getApiKey  = ()  => localStorage.getItem(K.API_KEY) || ''
export const setApiKey  = (v) => localStorage.setItem(K.API_KEY, v.trim())

// ─── Admin password ──────────────────────────────────────────────
export const setAdminPw   = (pw) => localStorage.setItem(K.ADMIN_PW, btoa(pw))
export const checkAdminPw = (pw) => btoa(pw) === (localStorage.getItem(K.ADMIN_PW) || '')
export const hasAdminPw   = ()   => !!localStorage.getItem(K.ADMIN_PW)

// ─── Session auth ────────────────────────────────────────────────
export const setAuthed   = () => sessionStorage.setItem(K.AUTHED, '1')
export const clearAuthed = () => sessionStorage.removeItem(K.AUTHED)
export const isAuthed    = () => sessionStorage.getItem(K.AUTHED) === '1'

// ─── Projects (localStorage) ─────────────────────────────────────
function readProjects() {
  try { return JSON.parse(localStorage.getItem(K.PROJECTS) || '[]') }
  catch { return [] }
}
function writeProjects(arr) {
  localStorage.setItem(K.PROJECTS, JSON.stringify(arr))
}

export function fetchProjects() {
  return Promise.resolve(readProjects())
}

export function createProject(data) {
  const projects = readProjects()
  const project  = {
    id:          Date.now().toString(),
    name:        data.name        || '',
    description: data.description || '',
    ctbContent:  data.ctbContent  || '',
    createdAt:   new Date().toISOString(),
  }
  writeProjects([...projects, project])
  return Promise.resolve({ success: true, id: project.id })
}

export function updateProject(id, data) {
  const projects = readProjects().map(p =>
    p.id === id ? { ...p, ...data } : p
  )
  writeProjects(projects)
  return Promise.resolve({ success: true })
}

export function deleteProject(id) {
  writeProjects(readProjects().filter(p => p.id !== id))
  return Promise.resolve({ success: true })
}
