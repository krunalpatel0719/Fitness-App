// src/app/dashboard/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { MealButton } from "@/components/MealButton";
import { ProgressBar } from "@/components/ProgressBar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricsForm } from "@/components/MetricsForm";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";




import { doc, getDoc, setDoc, collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Dashboard() {
    const router = useRouter();
    const { userLoggedIn, currentUser } = useAuth();
    const [userMetrics, setUserMetrics] = useState(null);
    const [foodEntries, setFoodEntries] = useState([]);
    const [newFood, setNewFood] = useState('');
    const [caloriesConsumed, setCaloriesConsumed] = useState(0);
    const [loadingFood, setLoadingFood] = useState(false);
    const [loadingFoodLog, setLoadingFoodLog] = useState(true);

    const [selectedMeal, setSelectedMeal] = useState('breakfast');
    const [showAddFood, setShowAddFood] = useState(false);

    
    useEffect(() => {
        if (!userLoggedIn) {
          router.push("/signin");
          return;
        }
    
        // Load user metrics
        const loadMetrics = async () => {
          const docRef = doc(db, "user_metrics", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserMetrics(docSnap.data());
          }
        };
    
        // Load food entries
        const q = query(
          collection(db, "food_logs"),
          where("userId", "==", currentUser?.uid),
          where("date", "==", format(new Date(), 'yyyy-MM-dd'))
        );
    
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const entries = [];
          let total = 0;
          querySnapshot.forEach((doc) => {
            entries.push({ id: doc.id, ...doc.data() });
            total += doc.data().calories;
          });
          setFoodEntries(entries);
          setCaloriesConsumed(total);
          setLoadingFoodLog(false);
        });
    
        loadMetrics();
    
        return () => unsubscribe();
      }, [currentUser, userLoggedIn, router]);



  const handleSaveMetrics = async (metrics) => {
    try {
      const bmr = calculateCalories(metrics);
      await setDoc(doc(db, "user_metrics", currentUser.uid), {
        ...metrics,
        dailyCalories: bmr,
        userId: currentUser.uid,
        createdAt: new Date()
      });
      setUserMetrics({ ...metrics, dailyCalories: bmr});
    } catch (error) {
      console.error("Error saving metrics:", error);
    }
  };

  
  const calculateCalories = (metrics) => {
    // Convert weight from lbs to kg
    const weightKg = parseFloat(metrics.weight) * 0.453592;
    // Convert height from feet/inches to centimeters
    const heightCm = (parseFloat(metrics.feet) * 30.48) + (parseFloat(metrics.inches) * 2.54);
    
    // Mifflin-St Jeor Equation (metric)
    let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * parseFloat(metrics.age));
    bmr += metrics.gender === 'male' ? 5 : -161;
  
    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      lightlyActive: 1.375,
      active: 1.55,
      veryActive: 1.725
    };
  
    const tdee = bmr * activityMultipliers[metrics.activityLevel];
  
    // Adjust for goal: subtract 500 for weight loss, add 500 for weight gain
    switch (metrics.goal) {
      case 'lose': return Math.round(tdee - 500);
      case 'gain': return Math.round(tdee + 500);
      default: return Math.round(tdee);
    }
  };
  const handleAddFood = async (e) => {
    e.preventDefault();
    setLoadingFood(true);
    try {
      await addDoc(collection(db, "food_logs"), {
        userId: currentUser.uid,
        foodName: newFood,
        calories: 250,
        servingSize: '1 serving',
        mealType: selectedMeal,
        date: format(new Date(), 'yyyy-MM-dd'),
        createdAt: new Date()
      });
      setNewFood('');
      setShowAddFood(false);
    } catch (error) {
      console.error("Error adding food:", error);
    }
    setLoadingFood(false);
  };
  if (!userLoggedIn) return null;

   return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-zinc-900">
      <Navbar />
      <main className="flex-1 flex justify-center p-4 md:p-8">
        <div className="container max-w-4xl space-y-6">
          {!userMetrics ? (
            <div className="text-center py-12">
              <Skeleton className="h-12 w-[200px] mx-auto mb-4" />
              <Skeleton className="h-[400px] w-full max-w-2xl mx-auto" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                
                        <Card className="dark:bg-zinc-800">
                        <CardHeader>
                        <CardTitle className="dark:text-white">Daily Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <ProgressBar 
                            current={caloriesConsumed} 
                            goal={userMetrics.dailyCalories} 
                        />
                        </CardContent>
                 </Card>
                <Card className="dark:bg-zinc-800">
                  <CardHeader>
                    <CardTitle className="dark:text-white text-lg">Daily Goal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold dark:text-blue-400">
                      {userMetrics.dailyCalories}
                      <span className="text-sm ml-2 dark:text-gray-300">kcal</span>
                    </div>
                  </CardContent>
                </Card>

                {/* <Card className="dark:bg-zinc-800">
                  <CardHeader>
                    <CardTitle className="dark:text-white text-lg">Consumed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold dark:text-green-400">
                      {caloriesConsumed}
                      <span className="text-sm ml-2 dark:text-gray-300">kcal</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-zinc-800">
                  <CardHeader>
                    <CardTitle className="dark:text-white text-lg">Remaining</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold dark:text-purple-400">
                      {userMetrics.dailyCalories - caloriesConsumed}
                      <span className="text-sm ml-2 dark:text-gray-300">kcal</span>
                    </div>
                  </CardContent>
                  </Card> */}
             
              </div>
             
              <Card className="dark:bg-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="dark:text-white">Food Diary</CardTitle>
                  <div className="flex gap-2">
                    <MealButton 
                    meal="breakfast" 
                    selected={selectedMeal} 
                    onClick={() => setSelectedMeal('breakfast')}
                    />
                    <MealButton
                    meal="lunch"
                    selected={selectedMeal}
                    onClick={() => setSelectedMeal('lunch')}
                    />
                    <MealButton
                    meal="dinner"
                    selected={selectedMeal}
                    onClick={() => setSelectedMeal('dinner')}
                    />
                    <MealButton
                    meal="snack"
                    selected={selectedMeal}
                    onClick={() => setSelectedMeal('snack')}
                    />
                </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="dark:text-gray-300">Meal</TableHead>
                        <TableHead className="dark:text-gray-300">Food</TableHead>
                        <TableHead className="dark:text-gray-300">Serving</TableHead>
                        <TableHead className="dark:text-gray-300 text-right">Calories</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingFoodLog ? (
                        Array(3).fill(0).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[60px] ml-auto" /></TableCell>
                          </TableRow>
                        ))
                      ) : foodEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="dark:text-gray-100">Breakfast</TableCell>
                          <TableCell className="dark:text-gray-100">{entry.foodName}</TableCell>
                          <TableCell className="dark:text-gray-100">{entry.servingSize}</TableCell>
                          <TableCell className="dark:text-gray-100 text-right">{entry.calories}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <form onSubmit={handleAddFood} className="flex gap-2 w-full">
                    <Input
                      placeholder="Add food item..."
                      value={newFood}
                      onChange={(e) => setNewFood(e.target.value)}
                      className="flex-1 dark:border-zinc-600"
                    />
                    <Button type="submit" disabled={loadingFood}>
                      {loadingFood ? 'Adding...' : 'Add'}
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}