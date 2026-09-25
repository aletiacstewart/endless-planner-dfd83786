# Make seven Complete Tracker sections "today only" and let you add your own rows

Each of these sections on a Complete Tracker day will only ask about **that day**. Anything that covers a whole week, month or year stays on its own page. Each section also gets a "+ Add" button so you can add more rows just for that day.

## Section by section

- **Dates & Gifts**: becomes a list of "today's dates & gifts". Each row has the event, occasion, who it's for, gift, cost and a Purchased tick. Starts with 1 row. "+ Add date or gift" adds another. Each row still syncs to Important Dates and the Gift Tracker for that date.
- **This Year**: now shows only "Today's note for the year" (it saves to this day on the Yearly Calendar). Word of the Year stays on the Yearly page. "+ Add note" adds more lines.
- **This Week**: now shows only "Today's note for the week" (it saves to today's weekday on the Weekly Calendar). Weekly goals and reflection stay on the Weekly page. "+ Add note" adds more lines.
- **Begin / Break Habits**: keeps the quick daily check. Starts with 3 habit rows, each with a Begin/Break choice and a Done or Missed mark for today. "+ Add habit" adds more. Each mark still syncs to today's box on the Yearly Habit Tracker.
- **Measurements**: the "Start" column comes out. You only enter **today's** values, plus notes. Your start values stay on the Measurement and Weight pages. "+ Add measurement" lets you add your own (for example, forearm).
- **Medicines**: shows only the medications you took **today**, with M / A / N ticks. Starts with 3 rows instead of 20. "+ Add medication" adds more.
- **Medical Records**: now covers today's visit only: which doctor, appointment notes, test results and lab notes. "+ Add visit" lets you log a second doctor on the same day, and each visit has its own notes.

## Your existing entries

- Anything already written on old days stays. The old values go into the first row of the new layout, so nothing is lost.
- Syncing with the individual pages keeps working both ways, matched by the day's date.

## Technical notes

- `src/lib/pageTypes.ts` (complete-tracker): turn dates_gifts, habits, med visits and extra measurements/notes into growable row lists (`measurement-grid`/`med-list` with `growable` + `addLabel`, small rowCount). Remove `weekly_goals`, `weekly_reflection`, `yearly_focus` and the `_start` pair keys from this page.
- `src/components/FieldRenderer.tsx`: reuse the existing growable add-row, and add a row-list for dated visits with a doctor picker on each row.
- `src/lib/linkedEntries.ts`: map row lists to and from Important Dates, the Gift Tracker, the Yearly Habit Tracker, Medications, Medical Records and the Measurement/Weight pages. Read old single-field keys as row 1 so existing days still work.
