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
import { getAllExercises } from "@/lib/exercises";
const EXERCISE_LOGS_COL = "exercise_logs";
let cachedExercises = null;


function categorizeExercise(exerciseName) {
  if (!exerciseName) return "Other";
  
  const name = exerciseName.toLowerCase();
  
  if (/bench|chest|push[ -]?up|fly|press|dip/.test(name)) return "Chest";
  if (/back|row|pull[ -]?up|pulldown|deadlift|lat/.test(name)) return "Back";
  if (/squat|leg|calf|lunge|hamstring|quad|glute/.test(name)) return "Legs";
  if (/shoulder|delt|military|overhead|press|shrug/.test(name)) return "Shoulders";
  if (/bicep|tricep|curl|extension|arm/.test(name)) return "Arms";
  if (/ab|core|crunch|sit[ -]?up|plank/.test(name)) return "Core";
  if (/run|jog|sprint|cardio|bike|cycling|treadmill|elliptical|rowing/.test(name)) return "Cardio";
  
  return "Other";
}


function getExerciseData(exerciseName) {
  if (cachedExercises === null) {
    cachedExercises = getAllExercises();
  }
  
  return cachedExercises.find(ex => ex.name === exerciseName);
}


export async function addOrUpdateExerciseLog(userId, exerciseData, selectedDate) {
  
  const fullExerciseData = getExerciseData(exerciseData.name); 
  let primaryMuscles = fullExerciseData?.primaryMuscles || [];
  let secondaryMuscles = fullExerciseData?.secondaryMuscles || [];


  if (!fullExerciseData || primaryMuscles.length === 0) {
    const muscleGroup = categorizeExercise(exerciseData.name);
    primaryMuscles = [muscleGroup];
    
  }
  

  const dateStr = format(selectedDate, "yyyy-MM-dd");
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
      ...((!existingData.primaryMuscles || existingData.primaryMuscles.length === 0) && { primaryMuscles }),
    ...((!existingData.secondaryMuscles || existingData.secondaryMuscles.length === 0) && { secondaryMuscles }),
  
     

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
    primaryMuscles,
    secondaryMuscles,
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