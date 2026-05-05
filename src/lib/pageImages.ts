import measurementTracker from "@/assets/page-images/measurement-tracker.png";
import weightTracker from "@/assets/page-images/weight-tracker.png";
import cleaningChecklist from "@/assets/page-images/cleaning-checklist.png";
import completeTracker from "@/assets/page-images/complete-tracker.png";
import dailyTracker from "@/assets/page-images/daily-tracker.png";
import goalsReflection from "@/assets/page-images/goals-reflection.png";
import medicalRecords from "@/assets/page-images/medical-records.png";
import medications from "@/assets/page-images/medications.png";
import myGoals from "@/assets/page-images/my-goals.png";
import notes from "@/assets/page-images/notes.png";
import recipe from "@/assets/page-images/recipe.png";
import selfCareChecklist from "@/assets/page-images/self-care-checklist.png";
import weeklyCalendar from "@/assets/page-images/weekly-calendar.png";
import bloodPressureTracker from "@/assets/page-images/blood-pressure-tracker.png";
import bloodSugarTracker from "@/assets/page-images/blood-sugar-tracker.png";
import yearlyCalendar from "@/assets/page-images/yearly-calendar.png";
import yearlyHabitTracker from "@/assets/page-images/yearly-habit-tracker.png";
import oxygenTracker from "@/assets/page-images/oxygen-tracker.png";
import wellnessTracker from "@/assets/page-images/wellness-tracker.png";
import workoutTracker from "@/assets/page-images/workout-tracker.png";
import monthlyCalendar from "@/assets/page-images/monthly-calendar.png";
import yearlyFocus from "@/assets/page-images/yearly-focus.png";

export const PAGE_IMAGES: Record<string, string> = {
  "measurement-tracker": measurementTracker,
  "weight-tracker": weightTracker,
  "cleaning-checklist": cleaningChecklist,
  "complete-tracker": completeTracker,
  "daily-tracker": dailyTracker,
  "goals-reflection": goalsReflection,
  "medical-records": medicalRecords,
  "medications": medications,
  "my-goals": myGoals,
  "notes": notes,
  "recipe": recipe,
  "self-care-checklist": selfCareChecklist,
  "weekly-calendar": weeklyCalendar,
  "blood-pressure-tracker": bloodPressureTracker,
  "blood-sugar-tracker": bloodSugarTracker,
  "yearly-calendar": yearlyCalendar,
  "yearly-habit-tracker": yearlyHabitTracker,
  "oxygen-tracker": oxygenTracker,
  "wellness-tracker": wellnessTracker,
  "workout-tracker": workoutTracker,
  "monthly-calendar": monthlyCalendar,
  "yearly-focus": yearlyFocus,
};

import { getCoverPageIcon } from "@/lib/coverIcons";

export function getPageImage(id: string, coverId?: string | null): string | undefined {
  return getCoverPageIcon(coverId, id) ?? PAGE_IMAGES[id];
}
