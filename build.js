import fs from 'node:fs';
import { execSync } from 'node:child_process';

if (!fs.existsSync('dist/index.html') && fs.existsSync('client/dist/index.html')) {
  fs.cpSync('client/dist', 'dist', { recursive: true });
}

if (fs.existsSync('dist/index.html')) {
  console.log('Client already prebuilt.');
} else {
  console.log('Building client...');
  execSync('npm install --prefix client && npm run build --prefix client', { stdio: 'inherit' });
  if (fs.existsSync('client/dist')) {
    fs.cpSync('client/dist', 'dist', { recursive: true });
  }
}
