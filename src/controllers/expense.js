const Expense = require("../models/Expense");

const createExpense = async (req, res) => {
  try {
    const {
      userId,
      title,
      amount,
      type,
      category,
      paymentMethod,
      expenseDate,
      description,
    } = req.body;

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!title || !title.trim()) {
      throw new Error("Title is required");
    }

    if (amount === undefined || amount === null || amount === "") {
      throw new Error("Amount is required");
    }

    if (Number(amount) <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const expense = await Expense.create({
      userId,
      title: title.trim(),
      amount,
      type,
      category,
      paymentMethod,
      expenseDate,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: expense,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      throw new Error("User ID is required");
    }

    const expenses = await Expense.findAll({
      where: {
        userId,
        status: 1,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Expenses fetched successfully",
      data: expenses,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const { userId, expenseId } = req.body;

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!expenseId) {
      throw new Error("Expense ID is required");
    }

    const expense = await Expense.findOne({
      where: {
        id: expenseId,
        userId,
        status: 1,
      },
    });

    if (!expense) {
      throw new Error("Expense not found");
    }

    return res.status(200).json({
      success: true,
      message: "Expense fetched successfully",
      data: expense,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateExpense = async (req, res) => {
  try {
    const {
      userId,
      expenseId,
      title,
      amount,
      type,
      category,
      paymentMethod,
      expenseDate,
      description,
    } = req.body;

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!expenseId) {
      throw new Error("Expense ID is required");
    }

    if (amount === undefined || amount === null || amount === "") {
      throw new Error("Amount is required");
    }

    if (Number(amount) <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    if (!type) {
      throw new Error("Type is required");
    }

    const expense = await Expense.findOne({
      where: {
        id: expenseId,
        userId,
        status: 1,
      },
    });

    if (!expense) {
      throw new Error("Expense not found");
    }

    if (title !== undefined) {
      if (!title.trim()) {
        throw new Error("Title cannot be empty");
      }

      expense.title = title.trim();
    }

    expense.amount = amount;
    expense.type = type;

    if (category !== undefined) {
      expense.category = category;
    }

    if (paymentMethod !== undefined) {
      expense.paymentMethod = paymentMethod;
    }

    if (expenseDate !== undefined) {
      expense.expenseDate = expenseDate;
    }

    if (description !== undefined) {
      expense.description = description;
    }

    await expense.save();

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: expense,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { userId, expenseId } = req.body;

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!expenseId) {
      throw new Error("Expense ID is required");
    }

    const expense = await Expense.findOne({
      where: {
        id: expenseId,
        userId,
        status: 1,
      },
    });

    if (!expense) {
      throw new Error("Expense not found");
    }

    expense.status = -1;

    await expense.save();

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
      data: expense,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
