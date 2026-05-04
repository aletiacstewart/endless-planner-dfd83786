import measurementTracker from "@/assets/page-images/measurement-tracker.png";
import weightTracker from "@/assets/page-images/weight-tracker.png";
import cleaningChecklist from "@/assets/page-images/cleaning-checklist.png";
import completeTracker from "@/assets/page-images/complete-tracker.png";
import dailyTracker from "@/assets/page-images/daily-tracker.png";
import funTracker from "@/assets/page-images/fun-tracker.png";
import goalsReflection from "@/assets/page-images/goals-reflection.png";
import habitTracker from "@/assets/page-images/habit-tracker.png";
import medicalRecords from "@/assets/page-images/medical-records.png";
import medications from "@/assets/page-images/medications.png";

export const PAGE_IMAGES: Record<string, string> = {
  "measurement-tracker": measurementTracker,
  "weight-tracker": weightTracker,
  "cleaning-checklist": cleaningChecklist,
  "complete-tracker": completeTracker,
  "daily-tracker": dailyTracker,
  "fun-tracker": funTracker,
  "goals-reflection": goalsReflection,
  "habit-tracker": habitTracker,
  "medical-records": medicalRecords,
  "medications": medications,
};

export function getPageImage(id: string): string | undefined {
  return PAGE_IMAGES[id];
}
