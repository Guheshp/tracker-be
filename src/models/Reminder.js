const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reminder = sequelize.define('Reminder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { 
      model: 'Users', 
      key: 'id',
      onDelete: 'CASCADE'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reminderDateTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  reminderType: {
    type: DataTypes.ENUM('meeting', 'task', 'custom', 'break'),
    defaultValue: 'custom'
  },
  sound: {
    type: DataTypes.STRING,
    defaultValue: 'chime'
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurringPattern: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
    allowNull: true
  },
  snoozeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  snoozedUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  snoozeDuration: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  }
}, {
  timestamps: true
});

module.exports = Reminder;