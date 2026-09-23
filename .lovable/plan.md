# Daily Journal and Missing Page Icons

## Goal
Add a dated Daily Journal that opens as a real two-page spread: writing on the left, with both a photo and a sketch on the right. Keep it connected to the same date in the Complete Tracker, and complete the themed page artwork for Contacts, Emergency Contacts, Important Dates, Gift Tracker, and Daily Journal.

## Daily Journal spread
- Add **Daily Journal** as a daily planner section with its own section card, side tab, entry list, themed page artwork, and “New journal” action.
- Pin the left page to the journal content: date, optional title, and a roomy lined/free-form writing area.
- Pin the right page to two stacked creative areas: an uploaded photo with replace/remove controls, and the existing finger/stylus drawing canvas with pen, eraser, color, thickness, undo, redo, and clear.
- Keep desktop as a left/right book spread. Stack writing, photo, then sketch cleanly on phone and tablet with touch-sized controls and no horizontal scrolling.

## Photo upload and privacy
- Create a private journal-photo storage area with a practical image-size limit.
- Add signed-in-user-only storage rules so each person can upload, view, replace, and remove only their own journal photos.
- Add an image field to the planner renderer with upload progress, preview, replace, remove, file-type/size validation, and clear error states.
- Store only the private photo path with the journal entry so cloud backup and cross-device sync remain lightweight; resolve the view URL securely when displayed.
- Remove a replaced or deleted journal photo so abandoned files are not left behind.

## Complete Tracker connection
- Add a **Daily Journal** section to the Complete Tracker for the selected day, carrying the journal title, writing, photo, and sketch.
- Sync those values both ways by date: changes in Daily Journal update that day’s Complete Tracker, and changes from Complete Tracker update the matching Journal entry.
- Include Daily Journal when a new Complete Tracker day scaffolds its linked pages, while preserving the existing delayed/background sync performance work.

## Themed page icons
- Backfill missing cover-pack artwork for **Contacts**, **Emergency Contacts**, **Important Dates**, and **Gift Tracker** wherever those files are absent.
- Create a matching **Daily Journal** page icon for every cover pack, then regenerate the icon manifest.
- Ensure all five page artworks appear consistently in section cards, side tabs, page headers, the Page Icons sticker tab, and the Library for entitled cover packs; retain branded fallback icons if any image cannot load.

## Validation
- Test creating a dated journal, writing, uploading/replacing/removing a photo, drawing and clearing a sketch, reloading, and opening it on another signed-in session.
- Verify two-way Complete Tracker sync without duplicate Journal entries for the same date.
- Check the spread and all controls at phone, tablet, and desktop sizes, including touch interaction and no overlap or bottom scrollbar.
- Run type checks and the existing automated tests.

## Technical details
- Extend the page schema with a reusable image field rather than building a one-off page.
- Use private cloud storage paths scoped by user ID and authenticated storage policies; no new data table is required because planner entry values already sync as JSON.
- Reuse the current `page: 1` / `page: 2` spread layout, drawing canvas, entry autosave, themed icon resolver, and linked-entry cache.
