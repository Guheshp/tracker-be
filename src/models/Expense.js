const { DataTypes } = require("sequelize");

const sequelize = require("../config/database");

const Expense = sequelize.define(
  "Expense",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    category: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    paymentMethod: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    expenseDate: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // 1 = Active, -1 = Inactive
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        isIn: [[1, -1]],
      },
    },
  },
  {
    timestamps: true,

    indexes: [
      { fields: ["userId", "expenseDate"] },
      { fields: ["userId", "category"] },
      { fields: ["userId", "status"] },
    ],
  },
);

module.exports = Expense;
