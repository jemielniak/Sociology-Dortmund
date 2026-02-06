#!/usr/bin/env node
/**
 * check-links.mjs — Verify all TU Dortmund source URLs resolve.
 * Run: node scripts/check-links.mjs
 * Returns exit code 1 if any URL fails.
 */

const URLS = [
  "https://sowi.tu-dortmund.de/en/study-programs/overview-of-the-study-programs/sociology-1/module-handbook-examination-regulations-study-plan/",
  "https://sowi.tu-dortmund.de/storages/sowi/r/Dokumente/Bachelor_Soziologie/MHB_BA_Soziologie_06_2023.pdf",
  "https://sowi.tu-dortmund.de/storages/sowi/r/Dokumente/Bachelor_Soziologie/Studienverlaufsplan_BA_Soziologie_detailliert.pdf",
  "https://sowi.tu-dortmund.de/en/study-programs/overview-of-the-study-programs/sociology-1/semester-abroad/",
  "https://sowi.tu-dortmund.de/en/study-programs/overview-of-the-study-programs/sociology-1/complementary-subject/",
  "https://sowi.tu-dortmund.de/en/study-programs/overview-of-the-study-programs/sociology-1/fundamental-studies/",
  "https://sowi.tu-dortmund.de/en/study-programs/overview-of-the-study-programs/sociology-1/recognition-of-examination-results-/-examination-board/",
  "https://sowi.tu-dortmund.de/en/study-programs/overview-of-the-study-programs/sociology-1/mentoring-program/",
  "https://sowi.tu-dortmund.de/en/study-programs/overview-of-the-study-programs/sociology-1/dealing-with-chatgpt-/-ai/",
  "https://sowi.tu-dortmund.de/en/international-affairs/outgoings/erasmus/",
  "https://sowi.tu-dortmund.de/en/department/committees-and-representatives/committees/examination-boards/",
  "https://sowi.tu-dortmund.de/en/department/committees-and-representatives/representatives/study-coordinator/",
  "https://sowi.tu-dortmund.de/en/department/committees-and-representatives/representatives/international-student-advisor/",
  "https://sowi.tu-dortmund.de/en/faculty/committees-and-representatives/complaint-management/",
];

let failed = 0;

for (const url of URLS) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    const status = res.status;
    const ok = status >= 200 && status < 400;
    console.log(`${ok ? "✓" : "✕"} [${status}] ${url}`);
    if (!ok) failed++;
  } catch (err) {
    console.log(`✕ [ERR] ${url} — ${err.message}`);
    failed++;
  }
}

console.log(`\n${URLS.length - failed}/${URLS.length} URLs OK`);
if (failed) {
  console.log(`⚠ ${failed} URL(s) failed — update SOURCES in App.jsx`);
  process.exit(1);
}
