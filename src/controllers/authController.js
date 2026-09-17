const User = require("../models/User");
const Activity = require("../models/Activity");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user.id);

    // const defaultActivities = [
    //   { name: 'Wake Up Early (Before 7 AM)', icon: '🌅', userId: user.id, isDefault: true },
    //   { name: 'Exercise (Move your body)', icon: '🏋️', userId: user.id, isDefault: true },
    //   { name: 'Healthy Food (Eat well)', icon: '🥗', userId: user.id, isDefault: true },
    //   { name: 'Drink Water (Stay hydrated)', icon: '💧', userId: user.id, isDefault: true },
    //   { name: 'Study / Learn (Build new skills)', icon: '📚', userId: user.id, isDefault: true },
    //   { name: 'Work / Project (Make progress)', icon: '💼', userId: user.id, isDefault: true },
    //   { name: 'Read (For a better you)', icon: '📖', userId: user.id, isDefault: true },
    //   { name: 'Meditation (Calm your mind)', icon: '🧘', userId: user.id, isDefault: true },
    //   { name: 'No Social Media (Stay present)', icon: '📱', userId: user.id, isDefault: true },
    //   { name: 'Sleep on Time (7–8 hours)', icon: '😴', userId: user.id, isDefault: true }
    // ];

    // await Activity.bulkCreate(defaultActivities);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isPublic: user.isPublic,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isPublic: user.isPublic,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    res.json({ success: true, user });
  } catch (error) {
    console.error("GetMe error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
