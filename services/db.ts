
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  setDoc,
  enableIndexedDbPersistence
} from "firebase/firestore";
import { Contribution, Loan } from "../types";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "nysc-katsina-coop.firebaseapp.com",
  projectId: "nysc-katsina-coop",
  storageBucket: "nysc-katsina-coop.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Singleton pattern for Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Enable Offline Persistence safely
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Firestore Persistence: Multiple tabs open.");
    } else if (err.code === 'unimplemented') {
      console.warn("Firestore Persistence: Browser not supported.");
    }
  });
}

export const dbService = {
  async getContributions(): Promise<Contribution[]> {
    try {
      const q = query(collection(db, "contributions"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Contribution));
    } catch (err) {
      console.error("Cloud Database Sync Error:", err);
      return [];
    }
  },

  async addContribution(data: Contribution): Promise<void> {
    try {
      const { id, ...rest } = data;
      const docRef = doc(db, "contributions", id);
      await setDoc(docRef, { ...rest, id });
    } catch (err) {
      console.error("Add Contribution Error:", err);
      throw err;
    }
  },

  async updateContribution(data: Contribution): Promise<void> {
    try {
      const { id, ...rest } = data;
      const docRef = doc(db, "contributions", id);
      await updateDoc(docRef, { ...rest });
    } catch (err) {
      console.error("Update Contribution Error:", err);
      throw err;
    }
  },

  async deleteContribution(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "contributions", id));
    } catch (err) {
      console.error("Delete Contribution Error:", err);
      throw err;
    }
  },

  async getLoans(): Promise<Loan[]> {
    try {
      const snapshot = await getDocs(collection(db, "loans"));
      return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Loan));
    } catch (err) {
      console.error("Cloud Loan Retrieval Error:", err);
      return [];
    }
  },

  async addLoan(data: Loan): Promise<void> {
    try {
      const { id, ...rest } = data;
      const docRef = doc(db, "loans", id);
      await setDoc(docRef, { ...rest, id });
    } catch (err) {
      console.error("Add Loan Error:", err);
      throw err;
    }
  },

  async updateLoanStatus(id: string, status: string): Promise<void> {
    try {
      const docRef = doc(db, "loans", id);
      await updateDoc(docRef, { status });
    } catch (err) {
      console.error("Update Loan Status Error:", err);
      throw err;
    }
  }
};
