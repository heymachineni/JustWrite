import { getFirestore, type Firestore } from "firebase/firestore";
import { getApp } from "./client";

let db: Firestore | null = null;

export function getClientFirestore(): Firestore | null {
  const app = getApp();
  if (!app) return null;
  if (!db) db = getFirestore(app);
  return db;
}
