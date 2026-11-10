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

const BELT_LANGUAGE_FIELDS = { Python: 'python', 'Node.js': 'nodejs', Java: 'java', 'C++': 'cpp' };

const buildUniqueBeltHistory = (student, records) => {
  const history = new Map();
  const email = normalizeEmail(student.email);
  records.filter((record) => normalizeEmail(record.email) === email).forEach((record) => {
    const initial = record.initialBeltLevels || {};
    const final = record.finalBeltLevels || {};
    for (const [language, field] of Object.entries(BELT_LANGUAGE_FIELDS)) {
      const from = Number(initial[field]) || 0;
      const to = Number(final[field]) || 0;
      for (let level = from + 1; level <= to; level += 1) {
        history.set(language + ':' + level, { language, level });
      }
    }
  });
  if (history.size === 0) {
    (student.sameDayProgress || []).forEach((day) => (day.attempts || []).forEach((attempt) => {
      const from = Number(attempt.verifiedBelts) || 0;
      const to = Number(attempt.beltLevel) || 0;
      const language = attempt.language || 'Other';
      for (let level = from + 1; level <= to; level += 1) history.set(language + ':' + level, { language, level });
    }));
  }
  return [...history.values()].sort((a, b) =>
    (Object.keys(BELT_LANGUAGE_FIELDS).indexOf(a.language) - Object.keys(BELT_LANGUAGE_FIELDS).indexOf(b.language)) || a.level - b.level
  );
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

    let students = studentDocs.map((student) => {
      const beltHistory = buildUniqueBeltHistory(student, beltTestRecords);
      return { ...student, beltHistory, totalUniqueBelts: beltHistory.length, improvementStatus: getLatestTestStatus(student, latestTestResults) };
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

    const beltTestRecords = await BeltTestRecord.find({ email: normalizeEmail(student.email) }).sort({ createdAt: 1 }).lean();
    const beltHistory = buildUniqueBeltHistory(student, beltTestRecords);
    const latestRecord = beltTestRecords[beltTestRecords.length - 1];
    const squadNumber = latestRecord?.squadNumber || '';
    const studentDetails = {
      ...student,
      name: student.name || latestRecord?.studentName || '',
      squadNumber,
      batch: squadNumber ? 'Squad ' + squadNumber : (student.batch || ''),
      beltHistory,
      totalUniqueBelts: beltHistory.length
    };
    return res.status(200).json({ success: true, student: studentDetails });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to fetch student: ${error.message}`
    });
  }
};

module.exports = { getStudents, getStudentById };
