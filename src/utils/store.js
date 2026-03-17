// ─── All project data in localStorage ────────────────────────────
// PDFs are NOT stored in localStorage — too large.
// PDFs are kept in memory (sessionStorage) during the session only.
// On reload, admin re-uploads the PDF. Text content persists fine.

const K = {
  API_KEY:  'cd_api_key',
  ADMIN_PW: 'cd_admin_pw',
  AUTHED:   'cd_authed',
  PROJECTS: 'cd_projects',
  PDF_PREFIX: 'cd_pdf_',  // sessionStorage key per project
}

export const getApiKey    = ()   => localStorage.getItem(K.API_KEY) || ''
export const setApiKey    = (v)  => localStorage.setItem(K.API_KEY, v.trim())
export const setAdminPw   = (pw) => localStorage.setItem(K.ADMIN_PW, btoa(pw))
export const checkAdminPw = (pw) => btoa(pw) === (localStorage.getItem(K.ADMIN_PW) || '')
export const hasAdminPw   = ()   => !!localStorage.getItem(K.ADMIN_PW)
export const setAuthed    = ()   => sessionStorage.setItem(K.AUTHED, '1')
export const clearAuthed  = ()   => sessionStorage.removeItem(K.AUTHED)
export const isAuthed     = ()   => sessionStorage.getItem(K.AUTHED) === '1'

// ─── PDF session storage (memory only, cleared on tab close) ─────
export function savePdfForProject(projectId, pdfData) {
  // pdfData = { name, base64, size }
  try {
    sessionStorage.setItem(K.PDF_PREFIX + projectId, JSON.stringify(pdfData))
  } catch (e) {
    // sessionStorage also has limits — if too large, just skip
    console.warn('PDF too large for session storage, will not persist:', e)
  }
}

export function getPdfForProject(projectId) {
  try {
    const raw = sessionStorage.getItem(K.PDF_PREFIX + projectId)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function clearPdfForProject(projectId) {
  sessionStorage.removeItem(K.PDF_PREFIX + projectId)
}

// ─── Projects (localStorage — text only, no binary) ──────────────
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
  const id = Date.now().toString()
  const project = {
    id,
    name:        data.name        || '',
    description: data.description || '',
    ctbContent:  data.ctbContent  || '',  // plain text (from PDF extraction or manual paste)
    hasPdf:      data.hasPdf      || false, // flag — actual PDF in sessionStorage
    pdfName:     data.pdfName     || '',
    createdAt:   new Date().toISOString(),
  }
  writeProjects([...projects, project])
  return Promise.resolve({ success: true, id })
}

export function updateProject(id, data) {
  const projects = readProjects().map(p => p.id === id ? {
    ...p,
    name:       data.name        !== undefined ? data.name        : p.name,
    description:data.description !== undefined ? data.description : p.description,
    ctbContent: data.ctbContent  !== undefined ? data.ctbContent  : p.ctbContent,
    hasPdf:     data.hasPdf      !== undefined ? data.hasPdf      : p.hasPdf,
    pdfName:    data.pdfName     !== undefined ? data.pdfName     : p.pdfName,
  } : p)
  writeProjects(projects)
  return Promise.resolve({ success: true })
}

export function deleteProject(id) {
  writeProjects(readProjects().filter(p => p.id !== id))
  clearPdfForProject(id)
  return Promise.resolve({ success: true })
}

// ─── File reading helpers ─────────────────────────────────────────
export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

// ─── Extract text from PDF using pdf.js (CDN) ────────────────────
export async function extractPdfText(file) {
  return new Promise((resolve, reject) => {
    // Load pdf.js from CDN if not already loaded
    if (!window.pdfjsLib) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        doExtract(file, resolve, reject)
      }
      script.onerror = () => reject(new Error('Could not load PDF reader'))
      document.head.appendChild(script)
    } else {
      doExtract(file, resolve, reject)
    }
  })
}

async function doExtract(file, resolve, reject) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page    = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items.map(item => item.str).join(' ')
      fullText += pageText + '\n'
    }
    resolve(fullText.trim())
  } catch (e) {
    reject(e)
  }
}
