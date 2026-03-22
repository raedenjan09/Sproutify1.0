const admin = require('firebase-admin');
const loadEnv = require('../config/loadEnv');

loadEnv();

const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID',
  'FIREBASE_CLIENT_CERT_URL',
];

function getMissingVars() {
  return requiredEnvVars.filter((varName) => !process.env[varName]);
}

function ensureFirebaseAdmin() {
  const missingVars = getMissingVars();

  if (missingVars.length > 0) {
    throw new Error(`Firebase configuration is incomplete: ${missingVars.join(', ')}`);
  }

  let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();

  if (
    (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
    (privateKey.startsWith("'") && privateKey.endsWith("'"))
  ) {
    privateKey = privateKey.slice(1, -1);
  }

  privateKey = privateKey.replace(/\\n/g, '\n');

  if (!privateKey.includes('BEGIN PRIVATE KEY')) {
    throw new Error('Firebase private key is malformed');
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: privateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
      }),
    });
  }

  return admin;
}

function isFirebaseAdminConfigured() {
  return getMissingVars().length === 0;
}

module.exports = {
  ensureFirebaseAdmin,
  isFirebaseAdminConfigured,
};
