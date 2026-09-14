const Reminder = require('../models/Reminder');
const { Op } = require('sequelize');

// Get all reminders for user
exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.findAll({
      where: { 
        userId: req.user.id,
        isCompleted: false
      },
      order: [['reminderDateTime', 'ASC']]
    });
    res.json({ success: true, reminders });
  } catch (error) {
    console.error('Get reminders error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get today's reminders
exports.getTodayReminders = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const reminders = await Reminder.findAll({
      where: {
        userId: req.user.id,
        isCompleted: false,
        reminderDateTime: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      order: [['reminderDateTime', 'ASC']]
    });
    res.json({ success: true, reminders });
  } catch (error) {
    console.error('Get today reminders error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get upcoming reminders
exports.getUpcomingReminders = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const reminders = await Reminder.findAll({
      where: {
        userId: req.user.id,
        isCompleted: false,
        reminderDateTime: {
          [Op.between]: [today, nextWeek]
        }
      },
      order: [['reminderDateTime', 'ASC']],
      limit: 10
    });
    res.json({ success: true, reminders });
  } catch (error) {
    console.error('Get upcoming reminders error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create reminder
exports.createReminder = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      reminderDateTime, 
      reminderType, 
      sound,
      isRecurring,
      recurringPattern,
      snoozeDuration
    } = req.body;

    if (!title || !reminderDateTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and date/time are required' 
      });
    }

    const reminder = await Reminder.create({
      userId: req.user.id,
      title,
      description: description || '',
      reminderDateTime: new Date(reminderDateTime),
      reminderType: reminderType || 'custom',
      sound: sound || 'chime',
      isRecurring: isRecurring || false,
      recurringPattern: recurringPattern || null,
      snoozeDuration: snoozeDuration || 5
    });

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      reminder
    });
  } catch (error) {
    console.error('Create reminder error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update reminder
exports.updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const reminder = await Reminder.findOne({
      where: { id, userId: req.user.id }
    });

    if (!reminder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reminder not found' 
      });
    }

    await reminder.update(updates);

    res.json({
      success: true,
      message: 'Reminder updated successfully',
      reminder
    });
  } catch (error) {
    console.error('Update reminder error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete reminder
exports.deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findOne({
      where: { id, userId: req.user.id }
    });

    if (!reminder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reminder not found' 
      });
    }

    await reminder.destroy();

    res.json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    console.error('Delete reminder error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Snooze reminder
exports.snoozeReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { snoozeDuration } = req.body;

    const reminder = await Reminder.findOne({
      where: { id, userId: req.user.id }
    });

    if (!reminder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reminder not found' 
      });
    }

    const duration = snoozeDuration || reminder.snoozeDuration || 5;
    const snoozedUntil = new Date();
    snoozedUntil.setMinutes(snoozedUntil.getMinutes() + duration);

    await reminder.update({
      snoozedUntil,
      snoozeCount: reminder.snoozeCount + 1
    });

    res.json({
      success: true,
      message: `Reminder snoozed for ${duration} minutes`,
      reminder
    });
  } catch (error) {
    console.error('Snooze reminder error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Mark reminder as complete
exports.completeReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findOne({
      where: { id, userId: req.user.id }
    });

    if (!reminder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reminder not found' 
      });
    }

    await reminder.update({ isCompleted: true });

    res.json({
      success: true,
      message: 'Reminder completed! 🎉',
      reminder
    });
  } catch (error) {
    console.error('Complete reminder error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get reminder by ID
exports.getReminderById = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findOne({
      where: { id, userId: req.user.id }
    });

    if (!reminder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reminder not found' 
      });
    }

    res.json({ success: true, reminder });
  } catch (error) {
    console.error('Get reminder error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};