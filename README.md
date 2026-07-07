# VI PT — Exercise Video Player

A single-file web app for following exercise videos on YouTube: per-exercise
start/end marks with looping, rep and set counters (per side or not), timed
holds, routines, session history, and optional cloud sync to your own Google
Sheet.

**Live app:** https://bdnorg.github.io/vi-pt/

Works best in Chrome on Android signed into a YouTube Premium account
(embedded videos then play ad-free).

## Using the app

- **✏️ Edit mode** — add/edit/delete exercises and routines, set start/end
  marks from the current playback position, choose reps-per-set or a timed
  hold, number of sets, per-side counting, and the video's aspect ratio.
- **Normal mode** — just work out. The 🎬/🔢 button switches between a
  big-video view and a big-buttons view.
- **✓ Finish & log session** — records what you did to history and resets
  the counters for next time.
- **☁ Cloud sync** — backs everything up to a Google Sheet you own
  (see below).

## Cloud sync setup

One-time, about two minutes:

1. Create a new [Google Sheet](https://sheets.new) (name it anything,
   e.g. "VI PT data").
2. In the sheet: **Extensions → Apps Script**. Delete the placeholder code
   and paste in the contents of [`apps-script.gs`](apps-script.gs). Save.
3. Click **Deploy → New deployment**. Choose type **Web app**. Set
   *Execute as:* **Me**, *Who has access:* **Anyone**. Click **Deploy** and
   authorize it (it only touches this one spreadsheet).
4. Copy the web app URL (ends in `/exec`).
5. In the app, tap **☁**, paste the URL, and tap **Save settings**, then
   **⬆ Save to cloud now**.

From then on the app auto-saves a few seconds after any change, and every
finished session is appended as a row to the sheet's **History** tab. On a
new device (or after clearing browser data), paste the same URL and tap
**⬇ Load from cloud**.

Note: the URL is unguessable but anyone who has it can read/write your data,
so don't post it publicly.
