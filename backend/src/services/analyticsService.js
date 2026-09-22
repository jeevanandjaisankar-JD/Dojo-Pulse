const BASE_LANGUAGES = ['Python', 'Node.js', 'Java', 'C++'];

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

/**
 * Derive every dashboard and improvement metric from persisted student
 * records. Keeping this in one place ensures both pages always agree.
 */
const buildAnalytics = (students = []) => {
  const languages = createLanguageStats();
  const improvedByLanguage = new Map();
  const activity = [];
  const periods = new Map();

  for (const student of students) {
    for (const day of student.sameDayProgress || []) {
      for (const attempt of day.attempts || []) {
        const language = attempt.language || 'Other';
        if (!languages[language]) {
          languages[language] = { slots: 0, beltsEarned: 0, improvedStudents: 0 };
        }

        const beltsEarned = Number(attempt.beltsEarned) || 0;
        languages[language].slots += 1;
        languages[language].beltsEarned += beltsEarned;

        if (attempt.isImproved) {
          if (!improvedByLanguage.has(language)) {
            improvedByLanguage.set(language, new Set());
          }
          improvedByLanguage.get(language).add(String(student.studentId));
        }

        const timestamp = attempt.timestamp || `${day.date || ''}T00:00:00.000Z`;
        activity.push({
          timestamp,
          date: day.date || timestamp.slice(0, 10),
          student: student.name || student.email || 'Student',
          language,
          status: attempt.isImproved ? `Belt Earned (+${beltsEarned})` : 'Attempted',
          beltLevel: Number(attempt.beltLevel) || 0
        });

        const period = (day.date || timestamp).slice(0, 7);
        if (/^\d{4}-\d{2}$/.test(period)) {
          if (!periods.has(period)) {
            periods.set(period, { slotsAttempted: 0, beltsEarned: 0, languages: {} });
          }
          const periodStats = periods.get(period);
          periodStats.slotsAttempted += 1;
          periodStats.beltsEarned += beltsEarned;
          periodStats.languages[language] = (periodStats.languages[language] || 0) + 1;
        }
      }
    }
  }

  for (const [language, studentIds] of improvedByLanguage.entries()) {
    languages[language].improvedStudents = studentIds.size;
  }

  const totalStudents = students.length;
  const improvedCount = students.filter((student) => student.improvementStatus === 'IMPROVED').length;
  const notImprovedCount = totalStudents - improvedCount;
  const totalSlotsHappened = Object.values(languages).reduce((total, item) => total + item.slots, 0);
  const totalBeltsEarned = Object.values(languages).reduce((total, item) => total + item.beltsEarned, 0);

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
    improvementRate: Number(((improvedCount / Math.max(totalStudents, 1)) * 100).toFixed(1)),
    totalSlotsHappened,
    totalBeltsEarned,
    languages,
    recentActivity: activity
      .sort((first, second) => new Date(second.timestamp) - new Date(first.timestamp))
      .slice(0, 8),
    timelineProgress
  };
};

module.exports = { BASE_LANGUAGES, buildAnalytics };
