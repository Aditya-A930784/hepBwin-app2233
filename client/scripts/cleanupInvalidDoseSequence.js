const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyBbgfYoSKfdDRCOXfInqchIrj5RTnZbTFQ',
  authDomain: 'hepbwin-app.firebaseapp.com',
  projectId: 'hepbwin-app',
  storageBucket: 'hepbwin-app.firebasestorage.app',
  messagingSenderId: '185492567783',
  appId: '1:185492567783:web:03c202126f3a56639f1442',
  measurementId: 'G-C3V5MJMSLW',
};

const PATIENTS_COLLECTION = 'patients';
const SECOND_DOSE_COLLECTION = 'second_dose';
const THIRD_DOSE_COLLECTION = 'Thrid_dose';

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const [patientsSnapshot, secondDoseSnapshot, thirdDoseSnapshot] = await Promise.all([
    getDocs(collection(db, PATIENTS_COLLECTION)),
    getDocs(collection(db, SECOND_DOSE_COLLECTION)),
    getDocs(collection(db, THIRD_DOSE_COLLECTION)),
  ]);

  const secondDoseMap = new Map();
  secondDoseSnapshot.forEach((item) => {
    const data = item.data();
    if (data.patientId && data.secondDoseDate && !data.invalidDoseSequence && !data.isInvalidSequence) {
      secondDoseMap.set(data.patientId, true);
    }
  });

  let flaggedCount = 0;
  const invalidRecords = [];

  for (const item of thirdDoseSnapshot.docs) {
    const data = item.data();
    const patientId = data.patientId || item.id;
    const hasDose3 = Boolean(data.thirdDoseDate);
    const hasDose2 = secondDoseMap.has(patientId);

    if (hasDose3 && !hasDose2 && !data.invalidDoseSequence && !data.isInvalidSequence) {
      await updateDoc(doc(db, THIRD_DOSE_COLLECTION, item.id), {
        invalidDoseSequence: true,
        invalidReason: 'Dose 2 required',
        cleanedAt: new Date().toISOString(),
      });

      flaggedCount += 1;
      invalidRecords.push({ docId: item.id, patientId });
    }
  }

  console.log(`Checked ${patientsSnapshot.size} patients.`);
  console.log(`Flagged ${flaggedCount} invalid third-dose record(s).`);
  if (invalidRecords.length > 0) {
    console.log(JSON.stringify(invalidRecords, null, 2));
  }
}

main().catch((error) => {
  console.error('Cleanup failed:', error);
  process.exit(1);
});