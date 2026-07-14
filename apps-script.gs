// VI PT cloud sync backend.
// Paste this into your Google Sheet: Extensions → Apps Script.
// Then: Deploy → New deployment → Web app → Execute as "Me",
// Who has access: "Anyone" → copy the /exec URL into the app's ☁ settings.
// (If updating an existing deployment: Deploy → Manage deployments →
// ✏️ edit → Version: New version → Deploy. The URL stays the same.)
//
// The app maintains two tabs in this spreadsheet:
//   Exercises — one row per exercise. You can edit rows or add new ones
//               here, then use "⬇ Load from cloud" in the app.
//   History   — one appended row per exercise per finished session.

const EXERCISES = "Exercises";
const HISTORY = "History";
const HISTORY_HEADER = ["Date", "Routine", "Exercise", "Type", "Left", "Right", "Reps", "Sets", "Notes"];

// Content hash of the Exercises tab, used as an optimistic-concurrency
// token: the app sends back the hash it last saw, and a mismatch means the
// sheet was edited elsewhere, so the overwrite is refused.
function hashRows(rows) {
  const s = JSON.stringify(rows);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return String(h);
}

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const out = { exercises: [], history: [] };
  const ex = ss.getSheetByName(EXERCISES);
  if (ex && ex.getLastRow() > 0) out.exercises = ex.getDataRange().getValues();
  out.exHash = hashRows(out.exercises);
  const hs = ss.getSheetByName(HISTORY);
  if (hs && hs.getLastRow() > 1) {
    const v = hs.getDataRange().getValues();
    out.historyHeader = v[0];
    out.history = v.slice(1).slice(-40); // recent tail; the full log stays here
  }
  return json(out);
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // History first: append-only, so it is safe even when the exercise
  // overwrite below is refused as a conflict.
  const histRows = body.newHistory || [];
  if (histRows.length) {
    let sh = ss.getSheetByName(HISTORY);
    if (!sh) sh = ss.insertSheet(HISTORY);
    // Self-healing header: rewrite row 1 so new columns (e.g. Notes)
    // appear on History tabs created by older versions.
    sh.getRange(1, 1, 1, HISTORY_HEADER.length).setValues([HISTORY_HEADER]);
    sh.setFrozenRows(1);
    const padded = histRows.map(r =>
      HISTORY_HEADER.map((_, i) => (r[i] == null ? "" : r[i])));
    sh.getRange(Math.max(sh.getLastRow(), 1) + 1, 1, padded.length, HISTORY_HEADER.length)
      .setValues(padded);
  }

  const out = { ok: true };
  const exRows = body.exercises || [];
  if (exRows.length) {
    const sh = ss.getSheetByName(EXERCISES) || ss.insertSheet(EXERCISES, 0);
    if (body.baseHash != null && sh.getLastRow() > 0) {
      const cur = hashRows(sh.getDataRange().getValues());
      if (cur !== body.baseHash) return json({ conflict: true, exHash: cur });
    }
    sh.clearContents();
    sh.getRange(1, 1, exRows.length, exRows[0].length).setValues(exRows);
    sh.setFrozenRows(1);
    out.exHash = hashRows(sh.getDataRange().getValues());
  }
  return json(out);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
