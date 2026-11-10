/**
 * Servidor de producción Express para servir la aplicación compilada (dist o build)
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de cabeceras de seguridad y CORS para el dominio oficial de Hostinger
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedDomains = [
    'olivedrab-gnu-577674.hostingersite.com',
    'localhost'
  ];

  if (origin) {
    const isAllowed = allowedDomains.some(d => origin.includes(d)) || origin.endsWith('.hostingersite.com');
    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Seleccionar carpeta de salida (dist o build) según exista
const staticDir = fs.existsSync(path.join(__dirname, 'dist'))
  ? path.join(__dirname, 'dist')
  : path.join(__dirname, 'build');

// Servir archivos estáticos
app.use(express.static(staticDir));

// Fallback para SPA (Single Page Application)
app.get('*', (req, res) => {
  const indexPath = path.join(staticDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('La aplicación aún no ha sido compilada. Ejecuta npm run build.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor RYYCO corriendo exitosamente en el puerto ${PORT}`);
  console.log(`🌐 Dominio autorizado: https://olivedrab-gnu-577674.hostingersite.com`);
  console.log(`📁 Sirviendo archivos estáticos desde: ${staticDir}`);
});
