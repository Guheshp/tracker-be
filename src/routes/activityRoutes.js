const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getActivities,
  createCustomActivity,
  updateActivity,
  deleteActivity,
  deleteAllDefaultActivities,
  bulkCreateActivities,
  toggleActivity,
  getDailyProgress,
  getWeeklyProgress,
  getMonthlyProgress,
  getTodayActivities,
  getStats,
  getHeatmap,
  getWeeklyTrend,
  getActivityInsights,
  getMilestones,
  getDefaultActivities
} = require('../controllers/activityController');

// All routes require authentication
router.use(auth);

// Activity CRUD
router.get('/', getActivities);
router.get('/defaults', getDefaultActivities);
router.get('/today', getTodayActivities);
router.post('/', createCustomActivity);
router.post('/bulk', bulkCreateActivities);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);
router.delete('/defaults/all', deleteAllDefaultActivities);
router.post('/toggle', toggleActivity);

// Progress routes
router.get('/daily', getDailyProgress);
router.get('/weekly', getWeeklyProgress);
router.get('/monthly', getMonthlyProgress);
router.get('/stats', getStats);
router.get('/heatmap', getHeatmap);
router.get('/trend', getWeeklyTrend);
router.get('/insights', getActivityInsights);
router.get('/milestones', getMilestones);

module.exports = router;