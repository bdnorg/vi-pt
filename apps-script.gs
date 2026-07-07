// VI PT cloud sync backend.
// Paste this into your Google Sheet: Extensions → Apps Script.
// Then: Deploy → New deployment → Web app → Execute as "Me",
// Who has access: "Anyone" → copy the /exec URL into the app's ☁ settings.

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName("Data") || ss.insertSheet("Data");
  const val = sh.getRange(1, 1).getValue();
  return ContentService.createTextOutput(val || "{}")
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const body = JSON.parse(e.postData.contents);

  const sh = ss.getSheetByName("Data") || ss.insertSheet("Data");
  sh.getRange(1, 1).setValue(JSON.stringify(body.data));

  const rows = body.newHistory || [];
  if (rows.length) {
    const h = ss.getSheetByName("History") || ss.insertSheet("History");
    if (h.getLastRow() === 0) {
      h.appendRow(["Date", "Routine", "Exercise", "Left", "Right", "Reps", "Sets"]);
    }
    rows.forEach(function (r) {
      h.appendRow([r.date, r.routine, r.exercise,
                   r.l != null ? r.l : "", r.r != null ? r.r : "",
                   r.n != null ? r.n : "", r.sets != null ? r.sets : ""]);
    });
  }
  return ContentService.createTextOutput("ok");
}
