# Mobile and tablet planner layout audit

## Goal
Make every journal page readable and usable on phones and tablets, with no overlapping labels, fields, toolbars, or styling controls.

## Changes

1. **Make shared page layouts responsive**
   - Stack grouped fields into one column on phones, two columns on tablets, and use wider multi-column arrangements only when space allows.
   - Reduce planner page and card spacing on narrow screens so fields keep usable width.
   - Keep every field inside its page instead of letting content spill beneath or beyond neighboring fields.

2. **Fix row-based pages across the journal**
   - Replace cramped multi-column rows with labeled, stacked mobile rows where needed, including Contacts and Medications.
   - Keep compact tables usable on tablets with correctly sized columns and horizontal scrolling only for genuinely wide calendars and trackers.
   - Preserve row numbering, add-row controls, saved values, and desktop table layouts.

3. **Make page styling controls fully visible**
   - Wrap Title, Subtitle, Body, Background, Cards, Accent, Spacing, Sticker, Library, and related controls on both phone and tablet widths.
   - Keep **Reset page style** and **Apply to this page** visible beneath the controls without horizontal scrolling or clipping.
   - Ensure opened font, colour, background, card, and spacing panels remain within the page width.

4. **Improve the floating editing toolbox**
   - Keep the rich-text toolbox within the visible field or screen instead of letting it clip at an edge.
   - Add a short note explaining that the toolbox can be dragged to move it and closed when finished.
   - Add an explicit close control and make movement work with touch as well as mouse input.
   - Prevent sticker controls from extending beyond the page edge on smaller screens.

5. **Check every planner page type**
   - Review representative pages for simple forms, grouped forms, Contacts, Medications, calendars, habit and water grids, drawing areas, and the Complete Tracker.
   - Test at phone (393px), tablet (834px), and desktop widths.
   - Confirm that fields do not overlap, all styling actions remain reachable, and bottom/side navigation does not cover editable content.

## Technical notes
- The audit found non-responsive two- and three-column field groups in the shared page renderer, a fixed six-column medication layout, minimum-width measurement columns, and absolutely positioned rich-text controls.
- Fixes will be made primarily in the shared renderers so all affected planner pages benefit without changing saved journal data.
- Existing desktop layouts and planner syncing behavior will remain unchanged.
