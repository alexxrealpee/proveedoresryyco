import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const buildDir = path.resolve('build');

if (fs.existsSync(distDir)) {
  fs.cpSync(distDir, buildDir, { recursive: true, force: true });
  console.log('✅ Carpeta build/ creada y sincronizada exitosamente para Hostinger.');
}
