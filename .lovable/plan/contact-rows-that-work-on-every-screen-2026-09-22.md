# Contact rows that work on every screen

## What will change

- Add one **View details** icon button at the end of every Address Book contact row on desktop, tablet, and mobile.
- Open a clearly labeled popup for that row showing every contact field: Name, Phone, Email, Address, and Notes.
- Make the popup fields editable, with **Save changes** and **Cancel**, so information hidden by a narrow screen remains fully usable.
- Keep the popup within the phone/tablet viewport, allow its contents to scroll when needed, and use a clear close button.

## Responsive layout

- **Desktop:** keep the full contact table and append a compact actions column containing the details button.
- **Tablet:** replace the clipped wide row with a compact row summary (row number, name, phone, and details button); use the popup for all fields.
- **Mobile:** use the same compact row summary and popup rather than forcing a wide table to scroll sideways.
- Preserve the existing Add contact button and all saved contact data.

## Technical details

- Add an opt-in row-details setting to the shared measurement-grid field definition, then enable it for the Address Book contacts field only.
- Extend the shared measurement-grid renderer with a selected-row details dialog and breakpoint-aware full/compact table layouts.
- Reuse the existing input and dialog controls; saving writes back to the same row keys already used by the journal.
- Verify populated and empty rows at phone, tablet, and desktop sizes, including opening, editing, saving, canceling, closing, and adding a row.
