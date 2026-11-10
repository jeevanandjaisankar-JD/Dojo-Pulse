const BASE_LANGUAGES = ['Python', 'Node.js', 'Java', 'C++'];

const LANGUAGE_FIELDS = {
  Python: 'python',
  'Node.js': 'nodejs',
  Java: 'java',
  'C++': 'cpp'
};

const createLanguageStats = () => Object.fromEntries(
  BASE_LANGUAGES.map((language) => [language, {
    slots: 0,
    beltsEarned: 0,
    improvedStudents: 0
  }])
);

const formatPeriod = (period) => new Intl.DateTimeFormat('en', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC'
}).format(new Date(`${period}-01T00:00:00.000Z`));

const toLevel = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Use the canonical raw belt-test collection to calculate latest-test
 * improvement. A record with no valid timestamp is not eligible to become
 * the latest test, matching the Python processor's selection rules.
 */
const buildLatestTestResults = (records = []) => {
  const latestByEmail = new Map();

  for (const record of records) {
    const email = String(record.email || '').trim().toLowerCase();
    if (!email) continue;

    let studentEntry = latestByEmail.get(email);
    if (!studentEntry) {
      studentEntry = {
        hasCanonicalRecords: true,
        latestTimestamp: null,
        latestRecords: [],
        improvedLanguages: new Set()
      };
      latestByEmail.set(email, studentEntry);
    }

    const timestampValues = [
      record.beltTestUpdatedAt,
      record.calculatedEndTime,
      record.startTime
    ];

    let timestamp = null;
    for (const value of timestampValues) {
      if (value == null || String(value).trim() === '') continue;
      const parsed = Date.parse(String(value));
      if (Number.isFinite(parsed)) {
        timestamp = parsed;
        break;
      }
    }

    if (timestamp === null) continue;

    if (
      studentEntry.latestTimestamp === null ||
      timestamp > studentEntry.latestTimestamp
    ) {
      studentEntry.latestTimestamp = timestamp;
      studentEntry.latestRecords = [record];
    } else if (timestamp === studentEntry.latestTimestamp) {
      studentEntry.latestRecords.push(record);
    }
  }

  for (const entry of latestByEmail.values()) {
    for (const record of entry.latestRecords) {
      const initial = record.initialBeltLevels || {};
      const final = record.finalBeltLevels || {};

      for (const [language, field] of Object.entries(LANGUAGE_FIELDS)) {
        if (toLevel(final[field]) > toLevel(initial[field])) {
          entry.improvedLanguages.add(language);
        }
      }
    }
  }

  return latestByEmail;
};

const buildAnalytics = (students = [], beltTestRecords = []) => {
  const languages = createLanguageStats();
  const activity = [];
  const periods = new Map();
  const latestTestResults = buildLatestTestResults(beltTestRecords);
  const improvedByLanguage = new Map();

  for (const student of students) {
    const studentKey = String(
      student.email || student.studentId || ''
    ).trim().toLowerCase();

    const canonicalResult = latestTestResults.get(studentKey);
    const latestImprovedLanguages = canonicalResult
      ? canonicalResult.improvedLanguages
      : null;

    // Canonical raw records take precedence over cached Student status.
    // Students outside the canonical dataset retain the legacy fallback.
    if (canonicalResult) {
      for (const language of latestImprovedLanguages) {
        if (!improvedByLanguage.has(language)) {
          improvedByLanguage.set(language, new Set());
        }
        improvedByLanguage.get(language).add(String(student.studentId));
      }
    } else {
      for (const day of student.sameDayProgress || []) {
        for (const attempt of day.attempts || []) {
          if (!attempt.isImproved) continue;
          const language = attempt.language || 'Other';
          if (!improvedByLanguage.has(language)) {
            improvedByLanguage.set(language, new Set());
          }
          improvedByLanguage.get(language).add(String(student.studentId));
        }
      }
    }

    for (const day of student.sameDayProgress || []) {
      const period = String(day.date || '').slice(0, 7);

      if (/^\d{4}-\d{2}$/.test(period)) {
        if (!periods.has(period)) {
          periods.set(period, {
            slotsAttempted: 0,
            beltsEarned: 0,
            languages: {}
          });
        }

        const periodStats = periods.get(period);
        periodStats.slotsAttempted += Number(day.totalSlotsAttempted) || 0;
        periodStats.beltsEarned += Number(day.netBeltsEarned) || 0;

        for (const language of day.languages || []) {
          periodStats.languages[language] =
            (periodStats.languages[language] || 0) + 1;
        }
      }

      for (const attempt of day.attempts || []) {
        const language = attempt.language || 'Other';

        if (!languages[language]) {
          languages[language] = {
            slots: 0,
            beltsEarned: 0,
            improvedStudents: 0
          };
        }

        const beltsEarned = Number(attempt.beltsEarned) || 0;
        languages[language].slots += 1;
        languages[language].beltsEarned += beltsEarned;

        const timestamp =
          attempt.timestamp ||
          `${day.date || ''}T00:00:00.000Z`;

        activity.push({
          timestamp,
          date: day.date || timestamp.slice(0, 10),
          student: student.name || student.email || 'Student',
          language,
          status: attempt.isImproved
            ? `Belt Earned (+${beltsEarned})`
            : 'Attempted',
          beltLevel: Number(attempt.beltLevel) || 0
        });
      }
    }
  }

  for (const [language, studentIds] of improvedByLanguage.entries()) {
    if (!languages[language]) {
      languages[language] = {
        slots: 0,
        beltsEarned: 0,
        improvedStudents: 0
      };
    }
    languages[language].improvedStudents = studentIds.size;
  }

  const totalStudents = students.length;
  const improvedCount = students.filter((student) => {
    const key = String(
      student.email || student.studentId || ''
    ).trim().toLowerCase();
    const canonicalResult = latestTestResults.get(key);

    if (canonicalResult) {
      return canonicalResult.improvedLanguages.size > 0;
    }

    return String(student.improvementStatus || '').toUpperCase() === 'IMPROVED';
  }).length;

  const notImprovedCount = totalStudents - improvedCount;

  const totalSlotsHappened = Object.values(languages).reduce(
    (total, item) => total + item.slots,
    0
  );

  const totalBeltsEarned = Object.values(languages).reduce(
    (total, item) => total + item.beltsEarned,
    0
  );

  const timelineProgress = [...periods.entries()]
    .sort(([first], [second]) => second.localeCompare(first))
    .slice(0, 6)
    .map(([period, item]) => {
      const topLanguage = Object.entries(item.languages)
        .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)[0]?.[0] || '—';

      return {
        period: formatPeriod(period),
        slotsAttempted: item.slotsAttempted,
        beltsEarned: item.beltsEarned,
        topLanguage
      };
    });

  return {
    totalStudents,
    improvedCount,
    notImprovedCount,
    improvementRate: Number(
      ((improvedCount / Math.max(totalStudents, 1)) * 100).toFixed(1)
    ),
    totalSlotsHappened,
    totalBeltsEarned,
    languages,
    recentActivity: activity
      .sort((first, second) =>
        new Date(second.timestamp) - new Date(first.timestamp)
      )
      .slice(0, 8),
    timelineProgress
  };
};

module.exports = {
  BASE_LANGUAGES,
  buildAnalytics,
  buildLatestTestResults
};
