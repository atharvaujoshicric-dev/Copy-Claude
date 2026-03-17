// ─── All data in localStorage ─────────────────────────────────────

const K = {
  API_KEY:  'cd_api_key',
  ADMIN_PW: 'cd_admin_pw',
  AUTHED:   'cd_authed',
  PROJECTS: 'cd_projects',
}

export const getApiKey    = ()   => localStorage.getItem(K.API_KEY) || ''
export const setApiKey    = (v)  => localStorage.setItem(K.API_KEY, v.trim())
export const setAdminPw   = (pw) => localStorage.setItem(K.ADMIN_PW, btoa(pw))
export const checkAdminPw = (pw) => btoa(pw) === (localStorage.getItem(K.ADMIN_PW) || '')
export const hasAdminPw   = ()   => !!localStorage.getItem(K.ADMIN_PW)
export const setAuthed    = ()   => sessionStorage.setItem(K.AUTHED, '1')
export const clearAuthed  = ()   => sessionStorage.removeItem(K.AUTHED)
export const isAuthed     = ()   => sessionStorage.getItem(K.AUTHED) === '1'

function readProjects() {
  try { return JSON.parse(localStorage.getItem(K.PROJECTS) || '[]') }
  catch { return [] }
}
function writeProjects(arr) {
  localStorage.setItem(K.PROJECTS, JSON.stringify(arr))
}

export const fetchProjects = () => Promise.resolve(readProjects())

export function createProject(data) {
  const projects = readProjects()
  const project = {
    id:          Date.now().toString(),
    name:        data.name        || '',
    description: data.description || '',
    ctbContent:  data.ctbContent  || '',   // plain text (optional)
    ctbFile:     data.ctbFile     || null, // { name, base64 } for PDF
    createdAt:   new Date().toISOString(),
  }
  writeProjects([...projects, project])
  return Promise.resolve({ success: true, id: project.id })
}

export function updateProject(id, data) {
  const projects = readProjects().map(p => p.id === id ? { ...p, ...data } : p)
  writeProjects(projects)
  return Promise.resolve({ success: true })
}

export function deleteProject(id) {
  writeProjects(readProjects().filter(p => p.id !== id))
  return Promise.resolve({ success: true })
}

// ─── Read a file as base64 ────────────────────────────────────────
export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // result is "data:application/pdf;base64,XXXX" — strip the prefix
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ─── Read a text file ─────────────────────────────────────────────
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsText(file)
  })
}
