const app = require("./app");
const sequelize = require("./config/database");
require("dotenv").config();

const PORT = process.env.PORT || 6565;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connection established");
    await sequelize.sync();
    console.log("✅ Database tables created/synced");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
