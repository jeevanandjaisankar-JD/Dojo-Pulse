const Student = require('../models/Student');
const { BASE_LANGUAGES, buildAnalytics } = require('../services/analyticsService');

/** Return live improvement, language, and historical-period analytics. */
const getImprovementsAnalytics = async (req, res) => {
  try {
    if (Student.db?.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is unavailable. Improvement analytics cannot be loaded yet.'
      });
    }
    const students = await Student.find({}).lean();
    const analytics = buildAnalytics(students);

    return res.status(200).json({
      success: true,
      data: {
        totalStudents: analytics.totalStudents,
        improvedCount: analytics.improvedCount,
        notImprovedCount: analytics.notImprovedCount,
        improvementRate: analytics.improvementRate,
        totalSlotsHappened: analytics.totalSlotsHappened,
        totalBeltsEarned: analytics.totalBeltsEarned,
        languages: analytics.languages,
        progressHappened: {
          beltsEarned: analytics.totalBeltsEarned,
          netGainText: `+${analytics.totalBeltsEarned} belts earned across the cohort`,
          cohortPassRate: `${analytics.improvementRate}% of students advanced a belt level`,
          fourLanguagesTrained: BASE_LANGUAGES
        },
        timelineProgress: analytics.timelineProgress
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to fetch improvement analytics: ${error.message}`
    });
  }
};

module.exports = { getImprovementsAnalytics };
