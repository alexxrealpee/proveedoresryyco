import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import fs from 'fs';

async function run() {
  console.log('🔍 Iniciando verificación de conexión con Firebase Firestore...');
  const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
  console.log(`📌 Proyecto: ${config.projectId}`);
  console.log(`📌 Base de datos: ${config.firestoreDatabaseId}`);

  try {
    const app = initializeApp(config);
    const db = getFirestore(app, config.firestoreDatabaseId);

    const testRef = doc(db, 'test', 'verification_ping');
    const now = new Date().toISOString();

    console.log('📡 Enviando ping de escritura a Firestore...');
    await setDoc(testRef, {
      status: 'ok',
      verifiedAt: now,
      environment: 'AI Studio / RYYCO Hub'
    });
    console.log('✅ Escritura exitosa en Firestore.');

    console.log('📡 Leyendo documento de prueba desde Firestore...');
    const snapshot = await getDoc(testRef);
    if (snapshot.exists()) {
      console.log('✅ Lectura exitosa. Datos recibidos:', snapshot.data());
      console.log('\n🎉 ¡CONEXIÓN CONFIRMADA AL 100%! La base de datos "proveedores-ryyco" responde correctamente.');
      process.exit(0);
    } else {
      console.error('❌ El documento fue escrito pero no se pudo leer.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message || error);
    if (error.code) {
      console.error('Código de error Firebase:', error.code);
    }
    process.exit(1);
  }
}

run();
