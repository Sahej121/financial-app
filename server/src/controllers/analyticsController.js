const { User, Document, Meeting } = require('../models');
const { Op } = require('sequelize');

// Get user analytics summary
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period } = req.query; // 'month', 'quarter', 'year'
    
    // Calculate date range based on period
    let startDate = new Date();
    switch (period) {
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default: // month
        startDate.setMonth(startDate.getMonth() - 1);
    }
    
    // Get document counts by status
    const documentStats = await Document.count({
      where: { 
        userId,
        uploadedAt: { [Op.gte]: startDate }
      },
      group: ['status'],
      raw: true
    });
    
    // Get meeting counts by status
    const meetingStats = await Meeting.count({
      where: { 
        clientId: userId,
        createdAt: { [Op.gte]: startDate }
      },
      group: ['status'],
      raw: true
    });
    
    // Get total counts
    const totalDocuments = await Document.count({
      where: { userId }
    });
    
    const totalMeetings = await Meeting.count({
      where: { clientId: userId }
    });
    
    const completedMeetings = await Meeting.count({
      where: { 
        clientId: userId,
        status: 'completed'
      }
    });
    
    const upcomingMeetings = await Meeting.count({
      where: { 
        clientId: userId,
        status: { [Op.in]: ['scheduled', 'confirmed'] },
        startsAt: { [Op.gt]: new Date() }
      }
    });
    
    // Get recent activity
    const recentDocuments = await Document.findAll({
      where: { userId },
      order: [['uploadedAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'fileName', 'status', 'uploadedAt', 'category']
    });
    
    const recentMeetings = await Meeting.findAll({
      where: { clientId: userId },
      order: [['startsAt', 'DESC']],
      limit: 5,
      include: [{
        model: User,
        as: 'professional',
        attributes: ['name', 'role']
      }],
      attributes: ['id', 'title', 'status', 'startsAt', 'planningType']
    });
    
    res.json({
      success: true,
      summary: {
        totalDocuments,
        totalMeetings,
        completedMeetings,
        upcomingMeetings,
        documentStats: documentStats.reduce((acc, stat) => {
          acc[stat.status] = stat.count;
          return acc;
        }, {}),
        meetingStats: meetingStats.reduce((acc, stat) => {
          acc[stat.status] = stat.count;
          return acc;
        }, {}),
        period,
        dateRange: {
          start: startDate,
          end: new Date()
        }
      },
      recentActivity: {
        documents: recentDocuments,
        meetings: recentMeetings
      }
    });
  } catch (error) {
    console.error('Get analytics summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics summary'
    });
  }
};

// Get chart data for dashboard visualizations
exports.getChartData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, period } = req.query; // type: 'documents', 'meetings', 'activity'
    
    // Calculate date range
    let startDate = new Date();
    let dateFormat = '%Y-%m'; // Default to monthly
    
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        dateFormat = '%Y-%m-%d';
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        dateFormat = '%Y-%m';
        break;
      default: // month
        startDate.setMonth(startDate.getMonth() - 1);
        dateFormat = '%Y-%m-%d';
    }
    
    let chartData = {};
    
    switch (type) {
      case 'documents':
        // Document upload trends
        const documentTrends = await Document.findAll({
          where: {
            userId,
            uploadedAt: { [Op.gte]: startDate }
          },
          attributes: [
            [sequelize.fn('DATE', sequelize.col('uploadedAt')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            'category'
          ],
          group: [sequelize.fn('DATE', sequelize.col('uploadedAt')), 'category'],
          order: [[sequelize.fn('DATE', sequelize.col('uploadedAt')), 'ASC']],
          raw: true
        });
        
        // Document status distribution
        const documentStatusData = await Document.count({
          where: { userId },
          group: ['status'],
          raw: true
        });
        
        chartData = {
          trends: documentTrends,
          statusDistribution: documentStatusData,
          categories: await Document.count({
            where: { userId },
            group: ['category'],
            raw: true
          })
        };
        break;
        
      case 'meetings':
        // Meeting trends over time
        const meetingTrends = await Meeting.findAll({
          where: {
            clientId: userId,
            startsAt: { [Op.gte]: startDate }
          },
          attributes: [
            [sequelize.fn('DATE', sequelize.col('startsAt')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            'status'
          ],
          group: [sequelize.fn('DATE', sequelize.col('startsAt')), 'status'],
          order: [[sequelize.fn('DATE', sequelize.col('startsAt')), 'ASC']],
          raw: true
        });
        
        chartData = {
          trends: meetingTrends,
          byProfessionalRole: await Meeting.count({
            where: { clientId: userId },
            group: ['professionalRole'],
            raw: true
          }),
          byPlanningType: await Meeting.count({
            where: { clientId: userId },
            group: ['planningType'],
            raw: true
          })
        };
        break;
        
      case 'activity':
        // Combined activity overview
        const documentActivity = await Document.count({
          where: {
            userId,
            uploadedAt: { [Op.gte]: startDate }
          },
          group: [sequelize.fn('DATE', sequelize.col('uploadedAt'))],
          attributes: [
            [sequelize.fn('DATE', sequelize.col('uploadedAt')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'documents']
          ],
          raw: true
        });
        
        const meetingActivity = await Meeting.count({
          where: {
            clientId: userId,
            startsAt: { [Op.gte]: startDate }
          },
          group: [sequelize.fn('DATE', sequelize.col('startsAt'))],
          attributes: [
            [sequelize.fn('DATE', sequelize.col('startsAt')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'meetings']
          ],
          raw: true
        });
        
        chartData = {
          documentActivity,
          meetingActivity,
          combined: this.combineActivityData(documentActivity, meetingActivity)
        };
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid chart type. Use: documents, meetings, or activity'
        });
    }
    
    res.json({
      success: true,
      chartData,
      type,
      period,
      dateRange: {
        start: startDate,
        end: new Date()
      }
    });
  } catch (error) {
    console.error('Get chart data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chart data'
    });
  }
};

// Get business insights and recommendations
exports.getBusinessInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's document and meeting history for insights
    const totalDocuments = await Document.count({ where: { userId } });
    const reviewedDocuments = await Document.count({ 
      where: { userId, status: { [Op.in]: ['approved', 'reviewed'] } } 
    });
    
    const totalMeetings = await Meeting.count({ where: { clientId: userId } });
    const completedMeetings = await Meeting.count({ 
      where: { clientId: userId, status: 'completed' } 
    });
    
    // Get most used document categories
    const documentCategories = await Document.findAll({
      where: { userId },
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 3,
      raw: true
    });
    
    // Get preferred professional types
    const professionalPreferences = await Meeting.findAll({
      where: { clientId: userId },
      attributes: [
        'professionalRole',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['professionalRole'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      raw: true
    });
    
    // Generate insights based on data
    const insights = [];
    const recommendations = [];
    
    if (totalDocuments > 0) {
      const reviewRate = (reviewedDocuments / totalDocuments) * 100;
      if (reviewRate > 80) {
        insights.push({
          type: 'positive',
          title: 'Excellent Document Management',
          message: `${reviewRate.toFixed(1)}% of your documents have been reviewed. Great job staying organized!`,
          icon: 'CheckCircleOutlined'
        });
      } else if (reviewRate < 50) {
        insights.push({
          type: 'warning',
          title: 'Pending Document Reviews',
          message: `${(100 - reviewRate).toFixed(1)}% of your documents are still pending review. Consider scheduling a consultation.`,
          icon: 'ExclamationCircleOutlined'
        });
        recommendations.push({
          title: 'Schedule Document Review',
          description: 'Book a session with a CA or Financial Planner to review your pending documents.',
          action: 'schedule_meeting',
          priority: 'high'
        });
      }
    }
    
    if (totalMeetings > 0) {
      const meetingCompletionRate = (completedMeetings / totalMeetings) * 100;
      if (meetingCompletionRate > 90) {
        insights.push({
          type: 'positive',
          title: 'Great Meeting Attendance',
          message: 'You have excellent meeting attendance. This helps ensure better financial planning.',
          icon: 'CalendarOutlined'
        });
      }
    }
    
    if (documentCategories.length > 0) {
      const topCategory = documentCategories[0];
      insights.push({
        type: 'info',
        title: 'Document Pattern Analysis',
        message: `Your most uploaded document type is "${topCategory.category.replace('_', ' ')}" (${topCategory.count} documents).`,
        icon: 'FileTextOutlined'
      });
    }
    
    // Add recommendations based on patterns
    if (professionalPreferences.length > 0) {
      const preferredRole = professionalPreferences[0];
      if (preferredRole.professionalRole === 'ca' && documentCategories.some(cat => cat.category === 'tax_documents')) {
        recommendations.push({
          title: 'Tax Season Preparation',
          description: 'Based on your document uploads and CA consultations, consider scheduling quarterly tax reviews.',
          action: 'schedule_ca_meeting',
          priority: 'medium'
        });
      }
    }
    
    res.json({
      success: true,
      insights,
      recommendations,
      statistics: {
        totalDocuments,
        reviewedDocuments,
        totalMeetings,
        completedMeetings,
        reviewRate: totalDocuments > 0 ? (reviewedDocuments / totalDocuments) * 100 : 0,
        meetingCompletionRate: totalMeetings > 0 ? (completedMeetings / totalMeetings) * 100 : 0
      },
      topCategories: documentCategories,
      professionalPreferences
    });
  } catch (error) {
    console.error('Get business insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch business insights'
    });
  }
};

// Helper function to combine activity data
exports.combineActivityData = (documentActivity, meetingActivity) => {
  const combined = {};
  
  documentActivity.forEach(item => {
    if (!combined[item.date]) combined[item.date] = { documents: 0, meetings: 0 };
    combined[item.date].documents = item.documents;
  });
  
  meetingActivity.forEach(item => {
    if (!combined[item.date]) combined[item.date] = { documents: 0, meetings: 0 };
    combined[item.date].meetings = item.meetings;
  });
  
  return Object.entries(combined).map(([date, data]) => ({
    date,
    ...data,
    total: data.documents + data.meetings
  })).sort((a, b) => new Date(a.date) - new Date(b.date));
};