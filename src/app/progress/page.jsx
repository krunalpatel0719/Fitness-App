
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, onSnapshot, doc, getDoc } from "firebase/firestore";
import { format, startOfDay, endOfDay, addDays, subDays, differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import analytics components
import { NutritionMetrics } from "@/components/analytics/NutritionMetrics";
import { WorkoutMetrics } from "@/components/analytics/WorkoutMetrics";

export default function ProgressPage() {
  const router = useRouter();
  const { userLoggedIn, currentUser } = useAuth();
  const [userMetrics, setUserMetrics] = useState(null);
  const [timeframe, setTimeframe] = useState("week");
  const [foodData, setFoodData] = useState([]);
  const [exerciseData, setExerciseData] = useState([]);
  const [timeOffset, setTimeOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("nutrition");
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // Cache key for local storage
  const CACHE_KEY_PREFIX = "fitness_analytics_";
  const CACHE_DURATION = 3600000; // 1 hour

  // Calculate date range based on timeframe and offset
  const calculateDateRange = useCallback(() => {
    const now = new Date();
    let startDate, endDate;

    switch (timeframe) {
      case "day":
        startDate = startOfDay(addDays(now, timeOffset));
        endDate = endOfDay(addDays(now, timeOffset));
        break;
      case "week":
        // Start from 6 days ago, end with today (for current week)
        endDate = endOfDay(addDays(now, timeOffset * 7));
        startDate = startOfDay(addDays(endDate, -6));
        break;
      case "month":
        // Approximate a month as 30 days
        endDate = endOfDay(addDays(now, timeOffset * 30));
        startDate = startOfDay(addDays(endDate, -29));
        break;
      case "6 months":
        // 6 months as 180 days
        endDate = endOfDay(addDays(now, timeOffset * 180));
        startDate = startOfDay(addDays(endDate, -179));
        break;
      case "year":
        // Year as 365 days
        endDate = endOfDay(addDays(now, timeOffset * 365));
        startDate = startOfDay(addDays(endDate, -364));
        break;
      default:
        endDate = endOfDay(addDays(now, timeOffset * 7));
        startDate = startOfDay(addDays(endDate, -6));
    }

    return { start: startDate, end: endDate };
  }, [timeframe, timeOffset]);

  // Listen for user metrics
  useEffect(() => {
    if (!userLoggedIn || !currentUser?.uid) {
      router.push("/signin");
      return;
    }

    const unsubscribeUserMetrics = onSnapshot(
      doc(db, "user_metrics", currentUser.uid), 
      (doc) => {
        if (doc.exists()) setUserMetrics(doc.data());
      },
      (error) => console.error("Error fetching user metrics:", error)
    );

    return () => unsubscribeUserMetrics();
  }, [currentUser, userLoggedIn, router]);

  // Update date range when timeframe or offset changes
  useEffect(() => {
    const range = calculateDateRange();
    setDateRange(range);
  }, [timeframe, timeOffset, calculateDateRange]);

  // Fetch food data when date range changes
  useEffect(() => {
    const fetchNutritionData = async () => {
      if (!userLoggedIn || !currentUser?.uid) return;
      setLoading(true);
  
      try {
        // Calculate the current date range
        const { start: currentStart, end: currentEnd } = calculateDateRange();
        
        // Calculate the previous period date range for comparison
        const previousPeriodEnd = new Date(currentStart);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
        
        const daysDiff = Math.round((currentEnd - currentStart) / (1000 * 60 * 60 * 24));
        const previousPeriodStart = new Date(previousPeriodEnd);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - daysDiff);
        
        
        // Expand your date range to include both current and previous periods
        const foodLogsQuery = query(
          collection(db, "food_logs"),
          where("userId", "==", currentUser.uid),
          where("date", ">=", format(previousPeriodStart, "yyyy-MM-dd")),
          where("date", "<=", format(currentEnd, "yyyy-MM-dd")),
          orderBy("date", "desc")
        );
  
        const unsubscribe = onSnapshot(foodLogsQuery, (snapshot) => {
          const foodData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          setFoodData(foodData);
          setDateRange({ start: currentStart, end: currentEnd });
          setLoading(false);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error("Error fetching nutrition data:", error);
        setLoading(false);
      }
    };
  
    fetchNutritionData();
  }, [currentUser, userLoggedIn, timeframe, timeOffset]);

  useEffect(() => {
    const fetchExerciseData = async () => {
      if (!userLoggedIn || !currentUser?.uid) return;
      
      try {
        // Calculate the current date range
        const { start: currentStart, end: currentEnd } = calculateDateRange();
        
        // Calculate the previous period date range for comparison
        const previousPeriodEnd = new Date(currentStart);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
        
        const daysDiff = Math.round((currentEnd - currentStart) / (1000 * 60 * 60 * 24));
        const previousPeriodStart = new Date(previousPeriodEnd);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - daysDiff);
        
        
        // Query for exercise logs
        const exerciseLogsQuery = query(
          collection(db, "exercise_logs"),
          where("userId", "==", currentUser.uid),
          where("date", ">=", format(previousPeriodStart, "yyyy-MM-dd")),
          where("date", "<=", format(currentEnd, "yyyy-MM-dd")),
          orderBy("date", "desc")
        );
  
        const unsubscribe = onSnapshot(exerciseLogsQuery, (snapshot) => {
          const exercises = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            // Calculate total volume (weight * reps * sets)
            totalVolume: doc.data().sets?.reduce((total, set) => {
              const weight = Number(set.weight || 0);
              const reps = Number(set.reps || 0);
              return total + (weight * reps);
            }, 0) || 0
          }));
          
          setExerciseData(exercises);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error("Error fetching exercise data:", error);
      }
    };
  
    fetchExerciseData();
  }, [currentUser, userLoggedIn, timeframe, timeOffset, calculateDateRange]);
  
  // Navigation functions
  const goToPreviousPeriod = () => setTimeOffset(prev => prev - 1);
  const goToNextPeriod = () => timeOffset < 0 && setTimeOffset(prev => prev + 1);
  const resetToCurrentPeriod = () => setTimeOffset(0);

  // Date range display function
  const getDateRangeDisplay = () => {
    if (!dateRange.start || !dateRange.end) return "";
    
    const { start, end } = dateRange;
    
    switch (timeframe) {
      case "day":
        return format(start, "MMMM d, yyyy");
      case "week":
      case "month":
        return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
      case "6 months":
      case "year":
        return `${format(start, "MMM yyyy")} - ${format(end, "MMM yyyy")}`;
      default:
        return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    }
  };

  // Check if user is authenticated
  if (!userLoggedIn) return null;

  // Time period options in Apple Health style
  const timeOptions = [
    { value: "day", label: "D" },
    { value: "week", label: "W" },
    { value: "month", label: "M" },
    { value: "6 months", label: "6M" },
    { value: "year", label: "Y" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800">
      <Navbar />
      <main className="flex-1 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto px-4 py-8">
       <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Health Summary
            </h1>
            {/* Apple-style time selector */}
            <div className="flex items-center justify-center  bg-white dark:bg-zinc-800 rounded-full p-1 shadow-sm ">
              {timeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setTimeframe(option.value);
                    setTimeOffset(0); // Reset offset when changing timeframe
                  }}
                  className={` px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                    timeframe === option.value 
                      ? 'bg-blue-500 text-white shadow' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Date Range Navigation */}
          <div className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm">
            <button 
              onClick={goToPreviousPeriod}
              className="flex items-center px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            
            <button 
              onClick={resetToCurrentPeriod}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                timeOffset === 0
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              {getDateRangeDisplay()}
              {timeOffset !== 0 && (
                <span className="ml-1 text-xs font-normal">
                  ({timeOffset < 0 ? `${Math.abs(timeOffset)} ${timeframe}${Math.abs(timeOffset) > 1 ? 's' : ''} ago` : 'current'})
                </span>
              )}
            </button>
            
            <button 
              onClick={goToNextPeriod}
              disabled={timeOffset >= 0}
              className={`flex items-center px-3 py-1 text-sm font-medium rounded-md ${
                timeOffset >= 0 
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          {/* Loading or Content */}
          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-white dark:bg-zinc-800 p-1 rounded-lg shadow-sm ">
                <TabsTrigger className="rounded-md " value="nutrition">Nutrition</TabsTrigger>
                <TabsTrigger className="rounded-md"  value="fitness">Fitness</TabsTrigger>
       
              </TabsList>
              
              <TabsContent value="nutrition" className="space-y-6">
                <NutritionMetrics 
                  foodData={foodData} 
                  timeframe={timeframe} 
                  dateRange={dateRange}
                  userMetrics={userMetrics}
                />
              </TabsContent>
              
              <TabsContent value="fitness" className="space-y-6">
                <WorkoutMetrics 
                  exerciseData={exerciseData} 
                  timeframe={timeframe} 
                  dateRange={dateRange}
                  userMetrics={userMetrics}
                />
              </TabsContent>
              
            
            </Tabs>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}



