/**
 * CopyDesk — Google Apps Script Web App
 * =======================================
 * IMPORTANT: This version uses GET-only requests to avoid CORS errors.
 * All actions (list, create, update, delete) go through doGet().
 *
 * HOW TO SET UP / RE-DEPLOY:
 * 1. Open your Google Sheet → Extensions → Apps Script
 * 2. Delete ALL existing code and paste this entire file
 * 3. Click "Deploy" → "Manage deployments" (if already deployed)
 *    → Click the pencil/edit icon → Version: "New version" → Deploy
 *    OR if first time: "Deploy" → "New deployment" →
 *      Type: Web app | Execute as: Me | Who has access: Anyone
 * 4. Copy the Web App URL and paste in CopyDesk Admin → Settings
 *
 * NOTE: After any code change you MUST create a "New version" in
 * Manage Deployments — otherwise the old code keeps running.
 *
 * SHEET STRUCTURE (auto-created on first run):
 * Sheet: "Projects" | Columns: ID | Name | Description | CTB Content | Created At
 */

const SHEET_NAME = 'Projects'
const COL = { ID: 0, NAME: 1, DESC: 2, CTB: 3, CREATED: 4 }

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(SHEET_NAME)
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME)
    sheet.appendRow(['ID', 'Name', 'Description', 'CTB Content', 'Created At'])
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold')
    sheet.setFrozenRows(1)
  }
  return sheet
}

function rowToObj(row) {
  return {
    id:          String(row[COL.ID]      || ''),
    name:        String(row[COL.NAME]    || ''),
    description: String(row[COL.DESC]    || ''),
    ctbContent:  String(row[COL.CTB]     || ''),
    createdAt:   String(row[COL.CREATED] || ''),
  }
}

// Safely decode base64-encoded UTF-8 string sent from the browser
function decodeCtb(encoded) {
  if (!encoded) return ''
  try {
    const bytes = Utilities.base64Decode(encoded)
    return Utilities.newBlob(bytes).getDataAsString('UTF-8')
  } catch (e) {
    return encoded // fallback: use as-is if decoding fails
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}

// All actions go through doGet — no POST, no CORS preflight
function doGet(e) {
  const p      = e.parameter || {}
  const action = p.action || 'list'

  try {
    if (action === 'list')   return jsonResponse(listProjects())
    if (action === 'create') return jsonResponse(createProject(p))
    if (action === 'update') return jsonResponse(updateProject(p))
    if (action === 'delete') return jsonResponse(deleteProject(p.id))
    return jsonResponse({ error: 'Unknown action: ' + action })
  } catch (err) {
    return jsonResponse({ error: err.message })
  }
}

function listProjects() {
  const sheet = getOrCreateSheet()
  const rows  = sheet.getDataRange().getValues().slice(1)
  return rows.filter(r => r[COL.ID]).map(rowToObj)
}

function createProject(p) {
  const sheet = getOrCreateSheet()
  const id    = Date.now().toString()
  sheet.appendRow([
    id,
    p.name        || '',
    p.description || '',
    decodeCtb(p.ctbContent),
    new Date().toISOString(),
  ])
  return { success: true, id }
}

function updateProject(p) {
  const sheet = getOrCreateSheet()
  const rows  = sheet.getDataRange().getValues()
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][COL.ID]) === String(p.id)) {
      const r = i + 1
      if (p.name        !== undefined) sheet.getRange(r, COL.NAME + 1).setValue(p.name)
      if (p.description !== undefined) sheet.getRange(r, COL.DESC + 1).setValue(p.description)
      if (p.ctbContent  !== undefined) sheet.getRange(r, COL.CTB  + 1).setValue(decodeCtb(p.ctbContent))
      return { success: true }
    }
  }
  return { error: 'Project not found' }
}

function deleteProject(id) {
  const sheet = getOrCreateSheet()
  const rows  = sheet.getDataRange().getValues()
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][COL.ID]) === String(id)) {
      sheet.deleteRow(i + 1)
      return { success: true }
    }
  }
  return { error: 'Project not found' }
}
