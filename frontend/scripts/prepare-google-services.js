const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const easSecretFile = process.env.GOOGLE_SERVICES_JSON;
const localFile = path.join(projectRoot, 'google-services.json');
const destination = path.join(projectRoot, 'android', 'app', 'google-services.json');

const sourceFile = easSecretFile || (fs.existsSync(localFile) ? localFile : null);

if (!sourceFile) {
  console.log('No google-services.json source found. Skipping Android Firebase file copy.');
  process.exit(0);
}

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.copyFileSync(sourceFile, destination);

console.log(`Copied google-services.json to ${destination}`);
