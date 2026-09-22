const fs = require('fs/promises');

const UploadHistory = require('../models/UploadHistory');
const Student = require('../models/Student');
const { runPythonPipeline } = require('../services/pythonRunner');

const databaseReady = () => UploadHistory.db?.readyState === 1;

const parseSlotNumber = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

const markHistoryFailed = async (historyEntry, error) => {
  if (!historyEntry) return;
  historyEntry.status = 'FAILED';
  historyEntry.errorMessage = error.message;
  await historyEntry.save();
};

/** Store the raw file, process it with Pandas, and persist the cleaned view. */
const uploadDojoFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded. Please select a CSV, XLS, or XLSX file.'
    });
  }

  if (!databaseReady()) {
    // Multer writes before the controller is reached. Do not retain an
    // untracked upload when its history/audit record cannot be stored.
    await fs.unlink(req.file.path).catch(() => undefined);
    return res.status(503).json({
      success: false,
      message: 'MongoDB is unavailable. Start MongoDB before uploading Dojo data.'
    });
  }

  const slotNumber = parseSlotNumber(req.body.slotNumber);
  let historyEntry;

  try {
    historyEntry = await UploadHistory.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      slotNumber,
      uploadedBy: {
        id: req.mentor.id,
        name: req.mentor.name,
        email: req.mentor.email
      },
      status: 'PROCESSING'
    });

    let cleanedData;
    try {
      cleanedData = await runPythonPipeline(req.file.path, slotNumber);
    } catch (error) {
      await markHistoryFailed(historyEntry, error);
      return res.status(422).json({
        success: false,
        message: `The file was stored, but Pandas could not clean it: ${error.message}`,
        historyId: historyEntry._id
      });
    }

    for (const student of cleanedData.cleanedStudents || []) {
      await Student.findOneAndUpdate(
        { studentId: student.studentId },
        {
          $set: {
            studentId: student.studentId,
            email: student.email || student.studentId,
            name: student.name,
            batch: student.batch,
            mentorName: req.mentor.name,
            verifiedBelts: student.verifiedBelts,
            currentBeltLevel: student.currentBeltLevel,
            totalBeltsEarned: student.totalBeltsEarned,
            totalSlotsAttempted: student.totalSlotsAttempted,
            improvementStatus: student.improvementStatus,
            languagesAttempted: student.languagesAttempted,
            sameDayProgress: student.sameDayProgress
          }
        },
        { upsert: true, new: true, runValidators: true }
      );
    }

    historyEntry.status = 'COMPLETED';
    historyEntry.rowsProcessed = cleanedData.summary?.totalSlotsEvaluated || 0;
    historyEntry.summary = cleanedData.summary || {};
    await historyEntry.save();

    return res.status(201).json({
      success: true,
      message: 'Dojo file stored, cleaned with Pandas, and added to the dashboard.',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      },
      summary: cleanedData.summary,
      historyId: historyEntry._id
    });
  } catch (error) {
    await markHistoryFailed(historyEntry, error).catch(() => undefined);
    return res.status(500).json({
      success: false,
      message: `File processing error: ${error.message}`
    });
  }
};

/** Return the audit trail for every stored mentor upload. */
const getUploadHistory = async (req, res) => {
  try {
    if (!databaseReady()) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is unavailable. Upload history cannot be loaded.'
      });
    }

    const history = await UploadHistory.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, history });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to fetch upload history: ${error.message}`
    });
  }
};

module.exports = { uploadDojoFile, getUploadHistory };
