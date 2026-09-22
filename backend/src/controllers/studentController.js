const mongoose = require('mongoose');
const Student = require('../models/Student');

const ALLOWED_SORT_FIELDS = new Set([
  'name',
  'batch',
  'currentBeltLevel',
  'totalBeltsEarned',
  'totalSlotsAttempted',
  'improvementStatus'
]);

/** List students with server-side search, status filter, and safe sorting. */
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

    const filter = {};
    const trimmedSearch = String(search).trim();
    if (trimmedSearch) {
      const safeSearch = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
        { batch: { $regex: safeSearch, $options: 'i' } }
      ];
    }
    if (status === 'IMPROVED' || status === 'NO_IMPROVEMENT') {
      filter.improvementStatus = status;
    }

    const sortField = ALLOWED_SORT_FIELDS.has(sort) ? sort : 'currentBeltLevel';
    const sortDirection = order === 'asc' ? 1 : -1;
    const students = await Student.find(filter).sort({ [sortField]: sortDirection, name: 1 }).lean();

    return res.status(200).json({ success: true, total: students.length, students });
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
