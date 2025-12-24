
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  setDoc
} from "firebase/firestore";
import { Contribution, Loan } from "../types";

// Note: In a production environment, these should be environment variables.
// For this environment, we use a placeholder config that connects to the project's Firestore.
const firebaseConfig = {
  apiKey: process.env.API_KEY, // Reusing the Gemini API key if applicable, or placeholder
  authDomain: "nysc-katsina-coop.firebaseapp.com",
  projectId: "nysc-katsina-coop",
  storageBucket: "nysc-katsina-coop.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const dbService = {
  // Contributions
  async getContributions(): Promise<Contribution[]> {
    const q = query(collection(db, "contributions"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Contribution));
  },

  async addContribution(data: Contribution): Promise<string> {
    const { id, ...rest } = data;
    // We use setDoc with a manual ID if provided, otherwise addDoc
    const docRef = doc(collection(db, "contributions"), id);
    await setDoc(docRef, rest);
    return id;
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
    const snapshot = await getDocs(collection(db, "loans"));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Loan));
  },

  async addLoan(data: Loan): Promise<string> {
    const { id, ...rest } = data;
    const docRef = doc(collection(db, "loans"), id);
    await setDoc(docRef, rest);
    return id;
  },

  async updateLoanStatus(id: string, status: string): Promise<void> {
    const docRef = doc(db, "loans", id);
    await updateDoc(docRef, { status });
  }
};
