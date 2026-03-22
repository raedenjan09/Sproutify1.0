const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

let hasLoadedEnv = false;

function loadEnv() {
  if (hasLoadedEnv) {
    return;
  }

  const candidatePaths = [
    path.resolve(process.cwd(), 'config', '.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../config/.env'),
    path.resolve(__dirname, '../.env'),
  ];

  for (const candidatePath of candidatePaths) {
    if (fs.existsSync(candidatePath)) {
      dotenv.config({ path: candidatePath, quiet: true });
      hasLoadedEnv = true;
      return;
    }
  }

  dotenv.config({ quiet: true });
  hasLoadedEnv = true;
}

module.exports = loadEnv;
