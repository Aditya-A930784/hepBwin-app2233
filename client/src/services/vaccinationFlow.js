import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';

const PATIENTS_COLLECTION = 'patients';
const SECOND_DOSE_COLLECTION = 'second_dose';
const THIRD_DOSE_COLLECTION = 'Thrid_dose';

const isValidDoseRecord = (record) => record && !record.invalidDoseSequence && !record.isInvalidSequence;

const normalizeDate = (value) => (value ? value : null);

const normalizePatientIdentity = (patient) => ({
  id: patient.id,
  name: patient.name || '',
  rollNo: patient.rollNo || patient.rollNumber || patient.registrationNo || patient.studentId || patient.id,
  department: patient.department || '',
  designation: patient.designation || '',
});

const pickLatestRecord = (records) => {
  if (!records.length) return null;

  return [...records].sort((left, right) => {
    const leftTime = new Date(left.createdAt || left.recordedAt || 0).getTime();
    const rightTime = new Date(right.createdAt || right.recordedAt || 0).getTime();
    return rightTime - leftTime;
  })[0];
};

const fetchCollectionRecord = async (collectionName, patientId) => {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(query(collectionRef, where('patientId', '==', patientId)));

  const records = [];
  snapshot.forEach((item) => {
    const data = item.data();
    if (isValidDoseRecord(data)) {
      records.push({ id: item.id, ...data });
    }
  });

  const latestRecord = pickLatestRecord(records);

  if (latestRecord) {
    return latestRecord;
  }

  const fallbackDoc = await getDoc(doc(db, collectionName, patientId));
  if (fallbackDoc.exists()) {
    const data = fallbackDoc.data();
    if (isValidDoseRecord(data)) {
      return { id: fallbackDoc.id, ...data };
    }
  }

  return null;
};

export const formatDoseDisplayDate = (value) => {
  if (!value || value === 'N/A') {
    return 'Not Taken';
  }

  return value;
};

export const getPatientDoseHistory = async (patientId) => {
  if (!patientId) {
    return null;
  }

  const patientSnapshot = await getDoc(doc(db, PATIENTS_COLLECTION, patientId));
  if (!patientSnapshot.exists()) {
    return null;
  }

  const patient = { id: patientSnapshot.id, ...patientSnapshot.data() };
  const secondDose = await fetchCollectionRecord(SECOND_DOSE_COLLECTION, patientId);
  const thirdDose = await fetchCollectionRecord(THIRD_DOSE_COLLECTION, patientId);

  return {
    ...normalizePatientIdentity(patient),
    dose1Date: normalizeDate(patient.firstDoseDate || patient.doseZeroDate),
    dose2Date: normalizeDate(secondDose?.secondDoseDate || patient.secondDoseDate),
    dose3Date: normalizeDate(thirdDose?.thirdDoseDate || patient.thirdDoseDate),
    antiHBsDate: normalizeDate(thirdDose?.antiHBsDate || patient.antiHBsDate),
    patient,
    secondDose,
    thirdDose,
  };
};

const fetchAllPatients = async () => {
  const snapshot = await getDocs(collection(db, PATIENTS_COLLECTION));
  const patients = [];

  snapshot.forEach((item) => {
    patients.push({ id: item.id, ...item.data() });
  });

  return patients;
};

const fetchDoseMap = async (collectionName) => {
  const snapshot = await getDocs(collection(db, collectionName));
  const map = {};

  snapshot.forEach((item) => {
    const data = item.data();
    if (data.patientId && isValidDoseRecord(data)) {
      map[data.patientId] = { id: item.id, ...data };
    }
  });

  return map;
};

export const fetchEligiblePatientsForDose = async (doseNumber) => {
  const patients = await fetchAllPatients();
  const secondDoseMap = await fetchDoseMap(SECOND_DOSE_COLLECTION);
  const thirdDoseMap = await fetchDoseMap(THIRD_DOSE_COLLECTION);

  if (doseNumber === 2) {
    return patients.filter((patient) => {
      const hasDose1 = Boolean(patient.firstDoseDate || patient.doseZeroDate);
      const hasDose2 = Boolean(secondDoseMap[patient.id]?.secondDoseDate);
      return hasDose1 && !hasDose2;
    });
  }

  if (doseNumber === 3) {
    return patients.filter((patient) => {
      const hasDose2 = Boolean(secondDoseMap[patient.id]?.secondDoseDate);
      const hasDose3 = Boolean(thirdDoseMap[patient.id]?.thirdDoseDate);
      return hasDose2 && !hasDose3;
    });
  }

  if (doseNumber === 'antibody') {
    return patients.filter((patient) => Boolean(thirdDoseMap[patient.id]?.thirdDoseDate));
  }

  return patients;
};

export const ensureDoseEligibility = async (patientId, doseNumber) => {
  const history = await getPatientDoseHistory(patientId);

  if (!history) {
    throw new Error('Patient not found');
  }

  if (doseNumber === 2) {
    if (!history.dose1Date) {
      throw new Error('Dose 1 required');
    }

    return history;
  }

  if (doseNumber === 3) {
    if (!history.dose2Date) {
      throw new Error('Dose 2 required');
    }

    if (!history.dose1Date) {
      throw new Error('Dose 1 required');
    }

    return history;
  }

  if (doseNumber === 'antibody') {
    if (!history.dose3Date) {
      throw new Error('Dose 3 required');
    }

    return history;
  }

  return history;
};

export const saveSecondDoseRecord = async (doseData) => {
  const history = await ensureDoseEligibility(doseData.patientId, 2);
  const payload = {
    ...doseData,
    patientId: history.id,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, SECOND_DOSE_COLLECTION, history.id), payload, { merge: true });
  return { success: true, history };
};

export const saveThirdDoseRecord = async (doseData) => {
  const history = await ensureDoseEligibility(doseData.patientId, 3);
  const payload = {
    ...doseData,
    patientId: history.id,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, THIRD_DOSE_COLLECTION, history.id), payload, { merge: true });
  return { success: true, history };
};

export const getDoseExportData = async (exportType) => {
  const patients = await fetchAllPatients();
  const secondDoseMap = await fetchDoseMap(SECOND_DOSE_COLLECTION);
  const thirdDoseMap = await fetchDoseMap(THIRD_DOSE_COLLECTION);

  const eligiblePatients = patients.filter((patient) => {
    if (exportType === 'dose2') {
      return Boolean(patient.firstDoseDate || patient.doseZeroDate);
    }

    if (exportType === 'dose3') {
      return Boolean(secondDoseMap[patient.id]?.secondDoseDate);
    }

    return true;
  });

  return {
    patients: eligiblePatients,
    secondDoseMap,
    thirdDoseMap,
  };
};

export const getDoseHistorySummary = (history) => ({
  name: history?.name || 'N/A',
  id: history?.id || 'N/A',
  rollNo: history?.rollNo || history?.id || 'N/A',
  dose1Date: formatDoseDisplayDate(history?.dose1Date),
  dose2Date: formatDoseDisplayDate(history?.dose2Date),
  dose3Date: formatDoseDisplayDate(history?.dose3Date),
  antiHBsDate: formatDoseDisplayDate(history?.antiHBsDate),
});