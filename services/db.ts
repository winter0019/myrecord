import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
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
  enableIndexedDbPersistence,
  Firestore
} from "firebase/firestore";
import { Contribution, Loan } from "../types";

// Official Society Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.FIRESTORE_API_KEY || "AIzaSyC8ZxsvsUdwRRbPCV8xDJPRj93pnVWjSoI",
  authDomain: "record-bab42.firebaseapp.com",
  projectId: "record-bab42",
  storageBucket: "record-bab42.firebasestorage.app",
  messagingSenderId: "130760600092",
  appId: "1:130760600092:web:fa498301569f3032c6cdd9",
  measurementId: "G-E9VQEC1NG8"
};

// Singleton initialization for Firebase App
let app: FirebaseApp;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error("Firebase App initialization failed:", error);
  throw error;
}

// Access firestore using the specific app instance explicitly
const db: Firestore = getFirestore(app);

// Enable Offline Persistence with silent failure handling
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Firestore Persistence: Multiple tabs open. Persistence disabled.");
    } else if (err.code === 'unimplemented') {
      console.warn("Firestore Persistence: Browser does not support indexedDB.");
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
      console.error("Cloud Database Retrieval Error:", err);
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