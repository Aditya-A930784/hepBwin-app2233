import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  fetchEligiblePatientsForDose,
  getPatientDoseHistory,
  saveSecondDoseRecord,
  saveThirdDoseRecord,
} from './vaccinationFlow';

// Save user profile data
export const saveUserProfile = async (userId, profileData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...profileData,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error saving profile:', error);
    return { success: false, error: error.message };
  }
};

// Get user profile data
export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: 'Profile not found' };
    }
  } catch (error) {
    console.error('Error getting profile:', error);
    return { success: false, error: error.message };
  }
};

// Save vaccination dose
export const saveDose = async (userId, doseNumber, doseData) => {
  try {
    console.log('Attempting to save dose:', { userId, doseNumber, doseData });
    const doseRef = await addDoc(collection(db, 'vaccinations'), {
      userId,
      doseNumber,
      ...doseData,
      createdAt: new Date().toISOString(),
    });
    console.log('Dose saved successfully! ID:', doseRef.id);
    return { success: true, doseId: doseRef.id };
  } catch (error) {
    console.error('Error saving dose:', error);
    console.error('Error details:', error.message, error.code);
    return { success: false, error: error.message };
  }
};

// Get all doses for a user
export const getUserDoses = async (userId) => {
  try {
    const q = query(
      collection(db, 'vaccinations'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const doses = [];
    querySnapshot.forEach((doc) => {
      doses.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: doses };
  } catch (error) {
    console.error('Error getting doses:', error);
    return { success: false, error: error.message };
  }
};

// Save medical history
export const saveMedicalHistory = async (userId, medicalData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      medicalHistory: medicalData,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error saving medical history:', error);
    return { success: false, error: error.message };
  }
};

// Save patient information (for coordinator)
export const savePatientInfo = async (patientData) => {
  try {
    console.log('Attempting to save patient:', patientData);
    const patientRef = await addDoc(collection(db, 'patients'), {
      ...patientData,
      firstDoseStatus: 'Completed',
      secondDoseStatus: 'Pending',
      thirdDoseStatus: 'Pending',
      certificationDownload: 'Not Available',
      createdAt: new Date().toISOString(),
    });
    console.log('Patient saved successfully! ID:', patientRef.id);
    return { success: true, patientId: patientRef.id };
  } catch (error) {
    console.error('Error saving patient:', error);
    console.error('Error details:', error.message, error.code);
    return { success: false, error: error.message };
  }
};

export {
  fetchEligiblePatientsForDose,
  getPatientDoseHistory,
  saveSecondDoseRecord,
  saveThirdDoseRecord,
};
