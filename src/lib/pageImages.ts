import { getCoverPageIcon } from "@/lib/coverIcons";

import myGoals from "@/assets/page-icons/patriotic-roses/my-goals.jpg";
import yearlyCalendar from "@/assets/page-icons/patriotic-roses/yearly-calendar.jpg";
import monthlyCalendar from "@/assets/page-icons/patriotic-roses/monthly-calendar.jpg";
import weeklyCalendar from "@/assets/page-icons/patriotic-roses/weekly-calendar.jpg";
import dailyTracker from "@/assets/page-icons/patriotic-roses/daily-tracker.jpg";
import completeTracker from "@/assets/page-icons/patriotic-roses/complete-tracker.jpg";
import yearlyHabitTracker from "@/assets/page-icons/patriotic-roses/yearly-habit-tracker.jpg";
import weightTracker from "@/assets/page-icons/patriotic-roses/weight-tracker.jpg";
import measurementTracker from "@/assets/page-icons/patriotic-roses/measurement-tracker.jpg";
import bloodSugarTracker from "@/assets/page-icons/patriotic-roses/blood-sugar-tracker.jpg";
import bloodPressureTracker from "@/assets/page-icons/patriotic-roses/blood-pressure-tracker.jpg";
import oxygenTracker from "@/assets/page-icons/patriotic-roses/oxygen-tracker.jpg";
import selfCareChecklist from "@/assets/page-icons/patriotic-roses/self-care-checklist.jpg";
import cleaningChecklist from "@/assets/page-icons/patriotic-roses/cleaning-checklist.jpg";
import recipe from "@/assets/page-icons/patriotic-roses/recipe.jpg";
import notes from "@/assets/page-icons/patriotic-roses/notes.jpg";
import workoutTracker from "@/assets/page-icons/patriotic-roses/workout-tracker.jpg";
import medications from "@/assets/page-icons/patriotic-roses/medications.jpg";
import medicalRecords from "@/assets/page-icons/patriotic-roses/medical-records.jpg";
import yearlyFocus from "@/assets/page-icons/patriotic-roses/yearly-focus.jpg";

export const PAGE_IMAGES: Record<string, string> = {
  "my-goals": myGoals,
  "yearly-calendar": yearlyCalendar,
  "monthly-calendar": monthlyCalendar,
  "weekly-calendar": weeklyCalendar,
  "daily-tracker": dailyTracker,
  "complete-tracker": completeTracker,
  "yearly-habit-tracker": yearlyHabitTracker,
  "weight-tracker": weightTracker,
  "measurement-tracker": measurementTracker,
  "blood-sugar-tracker": bloodSugarTracker,
  "blood-pressure-tracker": bloodPressureTracker,
  "oxygen-tracker": oxygenTracker,
  "self-care-checklist": selfCareChecklist,
  "cleaning-checklist": cleaningChecklist,
  recipe,
  notes,
  "workout-tracker": workoutTracker,
  medications,
  "medical-records": medicalRecords,
  "yearly-focus": yearlyFocus,
};

export function getPageImage(id: string, coverId?: string | null): string | undefined {
  return getCoverPageIcon(coverId, id) ?? PAGE_IMAGES[id];
}
