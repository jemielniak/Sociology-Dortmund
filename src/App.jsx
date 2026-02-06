import { useState, useEffect, useCallback, useMemo, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════
   TU DORTMUND – SOCIOLOGY B.A. DEGREE PLANNER PWA
   Three screens: Progress · Plan · Ask
   ═══════════════════════════════════════════════════════════════════ */

// ─── i18n ────────────────────────────────────────────────────────
const STRINGS = {
  en: {
    appTitle: "Sociology B.A. Planner",
    appSubtitle: "TU Dortmund · Unofficial Student Tool",
    disclaimer: "⚠ This is NOT an official TU Dortmund application. Always verify with official documents.",
    disclaimerLink: "Official module handbook & study plan →",
    tabs: { progress: "Progress", plan: "Plan", ask: "Ask" },
    progress: {
      title: "Module Completion Tracker",
      total: "Total ECTS",
      of: "of",
      remaining: "remaining",
      completed: "Completed",
      semester: "Semester",
      compulsory: "Compulsory Modules",
      elective: "Elective Tracks",
      complementary: "Komplementfach & Extras",
      trackA: "Track A (choose one field)",
      trackB: "Track B (choose one field)",
      fields: {
        "inequality": "Social Inequalities & Cultural Differences",
        "lifespan": "Lifespan & Biography",
        "health": "Health & Well-being",
        "work": "Work, Organization & Technology",
        "knowledge": "Knowledge & Education",
        "environment": "Environment & Innovation",
      },
      selectField: "Select your field…",
      cp: "CP",
      exportBtn: "Export Progress",
      importBtn: "Import Progress",
      resetBtn: "Reset All",
    },
    plan: {
      title: "Degree Path Builder",
      subtitle: "Drag modules into semesters to plan your path",
      violations: "Rule Violations",
      warnings: "Warnings",
      noIssues: "✓ No issues detected",
      unplaced: "Unplaced Modules",
      semester: "Semester",
      mobility: "Mobility Semester",
      cpLabel: "CP",
      recommended: "Recommended semester",
    },
    ask: {
      title: "Where Do I Ask This?",
      subtitle: "Find the right contact for your question",
      back: "← Back",
      restart: "Start over",
      contact: "Contact",
      moreInfo: "More information →",
      categories: {
        recognition: "Credit Recognition",
        mobility: "Semester Abroad / Mobility",
        exams: "Exams & Grades",
        complementary: "Komplementfach",
        studFund: "Studium Fundamentale",
        general: "General Advice",
        mentoring: "Mentoring",
        complaints: "Complaints",
        ai: "Using ChatGPT / AI",
      },
    },
    offline: "You are offline – data is saved locally",
  },
  de: {
    appTitle: "Soziologie B.A. Planer",
    appSubtitle: "TU Dortmund · Inoffizielles Studierendentool",
    disclaimer: "⚠ Dies ist KEINE offizielle TU Dortmund Anwendung. Immer mit offiziellen Dokumenten abgleichen.",
    disclaimerLink: "Offizielles Modulhandbuch & Studienverlaufsplan →",
    tabs: { progress: "Fortschritt", plan: "Planung", ask: "Fragen" },
    progress: {
      title: "Modul-Fortschrittstracker",
      total: "ECTS gesamt",
      of: "von",
      remaining: "verbleibend",
      completed: "Abgeschlossen",
      semester: "Semester",
      compulsory: "Pflichtmodule",
      elective: "Wahlpflichtbereiche",
      complementary: "Komplementfach & Extras",
      trackA: "Bereich A (ein Feld wählen)",
      trackB: "Bereich B (ein Feld wählen)",
      fields: {
        "inequality": "Soz. Ungleichheiten & kult. Unterschiede",
        "lifespan": "Lebenslauf & Biografie",
        "health": "Gesundheit & Wohlbefinden",
        "work": "Arbeit, Organisation & Technik",
        "knowledge": "Wissen & Bildung",
        "environment": "Umwelt & Innovation",
      },
      selectField: "Feld auswählen…",
      cp: "CP",
      exportBtn: "Fortschritt exportieren",
      importBtn: "Fortschritt importieren",
      resetBtn: "Alles zurücksetzen",
    },
    plan: {
      title: "Studienverlaufsplaner",
      subtitle: "Module in Semester ziehen, um den Verlauf zu planen",
      violations: "Regelverstöße",
      warnings: "Hinweise",
      noIssues: "✓ Keine Probleme erkannt",
      unplaced: "Nicht eingeplante Module",
      semester: "Semester",
      mobility: "Mobilitätssemester",
      cpLabel: "CP",
      recommended: "Empfohlenes Semester",
    },
    ask: {
      title: "Wohin mit meiner Frage?",
      subtitle: "Finde die richtige Anlaufstelle",
      back: "← Zurück",
      restart: "Neu starten",
      contact: "Kontakt",
      moreInfo: "Weitere Informationen →",
      categories: {
        recognition: "Leistungsanerkennung",
        mobility: "Auslandssemester / Mobilität",
        exams: "Prüfungen & Noten",
        complementary: "Komplementfach",
        studFund: "Studium Fundamentale",
        general: "Allgemeine Beratung",
        mentoring: "Mentoring",
        complaints: "Beschwerden",
        ai: "Umgang mit ChatGPT / KI",
      },
    },
    offline: "Sie sind offline – Daten werden lokal gespeichert",
  },
};

// ─── DEGREE MODEL ────────────────────────────────────────────────
const SOURCE_BASE = "https://sowi.tu-dortmund.de";
const SOURCES = {
  studyPlan: `${SOURCE_BASE}/storages/sowi/r/Dokumente/Bachelor_Soziologie/Studienverlaufsplan_BA_Soziologie_detailliert.pdf`,
  moduleHandbook: `${SOURCE_BASE}/storages/sowi/r/Dokumente/Bachelor_Soziologie/MHB_BA_Soziologie_06_2023.pdf`,
  programPage: `${SOURCE_BASE}/en/study-programs/overview-of-the-study-programs/sociology-1/module-handbook-examination-regulations-study-plan/`,
  semesterAbroad: `${SOURCE_BASE}/en/study-programs/overview-of-the-study-programs/sociology-1/semester-abroad/`,
  complementary: `${SOURCE_BASE}/en/study-programs/overview-of-the-study-programs/sociology-1/complementary-subject/`,
  fundamentale: `${SOURCE_BASE}/en/study-programs/overview-of-the-study-programs/sociology-1/fundamental-studies/`,
  recognition: `${SOURCE_BASE}/en/study-programs/overview-of-the-study-programs/sociology-1/recognition-of-examination-results-/-examination-board/`,
  mentoring: `${SOURCE_BASE}/en/study-programs/overview-of-the-study-programs/sociology-1/mentoring-program/`,
  ai: `${SOURCE_BASE}/en/study-programs/overview-of-the-study-programs/sociology-1/dealing-with-chatgpt-/-ai/`,
  praxis: `${SOURCE_BASE}/en/study-programs/overview-of-the-study-programs/sociology-1/language/writing-courses-practical-module/`,
  erasmus: `${SOURCE_BASE}/en/international-affairs/outgoings/erasmus/`,
  examBoard: `${SOURCE_BASE}/en/department/committees-and-representatives/committees/examination-boards/`,
  studyCoord: `${SOURCE_BASE}/en/department/committees-and-representatives/representatives/study-coordinator/`,
  intlAdvisor: `${SOURCE_BASE}/en/department/committees-and-representatives/representatives/international-student-advisor/`,
  complaints: `${SOURCE_BASE}/en/faculty/committees-and-representatives/complaint-management/`,
};

const TOTAL_CP = 180;

// M5/M9 track fields — A picks from group A, B from group B
const TRACK_A_FIELDS = ["lifespan", "work", "environment"];
const TRACK_B_FIELDS = ["inequality", "health", "knowledge"];

const MODULES = [
  // ── Compulsory Core ──
  { id: "M1.1", name_en: "Foundations of Sociology & Theories", name_de: "Grundlagen der Soziologie & soz. Theorien", cp: 8, recSem: 1, type: "compulsory", prereqs: [], source_ref: "MHB §M1.1" },
  { id: "M1.2", name_en: "Foundational Readings", name_de: "Grundlagenliteratur", cp: 8, recSem: 1, type: "compulsory", prereqs: [], source_ref: "MHB §M1.2" },
  { id: "M2", name_en: "Research Methods Introduction", name_de: "Forschungsmethoden Einführung", cp: 8, recSem: [1, 2], type: "compulsory", prereqs: [], source_ref: "MHB §M2" },
  { id: "M3", name_en: "Social Change: Foundations", name_de: "Zentrale Felder ges. Wandels: Grundlegungen", cp: 8, recSem: 1, type: "compulsory", prereqs: [], source_ref: "MHB §M3" },
  { id: "M4", name_en: "Statistics (Quantitative Methods)", name_de: "Vertiefung quant. Methoden – Statistik", cp: 7, recSem: 2, type: "compulsory", prereqs: [], source_ref: "MHB §M4" },
  { id: "M6", name_en: "Research Workshop (Quantitative)", name_de: "Forschungswerkstatt (quantitativ)", cp: 10, recSem: [3, 4], type: "compulsory",
    prereqs: [
      { type: "completed", moduleId: "M2", source_ref: "MHB §M6 Teilnahmevoraussetzungen" },
      { type: "enrolled_or_completed", moduleId: "M4", source_ref: "MHB §M6 Teilnahmevoraussetzungen" },
    ],
    source_ref: "MHB §M6",
  },
  { id: "M7", name_en: "Research Workshop (Qualitative)", name_de: "Forschungswerkstatt (qualitativ)", cp: 10, recSem: [3, 4], type: "compulsory",
    prereqs: [
      { type: "completed", moduleId: "M2", source_ref: "MHB §M7 Teilnahmevoraussetzungen" },
    ],
    source_ref: "MHB §M7",
  },
  { id: "M8", name_en: "Qual. & Interpretive Methods (Advanced)", name_de: "Vertiefung qual. & interpretative Methoden", cp: 8, recSem: [4, 5], type: "compulsory", prereqs: [], source_ref: "MHB §M8" },

  // ── Elective Tracks (M5A/B and M9A/B) ──
  { id: "M5A", name_en: "Social Change: Foundations A", name_de: "Zentrale Felder: Grundlagen A", cp: 9, recSem: 2, type: "elective_A",
    prereqs: [{ type: "recommended", moduleId: "M3", source_ref: "MHB §M5 Teilnahmevoraussetzungen" }],
    source_ref: "MHB §M5",
  },
  { id: "M5B", name_en: "Social Change: Foundations B", name_de: "Zentrale Felder: Grundlagen B", cp: 9, recSem: 3, type: "elective_B",
    prereqs: [{ type: "recommended", moduleId: "M3", source_ref: "MHB §M5 Teilnahmevoraussetzungen" }],
    source_ref: "MHB §M5",
  },
  { id: "M9A", name_en: "Social Change: Advanced A", name_de: "Zentrale Felder: Vertiefung A", cp: 10, recSem: 4, type: "elective_A",
    prereqs: [
      { type: "enrolled_or_completed", moduleId: "M5A", source_ref: "MHB §M9 – must be same field as M5A" },
    ],
    source_ref: "MHB §M9",
  },
  { id: "M9B", name_en: "Social Change: Advanced B", name_de: "Zentrale Felder: Vertiefung B", cp: 10, recSem: 4, type: "elective_B",
    prereqs: [
      { type: "enrolled_or_completed", moduleId: "M5B", source_ref: "MHB §M9 – must be same field as M5B" },
    ],
    source_ref: "MHB §M9",
  },

  // ── Praxis Module ──
  { id: "M10.1", name_en: "Career Fields for Sociologists", name_de: "Berufsfelder für Soziolog*innen", cp: 2, recSem: 2, type: "compulsory", prereqs: [], source_ref: "MHB §M10" },
  { id: "M10.2a", name_en: "Practical Module (Language/Skills I)", name_de: "Praxismodul (Sprache/Schlüsselkomp. I)", cp: 4, recSem: 3, type: "compulsory", prereqs: [], source_ref: "MHB §M10" },
  { id: "M10.2b", name_en: "Practical Module (Language/Skills II)", name_de: "Praxismodul (Sprache/Schlüsselkomp. II)", cp: 4, recSem: 5, type: "compulsory", prereqs: [], source_ref: "MHB §M10" },

  // ── Mobility ──
  { id: "M11", name_en: "Mobility Semester", name_de: "Mobilitätssemester", cp: 30, recSem: 5, type: "mobility",
    prereqs: [],
    source_ref: "Studienverlaufsplan Sem 5; PO §M11",
  },

  // ── Bachelor Thesis ──
  { id: "M12", name_en: "Bachelor Thesis", name_de: "Bachelorarbeit", cp: 12, recSem: 6, type: "compulsory",
    prereqs: [
      { type: "min_cp", value: 120, source_ref: "MHB §M12 – Erwerb von 120 ECTS-Punkten" },
    ],
    source_ref: "MHB §M12",
  },

  // ── Komplementfach ──
  { id: "KF1", name_en: "Komplementfach I", name_de: "Komplementfach I", cp: 5, recSem: 1, type: "komplementfach", prereqs: [], source_ref: "Studienverlaufsplan" },
  { id: "KF2", name_en: "Komplementfach II", name_de: "Komplementfach II", cp: 5, recSem: 2, type: "komplementfach", prereqs: [], source_ref: "Studienverlaufsplan" },
  { id: "KF3", name_en: "Komplementfach III", name_de: "Komplementfach III", cp: 5, recSem: 4, type: "komplementfach", prereqs: [], source_ref: "Studienverlaufsplan" },
  { id: "KF4", name_en: "Komplementfach IV", name_de: "Komplementfach IV", cp: 5, recSem: 6, type: "komplementfach", prereqs: [], source_ref: "Studienverlaufsplan" },

  // ── Studium Fundamentale ──
  { id: "SF", name_en: "Studium Fundamentale", name_de: "Studium Fundamentale", cp: 3, recSem: 3, type: "fundamentale", prereqs: [], source_ref: "Studienverlaufsplan" },
];

// ─── RULE ENGINE ─────────────────────────────────────────────────
function validatePlan(semesterPlan, completedModules) {
  const errors = [];
  const warnings = [];

  // Build lookup: moduleId → semester number
  const placement = {};
  semesterPlan.forEach((mods, semIdx) => {
    mods.forEach((modId) => {
      placement[modId] = semIdx + 1;
    });
  });

  // Check all placed modules
  for (const mod of MODULES) {
    const sem = placement[mod.id];
    if (!sem) continue;

    for (const prereq of mod.prereqs) {
      if (prereq.type === "completed") {
        const prereqSem = placement[prereq.moduleId];
        if (!prereqSem) {
          errors.push({
            moduleId: mod.id,
            rule: `${prereq.moduleId} must be completed before ${mod.id}`,
            rule_de: `${prereq.moduleId} muss vor ${mod.id} abgeschlossen sein`,
            source_ref: prereq.source_ref,
          });
        } else if (prereqSem >= sem) {
          errors.push({
            moduleId: mod.id,
            rule: `${prereq.moduleId} must be in an earlier semester than ${mod.id} (currently both in Sem ${sem})`,
            rule_de: `${prereq.moduleId} muss in einem früheren Semester als ${mod.id} sein`,
            source_ref: prereq.source_ref,
          });
        }
      }

      if (prereq.type === "enrolled_or_completed") {
        const prereqSem = placement[prereq.moduleId];
        if (!prereqSem) {
          errors.push({
            moduleId: mod.id,
            rule: `${prereq.moduleId} must be enrolled or completed before/with ${mod.id}`,
            rule_de: `${prereq.moduleId} muss eingeschrieben oder abgeschlossen sein für ${mod.id}`,
            source_ref: prereq.source_ref,
          });
        } else if (prereqSem > sem) {
          errors.push({
            moduleId: mod.id,
            rule: `${prereq.moduleId} (Sem ${prereqSem}) cannot come after ${mod.id} (Sem ${sem})`,
            rule_de: `${prereq.moduleId} (Sem ${prereqSem}) darf nicht nach ${mod.id} (Sem ${sem}) kommen`,
            source_ref: prereq.source_ref,
          });
        }
      }

      if (prereq.type === "recommended") {
        const prereqSem = placement[prereq.moduleId];
        if (!prereqSem || prereqSem >= sem) {
          warnings.push({
            moduleId: mod.id,
            rule: `Recommended: complete ${prereq.moduleId} before ${mod.id}`,
            rule_de: `Empfohlen: ${prereq.moduleId} vor ${mod.id} abschließen`,
            source_ref: prereq.source_ref,
          });
        }
      }

      if (prereq.type === "min_cp") {
        // Sum CP of modules in semesters before this one
        let cpBefore = 0;
        semesterPlan.forEach((mods, idx) => {
          if (idx + 1 < sem) {
            mods.forEach((mId) => {
              const m = MODULES.find((x) => x.id === mId);
              if (m) cpBefore += m.cp;
            });
          }
        });
        if (cpBefore < prereq.value) {
          errors.push({
            moduleId: mod.id,
            rule: `${mod.id} requires ${prereq.value} CP completed before; only ${cpBefore} CP in prior semesters`,
            rule_de: `${mod.id} erfordert ${prereq.value} CP vorher; nur ${cpBefore} CP in vorherigen Semestern`,
            source_ref: prereq.source_ref,
          });
        }
      }
    }
  }

  // Check total CP
  const totalPlaced = Object.keys(placement).reduce((sum, mId) => {
    const m = MODULES.find((x) => x.id === mId);
    return sum + (m ? m.cp : 0);
  }, 0);
  if (totalPlaced < TOTAL_CP && Object.keys(placement).length > 0) {
    warnings.push({
      moduleId: null,
      rule: `Total planned: ${totalPlaced}/${TOTAL_CP} CP — ${TOTAL_CP - totalPlaced} CP not yet placed`,
      rule_de: `Geplant: ${totalPlaced}/${TOTAL_CP} CP — ${TOTAL_CP - totalPlaced} CP noch nicht eingeplant`,
      source_ref: "Studienverlaufsplan",
    });
  }

  return { errors, warnings };
}

// ─── ASK ROUTER DECISION TREE ────────────────────────────────────
const ASK_TREE = {
  root: {
    question_en: "What kind of question do you have?",
    question_de: "Was für eine Frage haben Sie?",
    options: [
      { label_en: "Credit Recognition", label_de: "Leistungsanerkennung", next: "recognition" },
      { label_en: "Semester Abroad / Mobility", label_de: "Auslandssemester / Mobilität", next: "mobility" },
      { label_en: "Exams & Grades", label_de: "Prüfungen & Noten", next: "exams" },
      { label_en: "Komplementfach", label_de: "Komplementfach", next: "complementary" },
      { label_en: "Studium Fundamentale", label_de: "Studium Fundamentale", next: "stud_fund" },
      { label_en: "General Study Advice", label_de: "Allgemeine Studienberatung", next: "general" },
      { label_en: "Mentoring Program", label_de: "Mentoring-Programm", next: "mentoring" },
      { label_en: "Using ChatGPT / AI", label_de: "Umgang mit ChatGPT / KI", next: "ai_use" },
      { label_en: "Complaints", label_de: "Beschwerden", next: "complaints" },
    ],
  },
  recognition: {
    question_en: "What kind of recognition?",
    question_de: "Welche Art der Anerkennung?",
    options: [
      { label_en: "Courses from another German university", label_de: "Kurse von einer anderen dt. Hochschule", next: "recog_domestic" },
      { label_en: "Courses from abroad (mobility semester)", label_de: "Kurse aus dem Ausland (Mobilitätssemester)", next: "recog_abroad" },
      { label_en: "Other (e.g. prior learning)", label_de: "Sonstiges (z.B. Vorleistungen)", next: "recog_other" },
    ],
  },
  recog_domestic: {
    answer_en: "Submit an application to the **Examination Board** (Prüfungsausschuss) with your transcripts and module descriptions. Use the official forms.",
    answer_de: "Stellen Sie einen Antrag beim **Prüfungsausschuss** mit Ihren Leistungsnachweisen und Modulbeschreibungen. Nutzen Sie die offiziellen Formulare.",
    contact_en: "Examination Board (Prüfungsausschuss)",
    contact_de: "Prüfungsausschuss",
    url: SOURCES.recognition,
  },
  recog_abroad: {
    answer_en: "After your mobility semester, submit your Transcript of Records to the **Examination Board** along with your approved Learning Agreement for credit recognition.",
    answer_de: "Nach dem Mobilitätssemester reichen Sie Ihr Transcript of Records beim **Prüfungsausschuss** zusammen mit Ihrem genehmigten Learning Agreement zur Anerkennung ein.",
    contact_en: "Examination Board + Internationalisation Officer",
    contact_de: "Prüfungsausschuss + Internationalisierungsbeauftragte",
    url: SOURCES.recognition,
  },
  recog_other: {
    answer_en: "For any other recognition requests, contact the **Examination Board** directly. They handle all recognition decisions.",
    answer_de: "Für alle anderen Anerkennungsfragen wenden Sie sich direkt an den **Prüfungsausschuss**.",
    contact_en: "Examination Board",
    contact_de: "Prüfungsausschuss",
    url: SOURCES.examBoard,
  },
  mobility: {
    question_en: "What about your semester abroad?",
    question_de: "Was zu Ihrem Auslandssemester?",
    options: [
      { label_en: "Planning / Application", label_de: "Planung / Bewerbung", next: "mob_plan" },
      { label_en: "Learning Agreement", label_de: "Learning Agreement", next: "mob_la" },
      { label_en: "Erasmus funding & logistics", label_de: "Erasmus-Förderung & Logistik", next: "mob_erasmus" },
      { label_en: "Exception: Research internship instead", label_de: "Ausnahme: Forschungspraktikum stattdessen", next: "mob_exception" },
    ],
  },
  mob_plan: {
    answer_en: "Start with the **International Student Advisor** at the department. They coordinate partner universities and help with your application timeline.",
    answer_de: "Beginnen Sie bei der **Internationalisierungsbeauftragten** der Fakultät. Sie koordiniert Partneruniversitäten und hilft beim Zeitplan.",
    contact_en: "International Student Advisor (Fakultät Sowi)",
    contact_de: "Internationalisierungsbeauftragte (Fakultät Sowi)",
    url: SOURCES.semesterAbroad,
  },
  mob_la: {
    answer_en: "Your **Learning Agreement** must be approved by the department's Internationalisation Officer before departure. Changes abroad need approval too.",
    answer_de: "Ihr **Learning Agreement** muss vor der Abreise von der Internationalisierungsbeauftragten genehmigt werden. Änderungen im Ausland brauchen ebenfalls Genehmigung.",
    contact_en: "Internationalisation Officer",
    contact_de: "Internationalisierungsbeauftragte",
    url: SOURCES.erasmus,
  },
  mob_erasmus: {
    answer_en: "For Erasmus application, funding, and logistics, contact the **Erasmus Departmental Coordinator** and the central International Office (Referat Internationales).",
    answer_de: "Für Erasmus-Bewerbung, Förderung und Logistik wenden Sie sich an die **Erasmus-Fachkoordination** und das zentrale Referat Internationales.",
    contact_en: "Erasmus Departmental Coordinator",
    contact_de: "Erasmus-Fachkoordination",
    url: SOURCES.erasmus,
  },
  mob_exception: {
    answer_en: "If you cannot go abroad, an exception for a research internship (Forschungspraktikum) may be possible. Discuss this with the **Study Coordinator** first, then apply to the **Examination Board**.",
    answer_de: "Wenn ein Auslandsaufenthalt nicht möglich ist, kann eine Ausnahme für ein Forschungspraktikum beantragt werden. Besprechen Sie dies zuerst mit der **Studienkoordination**, dann stellen Sie einen Antrag beim **Prüfungsausschuss**.",
    contact_en: "Study Coordinator → Examination Board",
    contact_de: "Studienkoordination → Prüfungsausschuss",
    url: SOURCES.semesterAbroad,
  },
  exams: {
    question_en: "What about exams?",
    question_de: "Was zu Prüfungen?",
    options: [
      { label_en: "Registration / deadlines", label_de: "Anmeldung / Fristen", next: "exam_reg" },
      { label_en: "Failed exam / retake", label_de: "Nicht bestanden / Wiederholung", next: "exam_fail" },
      { label_en: "Grade dispute", label_de: "Noteneinspruch", next: "exam_dispute" },
      { label_en: "Illness / withdrawal", label_de: "Krankheit / Rücktritt", next: "exam_illness" },
    ],
  },
  exam_reg: {
    answer_en: "Exam registration happens via the **BOSS system**. Check deadlines in the semester schedule. Questions → **Study Coordinator**.",
    answer_de: "Die Prüfungsanmeldung erfolgt über das **BOSS-System**. Fristen im Semesterplan prüfen. Fragen → **Studienkoordination**.",
    contact_en: "Study Coordinator",
    contact_de: "Studienkoordination",
    url: SOURCES.studyCoord,
  },
  exam_fail: {
    answer_en: "You can retake exams. Specific rules depend on the module. Check the **Prüfungsordnung** or ask the **Examination Board**.",
    answer_de: "Wiederholungsprüfungen sind möglich. Die genauen Regeln hängen vom Modul ab. Prüfen Sie die **Prüfungsordnung** oder fragen Sie den **Prüfungsausschuss**.",
    contact_en: "Examination Board",
    contact_de: "Prüfungsausschuss",
    url: SOURCES.examBoard,
  },
  exam_dispute: {
    answer_en: "First discuss with the **examiner**. If unresolved, submit a written objection to the **Examination Board**.",
    answer_de: "Besprechen Sie dies zuerst mit dem/der **Prüfer*in**. Falls ungelöst, reichen Sie einen schriftlichen Einspruch beim **Prüfungsausschuss** ein.",
    contact_en: "Examiner → Examination Board",
    contact_de: "Prüfer*in → Prüfungsausschuss",
    url: SOURCES.examBoard,
  },
  exam_illness: {
    answer_en: "Submit a **medical certificate** (Attest) to the Examination Board promptly. Check your Prüfungsordnung for the exact deadline.",
    answer_de: "Reichen Sie ein **Attest** umgehend beim Prüfungsausschuss ein. Die genaue Frist steht in Ihrer Prüfungsordnung.",
    contact_en: "Examination Board",
    contact_de: "Prüfungsausschuss",
    url: SOURCES.examBoard,
  },
  complementary: {
    answer_en: "For questions about your **Komplementfach** (complementary subject, 20 CP), consult the respective department offering it. The Sociology department's website lists available options and contacts.",
    answer_de: "Für Fragen zum **Komplementfach** (20 CP) wenden Sie sich an die jeweilige anbietende Fakultät. Die Website der Soziologie listet verfügbare Optionen und Kontakte.",
    contact_en: "Study Coordinator (for general questions) / Respective department (for subject-specific)",
    contact_de: "Studienkoordination (allgemein) / Jeweilige Fakultät (fachspezifisch)",
    url: SOURCES.complementary,
  },
  stud_fund: {
    answer_en: "**Studium Fundamentale** (3 CP): Choose a course from faculties 1–16. Registration is usually via LSF. For questions about eligible courses, check the central Studium Fundamentale page.",
    answer_de: "**Studium Fundamentale** (3 CP): Wählen Sie eine Veranstaltung aus Fakultäten 1–16. Anmeldung meist über LSF. Für Fragen zu anerkannten Kursen prüfen Sie die zentrale Studium-Fundamentale-Seite.",
    contact_en: "Central Student Advisory Service / Study Coordinator",
    contact_de: "Zentrale Studienberatung / Studienkoordination",
    url: SOURCES.fundamentale,
  },
  general: {
    answer_en: "For general study advice, the **Study Coordinator** at the department is your first point of contact. For broader questions, try the central **Student Advisory Service**.",
    answer_de: "Für allgemeine Studienberatung ist die **Studienkoordination** der Fakultät Ihre erste Anlaufstelle. Für übergreifende Fragen gibt es die zentrale **Studienberatung**.",
    contact_en: "Study Coordinator (Fakultät Sowi)",
    contact_de: "Studienkoordination (Fakultät Sowi)",
    url: SOURCES.studyCoord,
  },
  mentoring: {
    answer_en: "The department offers a **mentoring program** for new students. Check the website for current mentors and sign-up information.",
    answer_de: "Die Fakultät bietet ein **Mentoring-Programm** für Erstsemester an. Aktuelle Mentor*innen und Anmeldung finden Sie auf der Website.",
    contact_en: "Mentoring Coordination",
    contact_de: "Mentoring-Koordination",
    url: SOURCES.mentoring,
  },
  ai_use: {
    answer_en: "The department has published guidelines on using **ChatGPT and other AI tools** in coursework. Check the dedicated page for policies and what to disclose.",
    answer_de: "Die Fakultät hat Richtlinien zur Nutzung von **ChatGPT und anderen KI-Tools** in Studienarbeiten veröffentlicht. Prüfen Sie die Seite zu Richtlinien und Offenlegungspflichten.",
    contact_en: "See department guidelines",
    contact_de: "Siehe Fakultätsrichtlinien",
    url: SOURCES.ai,
  },
  complaints: {
    answer_en: "The department has a formal **complaint management** process. Start by reviewing the complaints page, then submit your concern through the appropriate channel.",
    answer_de: "Die Fakultät hat ein formales **Beschwerdemanagement**. Informieren Sie sich zunächst auf der Beschwerdeseite und reichen Sie dann Ihr Anliegen ein.",
    contact_en: "Complaint Management Office",
    contact_de: "Beschwerdemanagement",
    url: SOURCES.complaints,
  },
};

// ─── COLORS & STYLES ─────────────────────────────────────────────
const COLORS = {
  bg: "#F7F6F3",
  card: "#FFFFFF",
  accent: "#006747",   // TU Dortmund green
  accentLight: "#E8F5EE",
  accentDark: "#004D34",
  warn: "#D4A017",
  warnBg: "#FFF9E6",
  error: "#C62828",
  errorBg: "#FFEBEE",
  text: "#1A1A1A",
  textMuted: "#6B6B6B",
  border: "#E0DED8",
  progressTrack: "#E8E6E1",
  mobility: "#1565C0",
  mobilityBg: "#E3F2FD",
  completed: "#006747",
  completedBg: "#E8F5EE",
};

// ─── STORAGE ─────────────────────────────────────────────────────
const STORAGE_KEY = "tu_soz_planner_v1";

function loadState() {
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveState(state) {
  try {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function defaultState() {
  return {
    completed: {},
    plan: [[], [], [], [], [], []],
    trackA: "",
    trackB: "",
    lang: "en",
  };
}

// ─── MAIN APP ────────────────────────────────────────────────────
export default function DegreePlanner() {
  const [state, setState] = useState(() => loadState() || defaultState());
  const [tab, setTab] = useState("progress");
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  const s = STRINGS[state.lang] || STRINGS.en;

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const setLang = (l) => setState((p) => ({ ...p, lang: l }));
  const setCompleted = (modId, val) =>
    setState((p) => ({ ...p, completed: { ...p.completed, [modId]: val } }));
  const setPlan = (plan) => setState((p) => ({ ...p, plan }));
  const setTrackA = (v) => setState((p) => ({ ...p, trackA: v }));
  const setTrackB = (v) => setState((p) => ({ ...p, trackB: v }));

  const completedCP = useMemo(
    () =>
      MODULES.filter((m) => state.completed[m.id]).reduce((s, m) => s + m.cp, 0),
    [state.completed]
  );

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `soz-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data && typeof data.completed === "object") {
            setState({ ...defaultState(), ...data });
          }
        } catch {}
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const resetAll = () => {
    if (window.confirm(state.lang === "de" ? "Alle Daten zurücksetzen?" : "Reset all data?")) {
      setState(defaultState());
    }
  };

  return (
    <div style={{ fontFamily: "'Söhne', 'Helvetica Neue', Helvetica, Arial, sans-serif", background: COLORS.bg, minHeight: "100vh", color: COLORS.text }}>
      {/* Header */}
      <header style={{
        background: COLORS.accent,
        color: "#fff",
        padding: "16px 20px 12px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 800, margin: "0 auto" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>{s.appTitle}</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{s.appSubtitle}</div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              onClick={() => setLang(state.lang === "en" ? "de" : "en")}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#fff",
                borderRadius: 6,
                padding: "4px 10px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
              aria-label="Toggle language"
            >
              {state.lang === "en" ? "DE" : "EN"}
            </button>
          </div>
        </div>
      </header>

      {/* Disclaimer */}
      <div style={{
        background: COLORS.warnBg,
        borderBottom: `2px solid ${COLORS.warn}`,
        padding: "10px 20px",
        fontSize: 12,
        textAlign: "center",
        lineHeight: 1.4,
      }}>
        <div>{s.disclaimer}</div>
        <a
          href={SOURCES.programPage}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: COLORS.accentDark, fontWeight: 600, textDecoration: "underline" }}
        >
          {s.disclaimerLink}
        </a>
      </div>

      {/* Offline banner */}
      {!isOnline && (
        <div style={{
          background: COLORS.errorBg,
          color: COLORS.error,
          padding: "8px 20px",
          fontSize: 12,
          textAlign: "center",
          fontWeight: 600,
        }}>
          {s.offline}
        </div>
      )}

      {/* Tab bar */}
      <nav style={{
        display: "flex",
        justifyContent: "center",
        gap: 0,
        background: COLORS.card,
        borderBottom: `1px solid ${COLORS.border}`,
        position: "sticky",
        top: 72,
        zIndex: 99,
      }}
      role="tablist"
      >
        {["progress", "plan", "ask"].map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              maxWidth: 200,
              padding: "12px 16px",
              border: "none",
              borderBottom: tab === t ? `3px solid ${COLORS.accent}` : "3px solid transparent",
              background: "transparent",
              color: tab === t ? COLORS.accent : COLORS.textMuted,
              fontWeight: tab === t ? 700 : 500,
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {s.tabs[t]}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "20px 16px 80px" }} role="tabpanel">
        {tab === "progress" && (
          <ProgressScreen
            s={s}
            lang={state.lang}
            completed={state.completed}
            setCompleted={setCompleted}
            completedCP={completedCP}
            trackA={state.trackA}
            trackB={state.trackB}
            setTrackA={setTrackA}
            setTrackB={setTrackB}
            onExport={exportData}
            onImport={importData}
            onReset={resetAll}
          />
        )}
        {tab === "plan" && (
          <PlanScreen
            s={s}
            lang={state.lang}
            plan={state.plan}
            setPlan={setPlan}
            completed={state.completed}
          />
        )}
        {tab === "ask" && <AskScreen s={s} lang={state.lang} />}
      </main>
    </div>
  );
}

// ─── PROGRESS SCREEN ─────────────────────────────────────────────
function ProgressScreen({ s, lang, completed, setCompleted, completedCP, trackA, trackB, setTrackA, setTrackB, onExport, onImport, onReset }) {
  const sp = s.progress;
  const pct = Math.round((completedCP / TOTAL_CP) * 100);
  const modName = (m) => (lang === "de" ? m.name_de : m.name_en);

  const compulsory = MODULES.filter((m) => m.type === "compulsory");
  const electiveA = MODULES.filter((m) => m.type === "elective_A");
  const electiveB = MODULES.filter((m) => m.type === "elective_B");
  const mobility = MODULES.filter((m) => m.type === "mobility");
  const kompl = MODULES.filter((m) => m.type === "komplementfach");
  const fund = MODULES.filter((m) => m.type === "fundamentale");

  const ModuleRow = ({ mod }) => {
    const recSem = Array.isArray(mod.recSem) ? mod.recSem.join("–") : mod.recSem;
    return (
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          background: completed[mod.id] ? COLORS.completedBg : COLORS.card,
          borderRadius: 8,
          border: `1px solid ${completed[mod.id] ? COLORS.completed : COLORS.border}`,
          cursor: "pointer",
          transition: "all 0.15s",
          marginBottom: 6,
        }}
      >
        <input
          type="checkbox"
          checked={!!completed[mod.id]}
          onChange={(e) => setCompleted(mod.id, e.target.checked)}
          style={{ width: 18, height: 18, accentColor: COLORS.accent, flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 600,
            fontSize: 13,
            textDecoration: completed[mod.id] ? "line-through" : "none",
            opacity: completed[mod.id] ? 0.7 : 1,
          }}>
            {mod.id}: {modName(mod)}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
            {sp.semester} {recSem} · {mod.cp} {sp.cp}
          </div>
        </div>
        <div style={{
          fontWeight: 700,
          fontSize: 14,
          color: completed[mod.id] ? COLORS.completed : COLORS.textMuted,
          flexShrink: 0,
        }}>
          {mod.cp}
        </div>
      </label>
    );
  };

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.accentDark, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {title}
      </h3>
      {children}
    </div>
  );

  const TrackSelect = ({ label, value, onChange, fields }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: COLORS.textMuted }}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: 6,
          border: `1px solid ${COLORS.border}`,
          fontSize: 13,
          background: COLORS.card,
          marginBottom: 8,
        }}
      >
        <option value="">{sp.selectField}</option>
        {fields.map((f) => (
          <option key={f} value={f}>{sp.fields[f]}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{sp.title}</h2>

      {/* Progress bar */}
      <div style={{
        background: COLORS.card,
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        border: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {completedCP} <span style={{ fontSize: 16, fontWeight: 500, color: COLORS.textMuted }}>{sp.of} {TOTAL_CP} {sp.cp}</span>
          </div>
          <div style={{ fontSize: 13, color: COLORS.textMuted }}>
            {TOTAL_CP - completedCP} {sp.remaining}
          </div>
        </div>
        <div style={{ background: COLORS.progressTrack, borderRadius: 8, height: 12, overflow: "hidden" }}>
          <div style={{
            width: `${pct}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentDark})`,
            borderRadius: 8,
            transition: "width 0.4s ease",
          }} />
        </div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 6, textAlign: "right" }}>{pct}% {sp.completed.toLowerCase()}</div>
      </div>

      <Section title={sp.compulsory}>
        {compulsory.map((m) => <ModuleRow key={m.id} mod={m} />)}
      </Section>

      <Section title={sp.elective}>
        <TrackSelect label={sp.trackA} value={trackA} onChange={setTrackA} fields={TRACK_A_FIELDS} />
        {electiveA.map((m) => <ModuleRow key={m.id} mod={m} />)}

        <div style={{ height: 12 }} />
        <TrackSelect label={sp.trackB} value={trackB} onChange={setTrackB} fields={TRACK_B_FIELDS} />
        {electiveB.map((m) => <ModuleRow key={m.id} mod={m} />)}
      </Section>

      <Section title="Mobility">
        {mobility.map((m) => <ModuleRow key={m.id} mod={m} />)}
      </Section>

      <Section title={sp.complementary}>
        {kompl.map((m) => <ModuleRow key={m.id} mod={m} />)}
        {fund.map((m) => <ModuleRow key={m.id} mod={m} />)}
      </Section>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
        <ActionBtn label={sp.exportBtn} onClick={onExport} />
        <ActionBtn label={sp.importBtn} onClick={onImport} />
        <ActionBtn label={sp.resetBtn} onClick={onReset} variant="danger" />
      </div>
    </div>
  );
}

function ActionBtn({ label, onClick, variant }) {
  const isDanger = variant === "danger";
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: 8,
        border: `1px solid ${isDanger ? COLORS.error : COLORS.border}`,
        background: isDanger ? COLORS.errorBg : COLORS.card,
        color: isDanger ? COLORS.error : COLORS.text,
        fontWeight: 600,
        fontSize: 13,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

// ─── PLAN SCREEN ─────────────────────────────────────────────────
function PlanScreen({ s, lang, plan, setPlan, completed }) {
  const sp = s.plan;
  const modName = (m) => (lang === "de" ? m.name_de : m.name_en);

  const [dragItem, setDragItem] = useState(null);

  const placedIds = useMemo(() => new Set(plan.flat()), [plan]);
  const unplaced = MODULES.filter((m) => !placedIds.has(m.id));

  const { errors, warnings } = useMemo(() => validatePlan(plan, completed), [plan, completed]);

  const handleDrop = useCallback(
    (semIdx) => {
      if (!dragItem) return;
      const newPlan = plan.map((s, i) => {
        const filtered = s.filter((id) => id !== dragItem);
        if (i === semIdx && !s.includes(dragItem)) return [...filtered, dragItem];
        return filtered;
      });
      setPlan(newPlan);
      setDragItem(null);
    },
    [dragItem, plan, setPlan]
  );

  const removeFromPlan = (modId) => {
    setPlan(plan.map((s) => s.filter((id) => id !== modId)));
  };

  const autoFill = () => {
    const newPlan = [[], [], [], [], [], []];
    MODULES.forEach((m) => {
      const sem = Array.isArray(m.recSem) ? m.recSem[0] : m.recSem;
      if (sem >= 1 && sem <= 6) newPlan[sem - 1].push(m.id);
    });
    setPlan(newPlan);
  };

  const SemesterSlot = ({ semIdx }) => {
    const mods = plan[semIdx] || [];
    const semCP = mods.reduce((s, id) => {
      const m = MODULES.find((x) => x.id === id);
      return s + (m ? m.cp : 0);
    }, 0);
    const isMobility = semIdx === 4;
    const hasErrors = errors.some((e) => mods.includes(e.moduleId));

    return (
      <div
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.background = COLORS.accentLight; }}
        onDragLeave={(e) => { e.currentTarget.style.background = COLORS.card; }}
        onDrop={(e) => { e.preventDefault(); e.currentTarget.style.background = COLORS.card; handleDrop(semIdx); }}
        style={{
          background: COLORS.card,
          borderRadius: 10,
          border: `1px solid ${hasErrors ? COLORS.error : COLORS.border}`,
          padding: 14,
          marginBottom: 12,
          minHeight: 80,
          transition: "background 0.15s",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: isMobility ? COLORS.mobility : COLORS.text }}>
            {sp.semester} {semIdx + 1}
            {isMobility && <span style={{ fontSize: 11, marginLeft: 6, opacity: 0.7 }}>({sp.mobility})</span>}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted }}>{semCP} {sp.cpLabel}</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {mods.map((modId) => {
            const mod = MODULES.find((m) => m.id === modId);
            if (!mod) return null;
            const hasError = errors.some((e) => e.moduleId === modId);
            return (
              <div
                key={modId}
                draggable
                onDragStart={() => setDragItem(modId)}
                style={{
                  background: hasError ? COLORS.errorBg : COLORS.accentLight,
                  border: `1px solid ${hasError ? COLORS.error : COLORS.accent}`,
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "grab",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  maxWidth: "100%",
                }}
                title={modName(mod)}
              >
                <span>{mod.id}</span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>{mod.cp}CP</span>
                <button
                  onClick={() => removeFromPlan(modId)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    lineHeight: 1,
                    padding: 0,
                    color: COLORS.textMuted,
                  }}
                  aria-label={`Remove ${mod.id}`}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            );
          })}
          {mods.length === 0 && (
            <div style={{ fontSize: 12, color: COLORS.textMuted, fontStyle: "italic", padding: 8 }}>
              Drop modules here
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{sp.title}</h2>
          <p style={{ fontSize: 12, color: COLORS.textMuted, margin: "4px 0 0" }}>{sp.subtitle}</p>
        </div>
        <button
          onClick={autoFill}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            border: `1px solid ${COLORS.accent}`,
            background: COLORS.accentLight,
            color: COLORS.accentDark,
            fontWeight: 600,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Auto-fill recommended
        </button>
      </div>

      {/* Validation results */}
      {(errors.length > 0 || warnings.length > 0) ? (
        <div style={{ marginBottom: 16 }}>
          {errors.length > 0 && (
            <div style={{ background: COLORS.errorBg, borderRadius: 8, padding: 12, marginBottom: 8, border: `1px solid ${COLORS.error}` }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: COLORS.error, marginBottom: 6 }}>
                ✕ {sp.violations} ({errors.length})
              </div>
              {errors.map((e, i) => (
                <div key={i} style={{ fontSize: 12, marginBottom: 4, color: COLORS.error }}>
                  • {lang === "de" ? e.rule_de : e.rule}
                  <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 4 }}>({e.source_ref})</span>
                </div>
              ))}
            </div>
          )}
          {warnings.length > 0 && (
            <div style={{ background: COLORS.warnBg, borderRadius: 8, padding: 12, border: `1px solid ${COLORS.warn}` }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: COLORS.warn, marginBottom: 6 }}>
                ⚠ {sp.warnings} ({warnings.length})
              </div>
              {warnings.map((w, i) => (
                <div key={i} style={{ fontSize: 12, marginBottom: 4, color: "#8B6E00" }}>
                  • {lang === "de" ? w.rule_de : w.rule}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : plan.flat().length > 0 ? (
        <div style={{ background: COLORS.completedBg, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, fontWeight: 600, color: COLORS.completed, border: `1px solid ${COLORS.completed}` }}>
          {sp.noIssues}
        </div>
      ) : null}

      {/* Semester slots */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <SemesterSlot key={i} semIdx={i} />
      ))}

      {/* Unplaced */}
      {unplaced.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.textMuted, marginBottom: 8 }}>
            {sp.unplaced} ({unplaced.length})
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {unplaced.map((mod) => (
              <div
                key={mod.id}
                draggable
                onDragStart={() => setDragItem(mod.id)}
                style={{
                  background: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "grab",
                }}
                title={`${modName(mod)} – ${sp.recommended}: ${Array.isArray(mod.recSem) ? mod.recSem.join("–") : mod.recSem}`}
              >
                {mod.id} <span style={{ fontSize: 10, opacity: 0.6 }}>{mod.cp}CP</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ASK SCREEN ──────────────────────────────────────────────────
function AskScreen({ s, lang }) {
  const sa = s.ask;
  const [path, setPath] = useState(["root"]);
  const currentKey = path[path.length - 1];
  const node = ASK_TREE[currentKey];

  const goTo = (key) => setPath([...path, key]);
  const goBack = () => setPath(path.slice(0, -1));
  const restart = () => setPath(["root"]);

  if (!node) return <div>Error: node not found</div>;

  const isAnswer = !!node.answer_en;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{sa.title}</h2>
      <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>{sa.subtitle}</p>

      {/* Breadcrumb */}
      {path.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            onClick={goBack}
            style={{
              background: "none",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              color: COLORS.accent,
            }}
          >
            {sa.back}
          </button>
          <button
            onClick={restart}
            style={{
              background: "none",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              color: COLORS.textMuted,
            }}
          >
            {sa.restart}
          </button>
        </div>
      )}

      {isAnswer ? (
        // Answer card
        <div style={{
          background: COLORS.card,
          borderRadius: 12,
          border: `1px solid ${COLORS.accent}`,
          padding: 20,
          boxShadow: "0 2px 8px rgba(0,103,71,0.08)",
        }}>
          <div
            style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}
            dangerouslySetInnerHTML={{
              __html: (lang === "de" ? node.answer_de : node.answer_en).replace(
                /\*\*(.*?)\*\*/g,
                `<strong style="color:${COLORS.accentDark}">$1</strong>`
              ),
            }}
          />
          <div style={{
            background: COLORS.accentLight,
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, marginBottom: 4, textTransform: "uppercase" }}>
              {sa.contact}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.accentDark }}>
              {lang === "de" ? node.contact_de : node.contact_en}
            </div>
          </div>
          {node.url && (
            <a
              href={node.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                color: COLORS.accent,
                fontWeight: 600,
                fontSize: 13,
                textDecoration: "underline",
              }}
            >
              {sa.moreInfo}
            </a>
          )}
        </div>
      ) : (
        // Question with options
        <div>
          <div style={{
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 14,
            color: COLORS.text,
          }}>
            {lang === "de" ? node.question_de : node.question_en}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {node.options.map((opt) => (
              <button
                key={opt.next}
                onClick={() => goTo(opt.next)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "14px 16px",
                  background: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  color: COLORS.text,
                  transition: "all 0.15s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = COLORS.accent;
                  e.currentTarget.style.background = COLORS.accentLight;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = COLORS.border;
                  e.currentTarget.style.background = COLORS.card;
                }}
              >
                {lang === "de" ? opt.label_de : opt.label_en}
                <span style={{ float: "right", color: COLORS.textMuted }}>→</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
