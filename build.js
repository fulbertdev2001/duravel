import fs from 'node:fs';
import { execSync } from 'node:child_process';

if (fs.existsSync('client/dist/index.html')) {
  console.log('Client already prebuilt.');
} else {
  console.log('Building client...');
  execSync('npm install --prefix client && npm run build --prefix client', { stdio: 'inherit' });
}
