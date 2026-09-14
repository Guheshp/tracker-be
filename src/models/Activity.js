const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: '📋'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  startTime: {
    type: DataTypes.TIME,
    allowNull: true,
    defaultValue: null
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true,
    defaultValue: null
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  }
}, { 
  timestamps: true,
  indexes: [
    { fields: ['userId', 'order'] }
  ]
});

module.exports = Activity;