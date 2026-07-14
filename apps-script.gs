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
const HISTORY_HEADER = ["Date", "Routine", "Exercise", "Type", "Left", "Right", "Reps", "Sets"];

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const out = { exercises: [], history: [] };
  const ex = ss.getSheetByName(EXERCISES);
  if (ex && ex.getLastRow() > 0) out.exercises = ex.getDataRange().getValues();
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

  const exRows = body.exercises || [];
  if (exRows.length) {
    const sh = ss.getSheetByName(EXERCISES) || ss.insertSheet(EXERCISES, 0);
    sh.clearContents();
    sh.getRange(1, 1, exRows.length, exRows[0].length).setValues(exRows);
    sh.setFrozenRows(1);
  }

  const histRows = body.newHistory || [];
  if (histRows.length) {
    let sh = ss.getSheetByName(HISTORY);
    if (!sh) {
      sh = ss.insertSheet(HISTORY);
      sh.appendRow(HISTORY_HEADER);
      sh.setFrozenRows(1);
    }
    const padded = histRows.map(r =>
      HISTORY_HEADER.map((_, i) => (r[i] == null ? "" : r[i])));
    sh.getRange(sh.getLastRow() + 1, 1, padded.length, HISTORY_HEADER.length)
      .setValues(padded);
  }
  return json({ ok: true });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
