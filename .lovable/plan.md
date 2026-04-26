## Add Medical Records section below Medications

Add a new section to the daily entry page (after the Medications section) that contains three textarea fields for tracking medical info.

### Section Structure

**Title:** "Medical Records"
**Description:** "Track appointment notes, test results, and lab notes."
**Layout:** 3 columns on desktop, stacked on mobile

Fields (all `textarea`, ~5 rows):
1. **Medical Appointment Notes** — `medical_appointment_notes`
2. **Test Results** — `test_results`
3. **Lab Result Notes** — `lab_result_notes`

### Technical Changes

**`src/lib/pageTypes.ts`** — Insert a new section in the daily entry's `sections` array, immediately after the Medications section (line 378) and before the Fun & Habit Tracker:

```ts
{
  title: "Medical Records",
  description: "Track appointment notes, test results, and lab notes.",
  columns: 3,
  fields: [
    { key: "medical_appointment_notes", label: "Medical Appointment Notes", type: "textarea", rows: 5 },
    { key: "test_results", label: "Test Results", type: "textarea", rows: 5 },
    { key: "lab_result_notes", label: "Lab Result Notes", type: "textarea", rows: 5 },
  ],
},
```

No other files need to change — `PageRenderer` and `FieldRenderer` already support `textarea` fields with column layouts, and entries are stored as a generic key/value map so existing data is unaffected.