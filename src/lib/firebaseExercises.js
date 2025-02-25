// src/lib/firebaseExercises.js
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { format } from "date-fns";
const EXERCISE_LOGS_COL = "exercise_logs";

export async function addOrUpdateExerciseLog(userId, exerciseData, selectedDate) {
  
    
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  // Check for existing exercise log with same name today
  const q = query(
    collection(db, EXERCISE_LOGS_COL),
    where("userId", "==", userId),
    where("name", "==", exerciseData.name),
    where("date", "==", dateStr),
   
  );
 

  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const existingDoc = snapshot.docs[0];
    const existingData = existingDoc.data();
    const newSets = exerciseData.sets.map((set, index) => ({
      ...set,
      setNumber: existingData.sets.length + index + 1
    }));
    
    const totalVolume = existingData.totalVolume + 
       exerciseData.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);

    await updateDoc(existingDoc.ref, {
      sets: [...existingData.sets, ...newSets],
      totalVolume,
      updatedAt: new Date(),
    });
    return existingDoc.ref.id;
  }

  const totalVolume = exerciseData.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
  
  const docRef = await addDoc(collection(db, EXERCISE_LOGS_COL), {
    ...exerciseData,
    userId,
    totalVolume,
    date: format(selectedDate, "yyyy-MM-dd"),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  return docRef.id;
}

export function subscribeToExerciseLogs(userId, selectedDate, callback) {
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const q = query(
    collection(db, EXERCISE_LOGS_COL),
    where("userId", "==", userId),
    where("date", "==", dateStr),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date ? new Date(doc.data().date) : null
    }));
    callback(logs);
  });
}

export async function updateExerciseSets(logId, updatedSets) {
  const docRef = doc(db, EXERCISE_LOGS_COL, logId);
  const totalVolume = updatedSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
  
  await updateDoc(docRef, {
    sets: updatedSets,
    totalVolume,
    updatedAt: new Date()
  });
}

export async function deleteExerciseLog(logId) {
  const docRef = doc(db, EXERCISE_LOGS_COL, logId);
  await deleteDoc(docRef);
}