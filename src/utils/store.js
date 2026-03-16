// ─── localStorage keys ───────────────────────────────────────────
const K = {
  API_KEY:  'cd_api_key',
  SHEET:    'cd_sheet_url',
  ADMIN_PW: 'cd_admin_pw',
  AUTHED:   'cd_authed',
}

// ─── Gemini API Key ──────────────────────────────────────────────
// Set by admin via Settings UI. Stored in browser localStorage only.
export const getApiKey  = ()  => localStorage.getItem(K.API_KEY) || ''
export const setApiKey  = (v) => localStorage.setItem(K.API_KEY, v)

// ─── Google Apps Script URL ──────────────────────────────────────
// Set by admin via Settings UI. Stored in browser localStorage only.
export const getSheetUrl  = ()  => localStorage.getItem(K.SHEET) || ''
export const setSheetUrl  = (v) => localStorage.setItem(K.SHEET, v)

// ─── Admin password ──────────────────────────────────────────────
export const getAdminPw   = ()   => localStorage.getItem(K.ADMIN_PW) || ''
export const setAdminPw   = (pw) => localStorage.setItem(K.ADMIN_PW, btoa(pw))
export const checkAdminPw = (pw) => btoa(pw) === getAdminPw()
export const hasAdminPw   = ()   => !!localStorage.getItem(K.ADMIN_PW)

// ─── Session auth ────────────────────────────────────────────────
export const setAuthed    = ()  => sessionStorage.setItem(K.AUTHED, '1')
export const clearAuthed  = ()  => sessionStorage.removeItem(K.AUTHED)
export const isAuthed     = ()  => sessionStorage.getItem(K.AUTHED) === '1'

// ─── Google Sheets CRUD (all via GET to avoid CORS) ──────────────
async function sheetGet(params) {
  const url = getSheetUrl()
  if (!url) throw new Error('Google Sheet URL not configured. Go to Admin → Settings.')
  const res = await fetch(`${url}?${new URLSearchParams(params)}`)
  if (!res.ok) throw new Error(`Sheet error ${res.status}`)
  const text = await res.text()
  try { return JSON.parse(text) }
  catch { throw new Error('Bad response from Apps Script. Re-deploy the script.') }
}

export const fetchProjects  = ()        => sheetGet({ action: 'list' })
export const deleteProject  = (id)      => sheetGet({ action: 'delete', id })
export const createProject  = (data)    => sheetGet({
  action: 'create',
  name:        data.name        || '',
  description: data.description || '',
  ctbContent:  btoa(unescape(encodeURIComponent(data.ctbContent || ''))),
})
export const updateProject  = (id, data) => sheetGet({
  action: 'update', id,
  name:        data.name        || '',
  description: data.description || '',
  ctbContent:  btoa(unescape(encodeURIComponent(data.ctbContent || ''))),
})
