
const fs = require('fs/promises');

const UploadHistory = require('../models/UploadHistory');
const Student = require('../models/Student');
const BeltTestRecord = require('../models/BeltTestRecord');

const {
  runPythonPipeline,
  runPythonAggregation
} = require('../services/pythonRunner');

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

const saveStudents = async (
  students,
  mentorName,
  preserveMentor = false
) => {
  for (const student of students || []) {
    const fields = {
      studentId: student.studentId,
      email: student.email || student.studentId,
      name: student.name,
      batch: student.batch,
      verifiedBelts: student.verifiedBelts,
      currentBeltLevel: student.currentBeltLevel,
      totalBeltsEarned: student.totalBeltsEarned,
      totalSlotsAttempted: student.totalSlotsAttempted,
      improvementStatus: student.improvementStatus,
      languagesAttempted: student.languagesAttempted,
      sameDayProgress: student.sameDayProgress
    };

    if (!preserveMentor) {
      fields.mentorName = mentorName;
    }

    await Student.findOneAndUpdate(
      { studentId: student.studentId },
      {
        $set: fields,
        ...(preserveMentor
          ? { $setOnInsert: { mentorName } }
          : {})
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );
  }
};

/**
 * Store the uploaded file, process it, and persist dashboard data.
 */
const uploadDojoFile = async (req, res) => {
  // Support both legacy Mentor authentication and User authentication.
  const uploader = req.mentor || req.user;

  if (!uploader) {
    return res.status(401).json({
      success: false,
      message: 'Authenticated mentor information is missing.'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded. Please select a CSV, XLS, or XLSX file.'
    });
  }

  if (!databaseReady()) {
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
        id: String(uploader.id || ''),
        name: uploader.name || '',
        email: uploader.email || ''
      },
      status: 'PROCESSING'
    });

    let cleanedData;

    try {
      cleanedData = await runPythonPipeline(
        req.file.path,
        slotNumber
      );
    } catch (error) {
      await markHistoryFailed(historyEntry, error);

      return res.status(422).json({
        success: false,
        message: `The file was stored, but Pandas could not process it: ${error.message}`,
        historyId: historyEntry._id
      });
    }

    // New belt-test CSV: persist canonical raw records and rebuild
    // dashboard data from every record currently stored in MongoDB.
    if (Array.isArray(cleanedData.records)) {
      const records = cleanedData.records;

      if (records.length === 0) {
        throw new Error('The belt-test CSV contains no records.');
      }

      const operations = records.map((record) => ({
        updateOne: {
          filter: { testId: record.testId },
          update: {
            $set: {
              testId: record.testId,
              startTime: record.startTime || '',
              calculatedEndTime: record.calculatedEndTime || '',
              beltTestUpdatedAt: record.beltTestUpdatedAt || '',
              studentName: record.studentName,
              email: record.email,
              squadNumber: record.squadNumber || '',
              initialBeltLevels: record.initialBeltLevels,
              finalBeltLevels: record.finalBeltLevels,
              uploadedBy: {
                id: String(uploader.id || ''),
                name: uploader.name || '',
                email: uploader.email || ''
              },
              sourceFilename:
                record.sourceFilename || req.file.originalname
            }
          },
          upsert: true
        }
      }));

      await BeltTestRecord.bulkWrite(
        operations,
        { ordered: false }
      );

      const allRecords = await BeltTestRecord.find({}).lean();

      cleanedData = await runPythonAggregation(allRecords);

      // Reconcile students only within the squads represented in
      // the canonical belt-test dataset. Preserve unrelated students.
      const canonicalStudents = cleanedData.cleanedStudents || [];

      if (canonicalStudents.length > 0) {
        const canonicalStudentIds = canonicalStudents.map(
          (student) => student.studentId
        );

        const canonicalBatches = [
          ...new Set(
            canonicalStudents
              .map((student) => student.batch)
              .filter(Boolean)
          )
        ];

        if (canonicalBatches.length > 0) {
          await Student.deleteMany({
            batch: { $in: canonicalBatches },
            studentId: { $nin: canonicalStudentIds }
          });
        }

        // Upsert canonical students without overwriting
        // existing mentor assignments.
        await saveStudents(
          canonicalStudents,
          uploader.name || '',
          true
        );
      }
    } else {
      // Existing CSV/XLS/XLSX upload behavior remains unchanged.
      await saveStudents(
        cleanedData.cleanedStudents,
        uploader.name || '',
        false
      );
    }

    historyEntry.status = 'COMPLETED';
    historyEntry.rowsProcessed =
      cleanedData.summary?.totalSlotsEvaluated || 0;
    historyEntry.summary = cleanedData.summary || {};

    await historyEntry.save();

    return res.status(201).json({
      success: true,
      message: 'Dojo file stored, processed, and added to the dashboard.',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      },
      summary: cleanedData.summary,
      historyId: historyEntry._id
    });
  } catch (error) {
    await markHistoryFailed(historyEntry, error).catch(
      () => undefined
    );

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

    const history = await UploadHistory.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to fetch upload history: ${error.message}`
    });
  }
};

/** Delete upload history and its uploaded file, not canonical test records. */
const deleteUploadHistory = async (req, res) => {
  try {
    if (!databaseReady()) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is unavailable. Upload history cannot be deleted.'
      });
    }

    const historyEntry = await UploadHistory.findById(req.params.id);

    if (!historyEntry) {
      return res.status(404).json({
        success: false,
        message: 'Upload history entry not found.'
      });
    }

    await UploadHistory.deleteOne({
      _id: historyEntry._id
    });

    if (historyEntry.filePath) {
      await fs.unlink(historyEntry.filePath).catch(
        () => undefined
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Upload history entry deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to delete upload history: ${error.message}`
    });
  }
};

module.exports = {
  uploadDojoFile,
  getUploadHistory,
  deleteUploadHistory
};
