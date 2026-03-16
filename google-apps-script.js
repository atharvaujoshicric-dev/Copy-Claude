/**
 * CopyDesk — Google Apps Script
 * ================================
 * Paste this into: Google Sheet → Extensions → Apps Script
 * Then deploy as Web App (Execute as: Me, Access: Anyone)
 *
 * After ANY code change: Deploy → Manage Deployments → Edit → New Version → Deploy
 */

const SHEET_NAME = 'Projects'
const COL = { ID: 0, NAME: 1, DESC: 2, CTB: 3, CREATED: 4 }

function getOrCreateSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet()
  let   sheet = ss.getSheetByName(SHEET_NAME)
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

function decodeCtb(encoded) {
  if (!encoded) return ''
  try {
    const bytes = Utilities.base64Decode(encoded)
    return Utilities.newBlob(bytes).getDataAsString('UTF-8')
  } catch (e) {
    return encoded
  }
}

function jsonOut(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}

// All actions via GET — avoids CORS issues entirely
function doGet(e) {
  const p      = e.parameter || {}
  const action = p.action    || 'list'
  try {
    if (action === 'list')   return jsonOut(listProjects())
    if (action === 'create') return jsonOut(createProject(p))
    if (action === 'update') return jsonOut(updateProject(p))
    if (action === 'delete') return jsonOut(deleteProject(p.id))
    return jsonOut({ error: 'Unknown action: ' + action })
  } catch (err) {
    return jsonOut({ error: err.message })
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
  sheet.appendRow([id, p.name || '', p.description || '', decodeCtb(p.ctbContent), new Date().toISOString()])
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
