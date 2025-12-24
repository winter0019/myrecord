
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

// Firebase configuration. 
// Note: apiKey here is for Firebase usage, not Gemini.
const firebaseConfig = {
  apiKey: process.env.API_KEY || "AIzaSy_placeholder",
  authDomain: "nysc-katsina-coop.firebaseapp.com",
  projectId: "nysc-katsina-coop",
  storageBucket: "nysc-katsina-coop.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Singleton pattern for Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Enable Offline Persistence
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
  // Contributions
  async getContributions(): Promise<Contribution[]> {
    try {
      const q = query(collection(db, "contributions"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => {
        const data = d.data();
        return { ...data, id: d.id } as Contribution;
      });
    } catch (err) {
      console.error("Cloud Database Sync Error:", err);
      return [];
    }
  },

  async addContribution(data: Contribution): Promise<void> {
    const { id, ...rest } = data;
    const docRef = doc(db, "contributions", id);
    await setDoc(docRef, { ...rest, id });
  },

  async updateContribution(data: Contribution): Promise<void> {
    const { id, ...rest } = data;
    const docRef = doc(db, "contributions", id);
    await updateDoc(docRef, { ...rest });
  },

  async deleteContribution(id: string): Promise<void> {
    await deleteDoc(doc(db, "contributions", id));
  },

  // Loans
  async getLoans(): Promise<Loan[]> {
    try {
      const snapshot = await getDocs(collection(db, "loans"));
      return snapshot.docs.map(d => {
        const data = d.data();
        return { ...data, id: d.id } as Loan;
      });
    } catch (err) {
      console.error("Cloud Loan Retrieval Error:", err);
      return [];
    }
  },

  async addLoan(data: Loan): Promise<void> {
    const { id, ...rest } = data;
    const docRef = doc(db, "loans", id);
    await setDoc(docRef, { ...rest, id });
  },

  async updateLoanStatus(id: string, status: string): Promise<void> {
    const docRef = doc(db, "loans", id);
    await updateDoc(docRef, { status });
  }
};
