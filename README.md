# VI PT — Exercise Video Player

A no-build web app for following exercise videos on YouTube: per-exercise
start/end marks with looping, rep and set counters (per side or not), timed
holds, routines, session history, and optional cloud sync to your own Google
Sheet. All app logic lives in `index.html`; `manifest.webmanifest`, `sw.js`,
and the icon PNGs exist only to make it installable as a PWA.

**Live app:** https://bdnorg.github.io/vi-pt/

Works best in Chrome on Android signed into a YouTube Premium account
(embedded videos then play ad-free).

## Using the app

- **✏️ Edit mode** — add/edit/delete exercises and routines, set start/end
  marks from the current playback position, choose reps-per-set or a timed
  hold, number of sets, per-side counting, and the video's aspect ratio.
  Pasting a video link auto-detects its shape (YouTube Shorts and other
  portrait videos select 9:16 automatically); tapping an aspect button
  yourself always overrides the detection.
- **Resizable video** — drag the bar under the video to make it bigger or
  smaller. It stays centered and crops the left/right edges once it's
  wider than the screen. Double-tap the bar to go back to automatic
  sizing.
- **Normal mode** — just work out. The 🎬/🔢 button switches between a
  big-video view and a big-buttons view.
- **✓ Finish & log session** — records what you did to history and resets
  the counters for next time.
- **☁ Cloud sync** — backs everything up to a Google Sheet you own
  (see below).
- The screen stays awake while the app is open (Wake Lock), so timed
  holds and rest between sets won't be interrupted by the phone locking.
  Timers are wall-clock based, so even if the screen does turn off the
  countdown stays accurate.

## Install as an app

The app is a PWA. In Chrome on Android, open
https://bdnorg.github.io/vi-pt/ and choose **⋮ → Add to Home screen →
Install**. It then launches full-screen from its own icon, and the app
shell loads even when offline (the YouTube videos themselves still need
a connection).

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

## How the spreadsheet is laid out

- **Exercises** tab — one row per exercise, one column per setting:
  `Routine, Exercise, Video, Type, Reps, Seconds, Sets, Per side, Start,
  End, Aspect, ID`. `Type` is `reps` or `hold`; `Start`/`End` are seconds
  (or `m:ss`); `Aspect` is `16:9`, `4:3`, `1:1`, or `9:16`.
- **History** tab — one row per exercise per finished session:
  `Date, Routine, Exercise, Type, Left, Right, Reps, Sets, Notes`.
  Append-only; this is the full log (the app only shows the recent tail).
  `Reps` is the total reps done for that exercise across the session's
  sets (`Left`/`Right` for per-side exercises). A session note typed into
  the field above **✓ Finish & log session** lands in `Notes` on the
  session's first row.

**You can edit the sheet directly.** Change any exercise's settings, add
new rows (leave `ID` blank — the app assigns one), reorder or re-group
them under routine names, then tap **⬇ Load from cloud** in the app.
Columns are matched by header name, so reordering columns is fine too.

The app writes the Exercises tab when you change setup in the app (edit
mode, marks) and appends to History when you finish a session. Rep counts
during a workout stay on the device, so working out never overwrites
sheet edits. Sync is still last-write-wins for the Exercises tab: if you
edit the sheet *and* the app's edit mode at the same time, whichever
saves last wins.

On a new device (or after clearing browser data), paste the same URL and
tap **⬇ Load from cloud**.

Note: the URL is unguessable but anyone who has it can read/write your data,
so don't post it publicly.

### Updating from the old sync format

Older versions stored the app state as a JSON blob in a `Data` tab. To
upgrade: open the sheet → Extensions → Apps Script, replace the code with
the current [`apps-script.gs`](apps-script.gs), then **Deploy → Manage
deployments → ✏️ Edit → Version: New version → Deploy** (the URL stays the
same — no change needed in the app). Then tap **⬆ Save to cloud now** in
the app once to populate the Exercises tab. You can delete the old `Data`
tab afterwards.
