const mongoose = require('mongoose');
const Student = require('../models/Student');
const BeltTestRecord = require('../models/BeltTestRecord');
const { buildLatestTestResults } = require('../services/analyticsService');

const ALLOWED_SORT_FIELDS = new Set([
  'name',
  'batch',
  'currentBeltLevel',
  'totalBeltsEarned',
  'totalSlotsAttempted',
  'improvementStatus'
]);

const normalizeEmail = (value) =>
  String(value || '').trim().toLowerCase();

const normalizeStatus = (value) =>
  String(value || '')
    .trim()
    .toUpperCase()
    .replaceAll(' ', '_')
    .replaceAll('-', '_');

const getLatestTestStatus = (student, latestTestResults) => {
  const email = normalizeEmail(student.email);
  const latestTest = latestTestResults.get(email);

  // If canonical test records exist for this student, they are the source
  // of truth. This intentionally overrides a potentially stale Student field.
  if (latestTest) {
    return latestTest.improvedLanguages.size > 0
      ? 'IMPROVED'
      : 'NO_IMPROVEMENT';
  }

  // Preserve compatibility for students created before canonical
  // BeltTestRecord storage was introduced.
  return normalizeStatus(student.improvementStatus) === 'IMPROVED'
    ? 'IMPROVED'
    : 'NO_IMPROVEMENT';
};

const compareValues = (first, second) => {
  if (typeof first === 'number' && typeof second === 'number') {
    return first - second;
  }

  return String(first ?? '').localeCompare(
    String(second ?? ''),
    undefined,
    { numeric: true, sensitivity: 'base' }
  );
};

/** List students with latest-test status, search, filtering, and sorting. */
const getStudents = async (req, res) => {
  try {
    if (Student.db?.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is unavailable. Student records cannot be loaded yet.'
      });
    }

    const {
      search = '',
      sort = 'currentBeltLevel',
      order = 'desc',
      status = 'ALL'
    } = req.query;

    const trimmedSearch = String(search).trim();

    // Status is derived from canonical test records, so load the student
    // cohort and records together before applying search and status filters.
    const [studentDocs, beltTestRecords] = await Promise.all([
      Student.find({}).lean(),
      BeltTestRecord.find({}).lean()
    ]);

    const latestTestResults = buildLatestTestResults(beltTestRecords);

    // Rebuild the unique belt history from canonical raw test records.
    // The key is language + level, preventing duplicate CSV uploads or
    // repeated test rows from counting the same earned belt twice.
    const beltHistoryByEmail = new Map();
    const languageFields = {
      Python: 'python',
      'Node.js': 'nodejs',
      Java: 'java',
      'C++': 'cpp'
    };

    for (const record of beltTestRecords) {
      const email = normalizeEmail(record.email);
      if (!email) continue;
      if (!beltHistoryByEmail.has(email)) {
        beltHistoryByEmail.set(email, new Map());
      }
      const history = beltHistoryByEmail.get(email);
      const initial = record.initialBeltLevels || {};
      const final = record.finalBeltLevels || {};

      for (const [language, field] of Object.entries(languageFields)) {
        const initialLevel = Number(initial[field]) || 0;
        const finalLevel = Number(final[field]) || 0;
        for (let level = initialLevel + 1; level <= finalLevel; level += 1) {
          history.set(`${language}:${level}`, { language, level });
        }
      }
    }

    let students = studentDocs.map((student) => {
      const canonicalHistory = beltHistoryByEmail.get(normalizeEmail(student.email));
      const historySource = canonicalHistory
        ? [...canonicalHistory.values()]
        : (student.sameDayProgress || []).flatMap((day) =>
          (day.attempts || []).flatMap((attempt) => {
            const initialLevel = Number(attempt.verifiedBelts) || 0;
            const finalLevel = Number(attempt.beltLevel) || 0;
            return Array.from(
              { length: Math.max(0, finalLevel - initialLevel) },
              (_, index) => ({
                language: attempt.language || 'Other',
                level: initialLevel + index + 1
              })
            );
          })
        );

      const uniqueHistory = new Map(
        historySource.map((entry) => [
          `${entry.language}:${entry.level}`,
          entry
        ])
      );
      const beltHistory = [...uniqueHistory.values()].sort((first, second) =>
        Object.keys(languageFields).indexOf(first.language) -
          Object.keys(languageFields).indexOf(second.language) ||
        first.level - second.level
      );

      return {
        ...student,
        beltHistory,
        totalUniqueBelts: beltHistory.length,
        improvementStatus: getLatestTestStatus(student, latestTestResults)
      };
    });

    if (trimmedSearch) {
      const query = trimmedSearch.toLowerCase();
      students = students.filter((student) =>
        [student.name, student.email, student.batch].some((value) =>
          String(value || '').toLowerCase().includes(query)
        )
      );
    }

    const requestedStatus = normalizeStatus(status);
    if (requestedStatus === 'IMPROVED') {
      students = students.filter(
        (student) => student.improvementStatus === 'IMPROVED'
      );
    } else if (
      ['NO_IMPROVEMENT', 'NEEDS_ATTENTION', 'ATTENTION'].includes(requestedStatus)
    ) {
      students = students.filter(
        (student) => student.improvementStatus === 'NO_IMPROVEMENT'
      );
    }

    const sortField = ALLOWED_SORT_FIELDS.has(sort)
      ? sort
      : 'currentBeltLevel';
    const sortDirection = order === 'asc' ? 1 : -1;

    students.sort((first, second) => {
      const primary = compareValues(
        first[sortField],
        second[sortField]
      );

      if (primary !== 0) {
        return primary * sortDirection;
      }

      return compareValues(first.name, second.name);
    });

    return res.status(200).json({
      success: true,
      total: students.length,
      students
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to fetch students: ${error.message}`
    });
  }
};

/** Return one student and their cleaned same-day progression details. */
const getStudentById = async (req, res) => {
  try {
    if (Student.db?.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is unavailable. Student records cannot be loaded yet.'
      });
    }
    const identifier = req.params.id;
    const matches = [{ studentId: identifier }, { email: identifier }];
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      matches.push({ _id: identifier });
    }

    const student = await Student.findOne({ $or: matches }).lean();
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }

    return res.status(200).json({ success: true, student });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to fetch student: ${error.message}`
    });
  }
};

module.exports = { getStudents, getStudentById };
