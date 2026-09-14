const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailyLog = sequelize.define('DailyLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  activityId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { 
      model: 'Activities', 
      key: 'id',
      onDelete: 'CASCADE' // Add this
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  week: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  day: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  note: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['userId', 'activityId', 'date'] }
  ]
});

module.exports = DailyLog;