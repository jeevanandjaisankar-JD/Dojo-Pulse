const Student = require('../models/Student');
const { buildAnalytics } = require('../services/analyticsService');

/** Return live cohort-level metrics for the dashboard. */
const getDashboardStats = async (req, res) => {
  try {
    if (Student.db?.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is unavailable. Dashboard analytics cannot be loaded yet.'
      });
    }
    const students = await Student.find({}).lean();
    const analytics = buildAnalytics(students);

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents: analytics.totalStudents,
        improvedStudents: analytics.improvedCount,
        notImprovedStudents: analytics.notImprovedCount,
        improvementRate: analytics.improvementRate,
        totalBeltsEarned: analytics.totalBeltsEarned,
        totalSlotsHappened: analytics.totalSlotsHappened,
        activeLanguagesCount: Object.values(analytics.languages)
          .filter((language) => language.slots > 0).length,
        languages: analytics.languages,
        recentActivity: analytics.recentActivity
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to fetch dashboard stats: ${error.message}`
    });
  }
};

module.exports = { getDashboardStats };
