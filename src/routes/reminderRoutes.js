const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getReminders,
  getTodayReminders,
  getUpcomingReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  snoozeReminder,
  completeReminder,
  getReminderById,
} = require("../controllers/reminderController");

router.use(auth);

router.get("/", getReminders);
router.get("/today", getTodayReminders);
router.get("/upcoming", getUpcomingReminders);
router.get("/:id", getReminderById);
router.post("/", createReminder);
router.put("/:id", updateReminder);
router.delete("/:id", deleteReminder);
router.post("/:id/snooze", snoozeReminder);
router.post("/:id/complete", completeReminder);

module.exports = router;
