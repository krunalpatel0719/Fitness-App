// src/app/fooddiary/page.jsx



"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { MetricsForm } from "@/components/MetricsForm";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, updateDoc, addDoc, deleteDoc } from "firebase/firestore";

import { format } from "date-fns";
import { LuDumbbell } from "react-icons/lu";
import { WorkoutMetricsSection } from "@/components/WorkoutMetricsSection";
import { WorkoutLog } from "@/components/WorkoutLog";



export default function Workouts() {
  const router = useRouter();
  const { userLoggedIn, currentUser } = useAuth();

  const [userMetrics, setUserMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [exercises, setExercises] = useState([]);
  const [totalExercise, setTotalExercise] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [totalSets, setTotalSets] = useState(0);
  const handleDailyTotalInfo = () => {
    alert("This is the total calories consumed for the day.");
  }

  useEffect(() => {
    if (!userLoggedIn || !currentUser?.uid) {
      router.push("/signin");
      return;
    }

    // Load user metrics once on page load
    const loadMetrics = async () => {
      try {
        const docRef = doc(db, "user_metrics", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setUserMetrics(docSnap.data());
      } catch (error) {
        console.error("Error loading metrics:", error);
      } finally {
        setLoadingMetrics(false);
      }
    };

   
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const q = query(
      collection(db, "exercise_logs"),
      where("userId", "==", currentUser.uid),
      where("date", "==", dateStr),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = [];
      let totalVol = 0;
      let totalSets = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({ id: doc.id, ...data });
        totalVol += data.totalVolume || 0;
        totalSets += data.sets?.length || 0;
      });
      
      setExercises(logs);
      setTotalExercise(logs.length);
      setTotalVolume(totalVol);
      setTotalSets(totalSets);
    });

    if (currentUser?.uid) loadMetrics();

    return () => unsubscribe();
    
      
    

  

  }, [currentUser, userLoggedIn, selectedDate]);


  
 

  if (!userLoggedIn) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800">
      <Navbar />
      <main className="border-0 flex-1 p-6 lg:p-8">
        <div className="container max-w-7xl space-y-8 mx-auto">
          {loadingMetrics ? (
            <div className="max-w-md mx-auto">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : !userMetrics ? (
            <div className="max-w-md mx-auto">
              <MetricsForm onSubmit={handleSaveMetrics} />
            </div>
          ) : (
            <>
              <WorkoutMetricsSection
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                userMetrics={userMetrics}
                totalVolume={totalVolume}
                totalExercise={totalExercise}
                totalSets={totalSets}
                onInfoClick={handleDailyTotalInfo}
              />
              <WorkoutLog
                selectedDate= {selectedDate}
              />
            </>
          )}
        </div>
      </main>
      <div className="mt-auto flex justify-end p-3 dark:text-white">
        <a href="https://www.fatsecret.com">Powered by fatsecret</a>
      </div>
    </div>
  );
}