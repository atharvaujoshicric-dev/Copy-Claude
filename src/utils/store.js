// ─── localStorage keys ───────────────────────────────────────────
const K = {
  API_KEY:  'cd_api_key',
  SHEET:    'cd_sheet_url',
  ADMIN_PW: 'cd_admin_pw',
  AUTHED:   'cd_authed',
}

export const getApiKey    = ()  => localStorage.getItem(K.API_KEY) || ''
export const setApiKey    = (v) => localStorage.setItem(K.API_KEY, v)
export const getSheetUrl  = ()  => localStorage.getItem(K.SHEET) || ''
export const setSheetUrl  = (v) => localStorage.setItem(K.SHEET, v)
export const getAdminPw   = ()  => localStorage.getItem(K.ADMIN_PW) || ''
export const setAdminPw   = (pw) => localStorage.setItem(K.ADMIN_PW, btoa(pw))
export const checkAdminPw = (pw) => btoa(pw) === getAdminPw()
export const hasAdminPw   = ()  => !!localStorage.getItem(K.ADMIN_PW)
export const setAuthed    = ()  => sessionStorage.setItem(K.AUTHED, '1')
export const clearAuthed  = ()  => sessionStorage.removeItem(K.AUTHED)
export const isAuthed     = ()  => sessionStorage.getItem(K.AUTHED) === '1'

// ─── JSONP helper — bypasses CORS entirely ───────────────────────
// Google Apps Script redirects break fetch(), but JSONP via <script> tag works
function jsonp(params) {
  return new Promise((resolve, reject) => {
    const url = getSheetUrl()
    if (!url) return reject(new Error('Google Sheet URL not configured. Go to Admin → Settings.'))

    const cbName = 'cd_cb_' + Date.now()
    const timeout = setTimeout(() => {
      delete window[cbName]
      script.remove()
      reject(new Error('Request timed out. Check your Apps Script URL.'))
    }, 15000)

    window[cbName] = (data) => {
      clearTimeout(timeout)
      delete window[cbName]
      script.remove()
      if (data.error) reject(new Error(data.error))
      else resolve(data)
    }

    const qs = new URLSearchParams({ ...params, callback: cbName }).toString()
    const script = document.createElement('script')
    script.src = `${url}?${qs}`
    script.onerror = () => {
      clearTimeout(timeout)
      delete window[cbName]
      reject(new Error('Failed to reach Apps Script. Check the URL in Settings.'))
    }
    document.head.appendChild(script)
  })
}

export const fetchProjects = ()         => jsonp({ action: 'list' })
export const deleteProject = (id)       => jsonp({ action: 'delete', id })
export const createProject = (data)     => jsonp({
  action:      'create',
  name:        data.name        || '',
  description: data.description || '',
  ctbContent:  btoa(unescape(encodeURIComponent(data.ctbContent || ''))),
})
export const updateProject = (id, data) => jsonp({
  action:      'update', id,
  name:        data.name        || '',
  description: data.description || '',
  ctbContent:  btoa(unescape(encodeURIComponent(data.ctbContent || ''))),
})
