const User = require('../models/User');
const Activity = require('../models/Activity');
const DailyLog = require('../models/DailyLog');
const { Op } = require('sequelize');

// Search users by name or email
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query must be at least 2 characters' 
      });
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } }
        ],
        isPublic: true,
        id: { [Op.ne]: req.user.id } // Exclude current user
      },
      attributes: ['id', 'name', 'email', 'isPublic', 'createdAt'],
      limit: 20
    });

    res.json({ success: true, users });
  } catch (error) {
    console.error('Search users error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get user profile with their progress
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'isPublic', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.isPublic) {
      return res.status(403).json({ success: false, message: 'User profile is private' });
    }

    // Get user's activities
    const activities = await Activity.findAll({
      where: { userId: user.id },
      attributes: ['id', 'name', 'icon']
    });

    // Get user's daily logs for current month
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const logs = await DailyLog.findAll({
      where: {
        userId: user.id,
        date: {
          [Op.between]: [
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
          ]
        }
      },
      attributes: ['activityId', 'date', 'completed']
    });

    // Calculate monthly progress
    const totalDays = endDate.getDate();
    const completedDays = [];
    const dayLogs = {};

    for (let i = 1; i <= totalDays; i++) {
      const dateObj = new Date(today.getFullYear(), today.getMonth(), i);
      const dateStr = dateObj.toISOString().split('T')[0];
      const dayLogsForDate = logs.filter(log => log.date === dateStr);
      const completed = dayLogsForDate.filter(log => log.completed).length;
      const total = activities.length || 10;
      dayLogs[i] = { completed, total, date: dateStr };
      if (completed === total && total > 0) {
        completedDays.push(i);
      }
    }

    // Calculate weekly progress
    const weeks = [];
    for (let w = 0; w < 5; w++) {
      const start = w * 7 + 1;
      const end = Math.min((w + 1) * 7, totalDays);
      let weekCompleted = 0;
      for (let d = start; d <= end; d++) {
        if (completedDays.includes(d)) weekCompleted++;
      }
      weeks.push({
        week: w + 1,
        days: `${start}–${end}`,
        completed: weekCompleted,
        total: end - start + 1
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        joinedAt: user.createdAt
      },
      activities,
      progress: {
        monthly: {
          totalDays,
          completedDays: completedDays.length,
          completionRate: Math.round((completedDays.length / totalDays) * 100)
        },
        weeks,
        dayLogs
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};