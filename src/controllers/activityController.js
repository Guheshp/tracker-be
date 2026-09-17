const Activity = require("../models/Activity");
const DailyLog = require("../models/DailyLog");
const { Op } = require("sequelize");

// =====================
// GET ACTIVITIES
// =====================
exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.findAll({
      where: { userId: req.user.id },
      order: [
        ["order", "ASC"],
        ["startTime", "ASC"],
        ["createdAt", "ASC"],
      ],
    });
    res.json({ success: true, activities });
  } catch (error) {
    console.error("Get activities error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =====================
// GET DEFAULT ACTIVITIES
// =====================
exports.getDefaultActivities = async (req, res) => {
  try {
    const defaultActivities = [
      {
        name: "Wake Up Early (Before 7 AM)",
        icon: "🌅",
        startTime: "06:00",
        endTime: "07:00",
        isDefault: true,
      },
      {
        name: "Morning Exercise",
        icon: "🏋️",
        startTime: "07:00",
        endTime: "08:00",
        isDefault: true,
      },
      {
        name: "Healthy Breakfast",
        icon: "🥗",
        startTime: "08:00",
        endTime: "09:00",
        isDefault: true,
      },
      {
        name: "Morning Meditation",
        icon: "🧘",
        startTime: "09:00",
        endTime: "09:30",
        isDefault: true,
      },
      {
        name: "Deep Work / Study",
        icon: "📚",
        startTime: "10:00",
        endTime: "12:00",
        isDefault: true,
      },
      {
        name: "Lunch Break",
        icon: "🍽️",
        startTime: "12:00",
        endTime: "13:00",
        isDefault: true,
      },
      {
        name: "Work / Projects",
        icon: "💼",
        startTime: "13:00",
        endTime: "15:00",
        isDefault: true,
      },
      {
        name: "Afternoon Reading",
        icon: "📖",
        startTime: "15:00",
        endTime: "16:00",
        isDefault: true,
      },
      {
        name: "Evening Exercise",
        icon: "🏃",
        startTime: "17:00",
        endTime: "18:00",
        isDefault: true,
      },
      {
        name: "No Social Media",
        icon: "📱",
        startTime: "18:00",
        endTime: "20:00",
        isDefault: true,
      },
      {
        name: "Dinner Time",
        icon: "🍲",
        startTime: "20:00",
        endTime: "21:00",
        isDefault: true,
      },
      {
        name: "Sleep on Time",
        icon: "😴",
        startTime: "22:00",
        endTime: "23:00",
        isDefault: true,
      },
    ];

    res.json({
      success: true,
      defaultActivities,
    });
  } catch (error) {
    console.error("Get default activities error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =====================
// GET TODAY ACTIVITIES
// =====================
exports.getTodayActivities = async (req, res) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();

    const activities = await Activity.findAll({
      where: { userId: req.user.id },
      order: [
        ["order", "ASC"],
        ["startTime", "ASC"],
        ["createdAt", "ASC"],
      ],
    });

    const logs = await DailyLog.findAll({
      where: {
        userId: req.user.id,
        date: todayStr,
      },
    });

    const canComplete =
      currentHour < 23 || (currentHour === 23 && currentMinute < 59);

    const activitiesWithStatus = activities.map((activity) => {
      const log = logs.find((l) => l.activityId === activity.id);
      return {
        ...activity.toJSON(),
        completed: log ? log.completed : false,
        canComplete: canComplete || (log && log.completed),
      };
    });

    res.json({
      success: true,
      activities: activitiesWithStatus,
      canComplete,
      timeRemaining: {
        hours: 23 - currentHour,
        minutes: 59 - currentMinute,
      },
    });
  } catch (error) {
    console.error("Get today activities error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =====================
// CREATE ACTIVITY
// =====================
exports.createCustomActivity = async (req, res) => {
  try {
    const { name, icon, startTime, endTime } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Activity name is required",
      });
    }

    const existingActivity = await Activity.findOne({
      where: {
        userId: req.user.id,
        name: { [Op.iLike]: name.trim() },
      },
    });

    if (existingActivity) {
      return res.status(400).json({
        success: false,
        message: "You already have this activity",
      });
    }

    const maxOrder = await Activity.max("order", {
      where: { userId: req.user.id },
    });
    const order = (maxOrder || 0) + 1;

    const activity = await Activity.create({
      name: name.trim(),
      icon: icon || "📋",
      userId: req.user.id,
      isDefault: false,
      startTime: startTime || null,
      endTime: endTime || null,
      order: order,
    });

    res.status(201).json({
      success: true,
      message: "Activity created successfully",
      activity,
    });
  } catch (error) {
    console.error("Create custom activity error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =====================
// UPDATE ACTIVITY
// =====================
exports.updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, startTime, endTime } = req.body;

    const activity = await Activity.findOne({
      where: { id, userId: req.user.id },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    await activity.update({
      name: name || activity.name,
      icon: icon || activity.icon,
      startTime: startTime !== undefined ? startTime : activity.startTime,
      endTime: endTime !== undefined ? endTime : activity.endTime,
    });

    res.json({
      success: true,
      message: "Activity updated successfully",
      activity,
    });
  } catch (error) {
    console.error("Update activity error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete activity with associated logs
exports.deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findOne({
      where: { id, userId: req.user.id },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    // Delete all logs associated with this activity first
    await DailyLog.destroy({
      where: {
        userId: req.user.id,
        activityId: id,
      },
    });

    // Then delete the activity
    await activity.destroy();

    res.json({
      success: true,
      message: "Activity and its logs deleted successfully",
    });
  } catch (error) {
    console.error("Delete activity error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete all default activities with cascade and proper error handling
exports.deleteAllDefaultActivities = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all default activities for this user
    const defaultActivities = await Activity.findAll({
      where: {
        userId: userId,
        isDefault: true,
      },
    });

    if (defaultActivities.length === 0) {
      return res.json({
        success: true,
        message: "No default activities to delete",
        deletedCount: 0,
      });
    }

    const activityIds = defaultActivities.map((a) => a.id);

    // Delete all logs associated with these activities
    const logsDeleted = await DailyLog.destroy({
      where: {
        userId: userId,
        activityId: {
          [Op.in]: activityIds,
        },
      },
    });

    console.log(
      `Deleted ${logsDeleted} logs for ${defaultActivities.length} default activities`,
    );

    // Delete the activities
    const deleted = await Activity.destroy({
      where: {
        userId: userId,
        isDefault: true,
      },
    });

    res.json({
      success: true,
      message: `${deleted} default activities deleted successfully (${logsDeleted} logs removed)`,
      deletedCount: deleted,
      logsDeleted: logsDeleted,
    });
  } catch (error) {
    console.error("Delete all default activities error:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

// =====================
// TOGGLE ACTIVITY
// =====================
exports.toggleActivity = async (req, res) => {
  try {
    const { activityId, date, week, day, note } = req.body;

    const activity = await Activity.findOne({
      where: { id: activityId, userId: req.user.id },
    });

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const existingLog = await DailyLog.findOne({
      where: {
        userId: req.user.id,
        activityId,
        date: date || new Date().toISOString().split("T")[0],
      },
    });

    if (existingLog) {
      await existingLog.update({
        completed: !existingLog.completed,
        note: note || existingLog.note,
      });
      return res.json({
        success: true,
        log: existingLog,
        message: existingLog.completed
          ? "Activity completed!"
          : "Activity uncompleted",
      });
    }

    const log = await DailyLog.create({
      userId: req.user.id,
      activityId,
      date: date || new Date().toISOString().split("T")[0],
      week: week || 1,
      day: day || 1,
      completed: true,
      note: note || "",
    });

    res.status(201).json({
      success: true,
      log,
      message: "Activity completed!",
    });
  } catch (error) {
    console.error("Toggle activity error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// GET DAILY PROGRESS
// =====================
exports.getDailyProgress = async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = date || new Date().toISOString().split("T")[0];

    const logs = await DailyLog.findAll({
      where: {
        userId: req.user.id,
        date: queryDate,
      },
      include: [
        {
          model: Activity,
          attributes: ["name", "icon"],
        },
      ],
    });

    const totalActivities = await Activity.count({
      where: { userId: req.user.id },
    });

    const completedCount = logs.filter((log) => log.completed).length;

    res.json({
      success: true,
      date: queryDate,
      total: totalActivities,
      completed: completedCount,
      logs,
    });
  } catch (error) {
    console.error("Get daily progress error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// GET WEEKLY PROGRESS
// =====================
exports.getWeeklyProgress = async (req, res) => {
  try {
    const { week = 1 } = req.query;

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (week - 1) * 7);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const logs = await DailyLog.findAll({
      where: {
        userId: req.user.id,
        week: parseInt(week),
        date: {
          [Op.between]: [
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0],
          ],
        },
      },
      include: [
        {
          model: Activity,
          attributes: ["name", "icon"],
        },
      ],
    });

    const days = {};
    for (let i = 1; i <= 7; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i - 1);
      const dateStr = dayDate.toISOString().split("T")[0];
      days[i] = {
        date: dateStr,
        completed: logs.filter((log) => log.date === dateStr && log.completed)
          .length,
        total: 10,
      };
    }

    res.json({
      success: true,
      week: parseInt(week),
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      days,
      logs,
    });
  } catch (error) {
    console.error("Get weekly progress error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// GET MONTHLY PROGRESS
// =====================
exports.getMonthlyProgress = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const logs = await DailyLog.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.between]: [
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0],
          ],
        },
      },
      include: [
        {
          model: Activity,
          attributes: ["name", "icon"],
        },
      ],
    });

    const days = {};
    for (let i = 1; i <= endDate.getDate(); i++) {
      const dateObj = new Date(targetYear, targetMonth - 1, i);
      const dateStr = dateObj.toISOString().split("T")[0];
      const dayLogs = logs.filter((log) => log.date === dateStr);
      days[i] = {
        date: dateStr,
        completed: dayLogs.filter((log) => log.completed).length,
        total: 10,
        dayOfWeek: dateObj.getDay(),
      };
    }

    const totalDays = Object.keys(days).length;
    const totalCompleted = logs.filter((log) => log.completed).length;
    const totalActivities = totalDays * 10;

    res.json({
      success: true,
      month: targetMonth,
      year: targetYear,
      totalDays,
      totalCompleted,
      totalActivities,
      completionRate:
        totalActivities > 0
          ? Math.round((totalCompleted / totalActivities) * 100)
          : 0,
      days,
    });
  } catch (error) {
    console.error("Get monthly progress error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// GET STATS
// =====================
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const logs = await DailyLog.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [
            startOfMonth.toISOString().split("T")[0],
            endOfMonth.toISOString().split("T")[0],
          ],
        },
      },
      attributes: ["date", "completed"],
    });

    const activities = await Activity.findAll({
      where: { userId },
      attributes: ["id", "name", "icon"],
    });

    const totalDays = endOfMonth.getDate();
    const daysWithData = new Set();
    const completedDays = new Set();

    logs.forEach((log) => {
      daysWithData.add(log.date);
      if (log.completed) completedDays.add(log.date);
    });

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i + 1);
      const dateStr = date.toISOString().split("T")[0];

      if (date > new Date()) break;

      const isCompleted = completedDays.has(dateStr);

      if (isCompleted) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }

      if (dateStr === today.toISOString().split("T")[0]) {
        currentStreak = tempStreak;
      }
    }

    const completionRate =
      totalDays > 0 ? Math.round((completedDays.size / totalDays) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalDays,
        trackedDays: daysWithData.size,
        completedDays: completedDays.size,
        currentStreak,
        bestStreak,
        completionRate,
        activitiesCount: activities.length,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =====================
// GET HEATMAP
// =====================
exports.getHeatmap = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.query;

    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);
    const daysInMonth = endDate.getDate();

    const logs = await DailyLog.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0],
          ],
        },
      },
      attributes: ["date", "completed"],
    });

    const activities = await Activity.count({ where: { userId } });
    const totalActivities = activities || 10;

    const heatmapData = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(targetYear, targetMonth - 1, i);
      const dateStr = date.toISOString().split("T")[0];
      const dayLogs = logs.filter((log) => log.date === dateStr);
      const completed = dayLogs.filter((log) => log.completed).length;

      heatmapData.push({
        day: i,
        date: dateStr,
        completed,
        total: totalActivities,
        percentage:
          totalActivities > 0
            ? Math.round((completed / totalActivities) * 100)
            : 0,
        dayOfWeek: date.getDay(),
      });
    }

    res.json({
      success: true,
      heatmap: heatmapData,
      month: targetMonth,
      year: targetYear,
      daysInMonth,
    });
  } catch (error) {
    console.error("Get heatmap error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =====================
// GET WEEKLY TREND
// =====================
exports.getWeeklyTrend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    const limit = parseInt(days);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - limit);

    const logs = await DailyLog.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0],
          ],
        },
      },
      attributes: ["date", "completed"],
    });

    const activities = await Activity.count({ where: { userId } });
    const totalActivities = activities || 10;

    const trendData = {};
    for (let i = 0; i <= limit; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      const dayLogs = logs.filter((log) => log.date === dateStr);
      const completed = dayLogs.filter((log) => log.completed).length;

      trendData[dateStr] = {
        date: dateStr,
        completed,
        total: totalActivities,
        percentage:
          totalActivities > 0
            ? Math.round((completed / totalActivities) * 100)
            : 0,
      };
    }

    res.json({
      success: true,
      trend: Object.values(trendData),
      limit,
    });
  } catch (error) {
    console.error("Get weekly trend error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =====================
// GET ACTIVITY INSIGHTS
// =====================
exports.getActivityInsights = async (req, res) => {
  try {
    const userId = req.user.id;

    const activities = await Activity.findAll({
      where: { userId },
      attributes: ["id", "name", "icon", "isDefault"],
    });

    const logs = await DailyLog.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 3))
            .toISOString()
            .split("T")[0],
        },
      },
      attributes: ["activityId", "completed"],
    });

    const insights = activities.map((activity) => {
      const activityLogs = logs.filter((log) => log.activityId === activity.id);
      const total = activityLogs.length;
      const completed = activityLogs.filter((log) => log.completed).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...activity.toJSON(),
        total,
        completed,
        percentage,
      };
    });

    const sorted = insights.sort((a, b) => b.percentage - a.percentage);

    const mostConsistent = sorted.length > 0 ? sorted[0] : null;
    const needsImprovement =
      sorted.length > 0 ? sorted[sorted.length - 1] : null;

    res.json({
      success: true,
      insights: sorted,
      mostConsistent,
      needsImprovement,
      totalActivities: activities.length,
    });
  } catch (error) {
    console.error("Get activity insights error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =====================
// GET MILESTONES
// =====================
exports.getMilestones = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const logs = await DailyLog.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [
            startOfMonth.toISOString().split("T")[0],
            endOfMonth.toISOString().split("T")[0],
          ],
        },
      },
      attributes: ["date", "completed"],
      order: [["date", "ASC"]],
    });

    const activities = await Activity.count({ where: { userId } });
    const totalActivities = activities || 10;

    let currentStreak = 0;
    let bestStreak = 0;
    const completedDays = [];

    for (let i = 0; i < endOfMonth.getDate(); i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i + 1);
      const dateStr = date.toISOString().split("T")[0];
      const dayLogs = logs.filter((log) => log.date === dateStr);
      const completed = dayLogs.filter((log) => log.completed).length;

      if (completed === totalActivities) {
        completedDays.push(dateStr);
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    const milestones = [
      {
        id: "first_complete",
        title: "First Complete Day",
        description: "Completed all activities in a single day",
        icon: "🌟",
        achieved: completedDays.length > 0,
        date: completedDays.length > 0 ? completedDays[0] : null,
      },
      {
        id: "week_streak",
        title: "Week Warrior",
        description: "Completed 7 days in a row",
        icon: "🔥",
        achieved: bestStreak >= 7,
        date: null,
      },
      {
        id: "month_master",
        title: "Month Master",
        description: "Completed 30 days in a month",
        icon: "🏆",
        achieved: completedDays.length >= 30,
        date: null,
      },
      {
        id: "perfect_week",
        title: "Perfect Week",
        description: "All activities completed for 7 consecutive days",
        icon: "💯",
        achieved: bestStreak >= 7,
        date: null,
      },
    ];

    const nextMilestone =
      bestStreak < 7
        ? {
            title: `${7 - bestStreak} more days to Week Warrior`,
            days: 7 - bestStreak,
          }
        : null;

    res.json({
      success: true,
      milestones,
      nextMilestone,
      currentStreak,
      bestStreak,
      completedDays: completedDays.length,
    });
  } catch (error) {
    console.error("Get milestones error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.bulkCreateActivities = async (req, res) => {
  try {
    const { activities: incoming, mode = "merge" } = req.body;

    if (!Array.isArray(incoming) || incoming.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No activities provided",
      });
    }

    if (incoming.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Too many activities — max 100 per import",
      });
    }

    if (!["merge", "replace"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mode. Use 'merge' or 'replace'.",
      });
    }

    // ---------- REPLACE MODE ----------
    if (mode === "replace") {
      // Delete all DailyLogs first (foreign key), then all Activities
      await DailyLog.destroy({ where: { userId: req.user.id } });
      await Activity.destroy({ where: { userId: req.user.id } });
    }

    // ---------- BUILD THE NEW LIST ----------
    const maxOrder =
      mode === "replace"
        ? 0
        : await Activity.max("order", { where: { userId: req.user.id } });

    let nextOrder = (maxOrder || 0) + 1;

    // Deduplicate against existing activities (only if merge)
    const existingNames = new Set();
    if (mode === "merge") {
      const existing = await Activity.findAll({
        where: { userId: req.user.id },
        attributes: ["name"],
      });
      existing.forEach((a) => existingNames.add(a.name.trim().toLowerCase()));
    }

    const toInsert = [];
    const skipped = [];

    for (const item of incoming) {
      const name = (item.name || "").trim();
      if (!name) {
        skipped.push({ name: item.name || "(empty)", reason: "Missing name" });
        continue;
      }
      if (existingNames.has(name.toLowerCase())) {
        skipped.push({ name, reason: "Duplicate" });
        continue;
      }

      toInsert.push({
        name,
        icon: item.icon || "📋",
        startTime: item.startTime || null,
        endTime: item.endTime || null,
        userId: req.user.id,
        isDefault: false,
        order: nextOrder++,
      });

      existingNames.add(name.toLowerCase());
    }

    if (toInsert.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          mode === "replace"
            ? "No valid activities to import"
            : "All activities were skipped (duplicates)",
        skipped,
      });
    }

    const created = await Activity.bulkCreate(toInsert, { returning: true });

    res.status(201).json({
      success: true,
      message:
        mode === "replace"
          ? `${created.length} activities imported (schedule replaced)`
          : `${created.length} activities imported`,
      mode,
      created: created.length,
      skipped,
    });
  } catch (error) {
    console.error("Bulk create activities error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
