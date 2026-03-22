const loadEnv = require('../config/loadEnv');

loadEnv();

const app = require('../app');
const connectDatabase = require('../config/db');

let databasePromise;

module.exports = async (req, res) => {
  try {
    databasePromise = databasePromise || connectDatabase();
    await databasePromise;
    return app(req, res);
  } catch (error) {
    console.error('Serverless handler initialization failed:', error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Server initialization failed',
      });
    }
  }
};
