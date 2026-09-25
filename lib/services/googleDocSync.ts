import {
  GoogleDocMedicineCourse,
  GoogleDocMedicineGroup,
  GoogleDocMedicineGuidelines,
  MedicineSchedule,
  MedicineScheduleStatus,
} from "@/types/health";
import { DEFAULT_MEDICINE_GUIDE_DOC_URL } from "@/types/googleSheets";
import { connectDB } from "@/lib/mongodb";
import MedicineScheduleModel from "@/models/MedicineSchedule";
import AppConfigModel from "@/models/AppConfig";
import { fallbackStore } from "@/lib/fallbackStore";
import fs from "fs";
import path from "path";

/**
 * Extracts Google Docs ID from URL or returns bare ID.
 */
export function extractGoogleDocId(inputUrl: string): string | null {
  if (!inputUrl || typeof inputUrl !== "string") return null;
  const trimmed = inputUrl.trim();

  // If it's already an ID
  if (/^[a-zA-Z0-9-_]{25,}$/.test(trimmed) && !trimmed.includes("/")) {
    return trimmed;
  }

  const match = trimmed.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Converts Bengali digits to standard English digits.
 */
export function bengaliToEnglishDigits(str: string): string {
  if (!str) return "";
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return str.replace(/[০-৯]/g, (d) => String(bnDigits.indexOf(d)));
}

/**
 * Parses date range text like "০১ থেকে ০৫ তারিখ" or "১৪ তারিখ" or "২৩ থেকে ২৮ তারিখ".
 */
export function parseDateRange(dateText: string): { startDay: number; endDay: number } {
  const clean = bengaliToEnglishDigits(dateText);
  const rangeMatch = clean.match(/(\d+)\s*(?:থেকে|-|to)\s*(\d+)/);
  if (rangeMatch) {
    const s = parseInt(rangeMatch[1], 10);
    const e = parseInt(rangeMatch[2], 10);
    return {
      startDay: isNaN(s) ? 1 : Math.max(1, Math.min(31, s)),
      endDay: isNaN(e) ? 5 : Math.max(1, Math.min(31, e)),
    };
  }

  const singleMatch = clean.match(/(\d+)/);
  if (singleMatch) {
    const d = parseInt(singleMatch[1], 10);
    const day = isNaN(d) ? 1 : Math.max(1, Math.min(31, d));
    return { startDay: day, endDay: day };
  }

  return { startDay: 1, endDay: 5 };
}

/**
 * Fetches the live, real-time raw plain text of the Google Doc via Google export endpoint.
 */
export async function fetchGoogleDocRawText(
  customDocUrl?: string
): Promise<{ text: string; docUrl: string; docId: string }> {
  const docUrl = customDocUrl || DEFAULT_MEDICINE_GUIDE_DOC_URL;
  const docId = extractGoogleDocId(docUrl);

  if (!docId) {
    throw new Error("Invalid Google Doc URL provided.");
  }

  const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
  const res = await fetch(exportUrl, {
    cache: "no-store",
    headers: {
      "User-Agent": "HimelAgroERP/1.0",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Google Doc content (Status: ${res.status} ${res.statusText})`);
  }

  const text = await res.text();
  return { text, docUrl, docId };
}

/**
 * Parses raw text from Google Doc into structured guidelines data model.
 */
export function parseGoogleDocMedicineGuidelines(
  rawText: string,
  docUrl: string = DEFAULT_MEDICINE_GUIDE_DOC_URL
): GoogleDocMedicineGuidelines {
  // Normalize potential run-on words in Google Docs export
  let normalizedText = rawText
    .replace(/মাসের কোর্সবিরতি/g, "মাসের কোর্স\nবিরতি")
    .replace(/গাইডলাইনবিরতি/g, "গাইডলাইন\nবিরতি");

  const lines = normalizedText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const title = lines[0] || "কবুতরের মাসিক ঔষধের কোর্স ও ব্যবহার বিধি";
  let specialNotice =
    "বিশেষ দ্রষ্টব্য: এক দিনের মেডিসিন মিশ্রিত পানি অন্য দিন ব্যবহার করা যাবে না। প্রতিদিন পানি ফেলে দিয়ে নতুন করে মেডিসিন মিশ্রণ তৈরি করতে হবে।";

  const groups: GoogleDocMedicineGroup[] = [];
  let currentGroup: GoogleDocMedicineGroup | null = null;
  let currentCourse: GoogleDocMedicineCourse | null = null;

  const groupMonthsMap: Record<number, { months: number[]; text: string }> = {
    1: { months: [1, 4, 7, 10], text: "জানুয়ারি, এপ্রিল, জুলাই, অক্টোবর" },
    2: { months: [2, 5, 8, 11], text: "ফেব্রুয়ারি, মে, আগস্ট, নভেম্বর" },
    3: { months: [3, 6, 9, 12], text: "মার্চ, জুন, সেপ্টেম্বর, ডিসেম্বর" },
    4: { months: [], text: "অতিরিক্ত ও বিশেষ ট্রিটমেন্ট গাইডলাইন" },
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes("বিশেষ দ্রষ্টব্য:")) {
      specialNotice = line;
      continue;
    }

    if (line.startsWith("________________")) continue;

    // Detect Group Header (e.g. গ্রুপ ১, গ্রুপ ২, গ্রুপ ৩, গ্রুপ ৪)
    const groupMatch = line.match(/গ্রুপ\s*([১-৪\d])/);
    if (groupMatch) {
      const gNum = parseInt(bengaliToEnglishDigits(groupMatch[1]), 10) || groups.length + 1;
      const mapping = groupMonthsMap[gNum] || { months: [], text: "" };

      currentGroup = {
        id: `group_${gNum}`,
        groupNumber: gNum,
        title: line,
        applicableMonths: mapping.months,
        monthNamesText: mapping.text,
        courses: [],
      };
      groups.push(currentGroup);
      currentCourse = null;
      continue;
    }

    // Detect Course Header (e.g. "১. স্যালাইন কোর্স (৫ দিন)" or "* ৪. ভিটামিন বি কোর্স (৬ দিন)")
    const courseHeaderMatch = line.match(/^[\*\s]*([০-৯\d]+)[\.\)]\s*(.+?)(?:\s*\(([০-৯\d]+)\s*দিন\))?$/);
    if (
      courseHeaderMatch &&
      (line.includes("কোর্স") ||
        line.includes("টনিক") ||
        line.includes("ভিটামিন") ||
        line.includes("স্যালাইন") ||
        line.includes("কৃমি") ||
        line.includes("জিঙ্ক") ||
        line.includes("সালমোনেলোসিস") ||
        line.includes("প্রোবায়োটিক") ||
        line.includes("লাইসোভিট"))
    ) {
      if (!currentGroup) {
        currentGroup = {
          id: "group_1",
          groupNumber: 1,
          title: "গ্রুপ ১: জানুয়ারি, এপ্রিল, জুলাই এবং অক্টোবর মাসের কোর্স",
          applicableMonths: [1, 4, 7, 10],
          monthNamesText: "জানুয়ারি, এপ্রিল, জুলাই, অক্টোবর",
          courses: [],
        };
        groups.push(currentGroup);
      }

      const serial = parseInt(bengaliToEnglishDigits(courseHeaderMatch[1]), 10) || currentGroup.courses.length + 1;
      const durationDays = courseHeaderMatch[3]
        ? parseInt(bengaliToEnglishDigits(courseHeaderMatch[3]), 10)
        : 5;

      currentCourse = {
        id: `course_${currentGroup.id}_${serial}_${Date.now()}`,
        serial,
        title: line.replace(/^[\*\s]+/, ""),
        durationDays,
        dateRangeText: "",
        startDay: 1,
        endDay: 5,
        medicine: "",
        dose: "",
        benefits: "",
        instructions: "",
        breakText: "",
      };

      currentGroup.courses.push(currentCourse);
      continue;
    }

    // Populate current course attributes
    if (currentCourse) {
      if (line.includes("তারিখ:")) {
        const textRange = line.replace(/^[\*\s]*তারিখ:\s*/, "").trim();
        currentCourse.dateRangeText = textRange;
        const { startDay, endDay } = parseDateRange(textRange);
        currentCourse.startDay = startDay;
        currentCourse.endDay = endDay;
      } else if (line.includes("মেডিসিন:")) {
        currentCourse.medicine = line.replace(/^[\*\s]*মেডিসিন:\s*/, "").trim();
      } else if (line.includes("পরিমাণ:")) {
        currentCourse.dose = line.replace(/^[\*\s]*পরিমাণ:\s*/, "").trim();
      } else if (line.includes("উপকারিতা:")) {
        currentCourse.benefits = line.replace(/^[\*\s]*উপকারিতা:\s*/, "").trim();
      } else if (line.includes("প্রয়োগ বিধি:")) {
        currentCourse.instructions = line.replace(/^[\*\s]*প্রয়োগ বিধি:\s*/, "").trim();
      } else if (line.includes("বিরতি")) {
        currentCourse.breakText = line.trim();
      }
    }
  }

  // Determine current active group based on system month (1-12)
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const activeGroup = groups.find((g) => g.applicableMonths.includes(currentMonth)) || groups[0];

  return {
    title,
    specialNotice,
    documentUrl: docUrl,
    lastFetchedAt: new Date().toISOString(),
    groups,
    activeGroup,
  };
}

/**
 * Synchronizes the Google Doc's courses into ERP MedicineSchedule records.
 * Updates MongoDB and data/medicineSchedules.json for seamless real-time alignment.
 */
export async function syncGoogleDocToDatabase(
  customDocUrl?: string,
  targetYear?: number
): Promise<{
  success: boolean;
  message: string;
  timestamp: string;
  totalCourses: number;
  addedOrUpdated: number;
  guidelines: GoogleDocMedicineGuidelines;
  schedules: MedicineSchedule[];
}> {
  const docUrl = customDocUrl || DEFAULT_MEDICINE_GUIDE_DOC_URL;
  const year = targetYear || new Date().getFullYear();
  const timestamp = new Date().toISOString();

  const { text } = await fetchGoogleDocRawText(docUrl);
  const guidelines = parseGoogleDocMedicineGuidelines(text, docUrl);

  const currentMonth = new Date().getMonth() + 1;
  const mStr = String(currentMonth).padStart(2, "0");
  const todayStr = timestamp.split("T")[0]; // YYYY-MM-DD

  // Find active group for current month
  const activeGroup =
    guidelines.groups.find((g) => g.applicableMonths.includes(currentMonth)) ||
    guidelines.groups[0];

  if (!activeGroup || activeGroup.courses.length === 0) {
    return {
      success: true,
      message: `No active courses found in Google Doc for month ${mStr}.`,
      timestamp,
      totalCourses: 0,
      addedOrUpdated: 0,
      guidelines,
      schedules: [],
    };
  }

  // Build MedicineSchedule objects for current month
  const docSchedules: MedicineSchedule[] = activeGroup.courses.map((course, idx) => {
    const sDay = String(course.startDay).padStart(2, "0");
    const eDay = String(course.endDay).padStart(2, "0");
    const startDate = `${year}-${mStr}-${sDay}`;
    const endDate = `${year}-${mStr}-${eDay}`;

    let status: MedicineScheduleStatus = "UPCOMING";
    if (todayStr >= startDate && todayStr <= endDate) {
      status = "IN_PROGRESS";
    } else if (todayStr > endDate) {
      status = "COMPLETED";
    }

    const stableId = `sched_doc_${year}_${mStr}_${idx + 1}`;
    const notes = [
      course.instructions ? `প্রয়োগ বিধি: ${course.instructions}` : null,
      course.breakText ? course.breakText : null,
      `Google Doc Source: ${course.title}`,
    ]
      .filter(Boolean)
      .join(" | ");

    return {
      id: stableId,
      medicineName: course.medicine || course.title,
      targetType: "FLOCK",
      pigeonId: null,
      startDate,
      endDate,
      dose: course.dose || undefined,
      purpose: course.benefits || course.title,
      status,
      notes,
      createdAt: timestamp,
    };
  });

  // Load existing schedules
  let existingSchedules: MedicineSchedule[] = [];
  try {
    const filePath = path.join(process.cwd(), "data", "medicineSchedules.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      existingSchedules = JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Could not read medicineSchedules.json:", e);
  }

  // Retain non-doc or other month schedules
  const otherSchedules = existingSchedules.filter((s) => !s.id.startsWith(`sched_doc_${year}_${mStr}_`));
  const mergedSchedules = [...otherSchedules, ...docSchedules];

  // Save to disk
  try {
    const filePath = path.join(process.cwd(), "data", "medicineSchedules.json");
    fs.writeFileSync(filePath, JSON.stringify(mergedSchedules, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not write medicineSchedules.json:", e);
  }

  // Update fallbackStore
  fallbackStore.set({
    medicineSchedules: mergedSchedules as unknown as Record<string, unknown>[],
    settings: {
      ...(fallbackStore.get().settings as Record<string, unknown>),
      medicineDocUrl: docUrl,
      lastMedicineDocSyncedAt: timestamp,
    },
  });

  // Save to MongoDB if available
  try {
    const db = await connectDB();
    if (db) {
      for (const s of docSchedules) {
        await MedicineScheduleModel.findByIdAndUpdate(s.id, s, { upsert: true, new: true });
      }
      await AppConfigModel.findByIdAndUpdate(
        "GOOGLE_DOC_CONFIG" as unknown,
        {
          _id: "GOOGLE_DOC_CONFIG",
          data: {
            medicineDocUrl: docUrl,
            lastSyncedAt: timestamp,
            totalCourses: activeGroup.courses.length,
          },
        },
        { upsert: true }
      );
    }
  } catch (dbErr) {
    console.warn("Could not sync Google Doc schedules to MongoDB:", dbErr);
  }

  const message = `Successfully synchronized ${docSchedules.length} medicine courses for ${activeGroup.monthNamesText || "Active Month"} from Google Doc.`;

  return {
    success: true,
    message,
    timestamp,
    totalCourses: guidelines.groups.reduce((acc, g) => acc + g.courses.length, 0),
    addedOrUpdated: docSchedules.length,
    guidelines,
    schedules: mergedSchedules,
  };
}
