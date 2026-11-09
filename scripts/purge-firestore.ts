import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import * as fs from 'fs';

const rawConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(rawConfig);
const db = getFirestore(app, rawConfig.firestoreDatabaseId);

const collections = [
  'supplier_products',
  'suppliers',
  'b2b_orders',
  'b2b_recurring_schedules',
  'supplier_applications',
  'b2b_problem_reports',
];

async function main() {
  console.log(`🧹 Iniciando purga completa en Cloud Firestore (${rawConfig.firestoreDatabaseId})...`);
  let totalDeleted = 0;

  for (const col of collections) {
    try {
      const snap = await getDocs(collection(db, col));
      console.log(`Colección '${col}': encontrada con ${snap.docs.length} documentos.`);
      for (const d of snap.docs) {
        await deleteDoc(doc(db, col, d.id));
        console.log(`  - Eliminado: ${col}/${d.id}`);
        totalDeleted++;
      }
    } catch (err) {
      console.error(`Error purgando ${col}:`, err);
    }
  }

  console.log(`✅ Purga finalizada: ${totalDeleted} documentos eliminados. Base de datos ahora está 100% en blanco.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Error fatal en script:', err);
  process.exit(1);
});
