// src/app/dashboard/page.jsx



"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { MetricsForm } from "@/components/MetricsForm";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { format } from "date-fns";

import { MetricsSection } from "@/components/MetricsSection";
import { FoodDiary } from "@/components/FoodDiary";

async function searchFood(query) {
  try {
    const response = await fetch(
      `/api/foods?query=${encodeURIComponent(query)}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unknown API error");
    }

    return data.foods;
  } catch (error) {
    console.error("Search failed:", error);
    throw error;
  }
}

export default function Dashboard() {
  const router = useRouter();
  const { userLoggedIn, currentUser } = useAuth();

  const [userMetrics, setUserMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [foodEntries, setFoodEntries] = useState([]);
  const [newFood, setNewFood] = useState("");
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [loadingFoodLog, setLoadingFoodLog] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isNutritionLabelOpen, setIsNutritionLabelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);



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

    // Realtime listener for today's food log based on selectedDate
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const q = query(
      collection(db, "food_logs"),
      where("userId", "==", currentUser.uid),
      where("date", "==", dateStr),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const entries = [];
        let total = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          entries.push({ id: doc.id, ...data });
          total += Number(data.calories) || 0;
        });
        setFoodEntries(entries);
        setCaloriesConsumed(Math.round(total));
        setLoadingFoodLog(false);
      },
      (error) => {
        console.error("Food log error:", error);
        setLoadingFoodLog(false);
      }
    );

    if (currentUser?.uid) loadMetrics();

    return () => unsubscribe();
  }, [currentUser, userLoggedIn, selectedDate]);

  // (Helper functions and handlers such as calculateCalories, formatServingDisplay,
  // handleFoodSelection, handleAddFood, handleQuickAdd, handleEditFood,
  // handleAddFoodWithServing, handleDeleteFood, handleNutritionLabelClose, and handleSearch
  // remain unchanged; include them here as in your existing code.)


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

    // Realtime listener for today's food log
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const q = query(
      collection(db, "food_logs"),
      where("userId", "==", currentUser.uid),
      where("date", "==", dateStr),
      orderBy("createdAt", "desc")
    );
  

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const entries = [];
        let total = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          entries.push({ id: doc.id, ...data });
          total += Number(data.calories) || 0;
        });
        setFoodEntries(entries);
        setCaloriesConsumed(Math.round(total)); 
        setLoadingFoodLog(false);
      },
      (error) => {
        console.error("Food log error:", error);
        setLoadingFoodLog(false);
      }
    );

    if (currentUser?.uid) {
      loadMetrics();
    }
    return () => unsubscribe();
  }, [currentUser, userLoggedIn, selectedDate]);

  const calculateCalories = (metrics) => {

    const weightKg = parseFloat(metrics.weight) * 0.453592;
    const heightCm = parseFloat(metrics.feet) * 30.48 + parseFloat(metrics.inches) * 2.54;

    // Mifflin-St Jeor Equation (metric)
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * parseFloat(metrics.age);
    bmr += metrics.gender === "male" ? 5 : -161;

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      lightlyActive: 1.375,
      active: 1.55,
      veryActive: 1.725,
    };

    const tdee = bmr * activityMultipliers[metrics.activityLevel];

    // Adjust for goal: subtract 500 for weight loss, add 500 for weight gain
    
    switch (metrics.goal) {
      case "lose":
        return Math.round(tdee - 500);
      case "gain":
        return Math.round(tdee + 500);
      default:
        return Math.round(tdee);
    }
  };


  const formatServingDisplay = (amount, type) => {
    if (!amount || !type) return "";
    
    const numericAmount = parseFloat(amount);
    const nonPluralUnits = ['g', 'oz', 'ml', 'kg', 'lb', 'mg', 'dl', 'cl'];
  
    // Helper function to check if word should be pluralized
    const shouldPluralize = (word) => {
      const endsWithNonPluralUnit = nonPluralUnits.some(unit => 
        word.toLowerCase().endsWith(unit.toLowerCase())
      );
      return !endsWithNonPluralUnit && numericAmount > 1 && !word.endsWith('s');
    };
  
    // Helper function to pluralize text
    const pluralize = (text) => {
      const words = text.trim().split(' ');
      const lastWord = words[words.length - 1];
      
      if (shouldPluralize(lastWord)) {
        words[words.length - 1] = `${lastWord}s`;
      }
      return words.join(' ');
    };
  
    // Handle "serving" case
    if (type.toLowerCase().includes('serving')) {
      return `${numericAmount} ${numericAmount > 1 ? 'Servings' : 'Serving'}`;
    }
  
    // Check if type starts with a number (e.g., "1 cup", "2 slices")
    const typeMatch = type.match(/^(\d+(\.\d+)?)\s+(.+)$/);
    if (typeMatch) {
      const [_, typeAmount, __, description] = typeMatch;
      const totalAmount = numericAmount * parseFloat(typeAmount);
  
      // Handle text with parentheses
      if (description.includes('(')) {
        const [mainText, parenthetical] = description.split(/\s*(\(.*\))/);
        return `${totalAmount} ${pluralize(mainText)} ${parenthetical}`;
      }
  
      // Handle standard text
      return `${totalAmount} ${pluralize(description)}`;
    }
  
    // Handle type without leading number
    if (type.includes('(')) {
      const [mainText, parenthetical] = type.split(/\s*(\(.*\))/);
      return `${numericAmount} ${pluralize(mainText)} ${parenthetical}`;
    }
  
    // Handle basic cases
    return `${numericAmount} ${pluralize(type)}`;
  };

  const handleFoodSelection = async (foodId) => {
    try {
      const response = await fetch(`/api/foods?id=${foodId}`);
      if (!response.ok) throw new Error("Food lookup failed");
      const data = await response.json();
      
      if (data.food) {
        setSelectedFood({
          ...data.food,
          
          servingAmount: "1",
          servingType: data.food.servings[0]?.description || "serving",
          mealType: selectedMeal
        });
        setIsNutritionLabelOpen(true);
      }
    } catch (error) {
      console.error("Food selection error:", error);
      alert("Failed to load food details");
    }
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    if (!newFood.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchFood(newFood.trim());
      if (results && results.food) {
        console.log(results.food);
        console.log(results.servings);
        setSearchResults(results.food); // Set the raw food array
        setTotalPages(Math.ceil(parseInt(results.total_results) / 10));
        setCurrentPage(parseInt(results.page_number));
      }
    } catch (error) {
      console.error("Search error:", error);
      alert(`Search failed: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  
  
  const handleAddFoodWithServing = async (foodData) => {
    try {
      await addDoc(collection(db, "food_logs"), {
        userId: currentUser.uid,
        foodName: foodData.food_name,
        food_id: foodData.food_id,
        calories: foodData.calories,
        protein: foodData.protein,
        carbs: foodData.carbs,
        fat: foodData.fat,
        servingSize: foodData.servingType,
        servingAmount: foodData.servingAmount,
        servingType: foodData.servingType,
        mealType: foodData.mealType,
        baseCalories: foodData.baseCalories,
        baseProtein: foodData.baseProtein,
        baseCarbs: foodData.baseCarbs,
        baseFat: foodData.baseFat,
        baseServingUnit: foodData.baseServingUnit,
        baseServingAmount: foodData.baseServingAmount,
        date: format(selectedDate, "yyyy-MM-dd"),
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Add food error:", error);
      alert("Failed to save food entry");
    }
  };
  const handleQuickAdd = async (food, serving) => {
    try {
      const calories = Math.round(Number(serving.calories)) || 0;
      const protein = Math.round(Number(serving.protein)) || 0;
      const carbs = Math.round(Number(serving.carbs)) || 0;
      const fat = Math.round(Number(serving.fat)) || 0;
  
      const foodLogEntry = {
        userId: currentUser.uid,
        foodName: food.food_name,
        food_id: food.food_id, 
        baseCalories: calories,
        calories: calories,
        protein: protein,
        carbs: carbs,
        fat: fat,
        servingSize: formatServing(serving),
        servingAmount: "1",
        servingType: serving.description,
        mealType: selectedMeal,
        date: format(selectedDate, "yyyy-MM-dd"),
        createdAt: new Date(),
      };
  
      await addDoc(collection(db, "food_logs"), foodLogEntry);
      // setSearchResults([]);
      // setNewFood("");
    } catch (error) {
      console.error("Quick add error:", error);
      alert("Failed to add food item");
    }
  };


  // const handleAddFoodWithServing = async (foodData) => {
  //   try {
  //     await addDoc(collection(db, "food_logs"), {
  //       userId: currentUser.uid,
  //       foodName: foodData.food_name,
  //       food_id: foodData.food_id, 
  //       calories: foodData.calories,
  //       protein: foodData.protein,
  //       carbs: foodData.carbs,
  //       fat: foodData.fat,
  //       servingSize: foodData.servingType,
  //       servingAmount: foodData.servingAmount,
  //       servingType: foodData.servingType,
  //       mealType: foodData.mealType,
  //       baseCalories: foodData.baseCalories,
  //       baseProtein: foodData.baseProtein,
  //       baseCarbs: foodData.baseCarbs,
  //       baseFat: foodData.baseFat,
  //       date: format(selectedDate, "yyyy-MM-dd"),
  //       createdAt: new Date()
  //     });
  //   } catch (error) {
  //     console.error("Add food error:", error);
  //     alert("Failed to save food entry");
  //   }
  // };
  
  const handleEditFood = async (updatedFood) => {
    try {
      // Get the selected serving from the servings array
      const selectedServing = updatedFood.servings.find(s => 
        s.description === updatedFood.servingType
      ) || {
        // Fallback values if no matching serving is found
        calories: updatedFood.baseCalories,
        protein: updatedFood.baseProtein,
        carbs: updatedFood.baseCarbs,
        fat: updatedFood.baseFat,
        description: updatedFood.servingType
      };
  
      const updatedData = {
        foodName: updatedFood.food_name,
        food_id: updatedFood.food_id,
        calories: Math.round(Number(selectedServing.calories) * parseFloat(updatedFood.servingAmount)),
        protein: Math.round(Number(selectedServing.protein) * parseFloat(updatedFood.servingAmount)),
        carbs: Math.round(Number(selectedServing.carbs) * parseFloat(updatedFood.servingAmount)),
        fat: Math.round(Number(selectedServing.fat) * parseFloat(updatedFood.servingAmount)),
        servingAmount: updatedFood.servingAmount,
        servingType: updatedFood.servingType,
        mealType: updatedFood.mealType,
        updatedAt: new Date(),
        // Store base values
        baseCalories: selectedServing.calories,
        baseProtein: selectedServing.protein,
        baseCarbs: selectedServing.carbs,
        baseFat: selectedServing.fat,
        baseServingUnit: selectedServing.metric_serving_unit || selectedServing.description,
        baseServingAmount: selectedServing.metric_serving_amount || 1
      };
  
      await updateDoc(doc(db, "food_logs", updatedFood.id), updatedData);
      setSelectedFood(null);
      setIsNutritionLabelOpen(false);
    } catch (error) {
      console.error("Error updating food:", error);
    }
  };

  
  const handleSaveMetrics = async (metrics) => {
    try {
      const dailyCalories = calculateCalories(metrics);
      await setDoc(doc(db, "user_metrics", currentUser.uid), {
        ...metrics,
        dailyCalories,
        userId: currentUser.uid,
        createdAt: new Date(),
      });
      setUserMetrics({ ...metrics, dailyCalories });
    } catch (error) {
      console.error("Error saving metrics:", error);
    }
  };
 

  const handleDeleteFood = async () => {
    if (!selectedFood?.id) return;
    try {
      await deleteDoc(doc(db, "food_logs", selectedFood.id));
      setSelectedFood(null);
      setIsNutritionLabelOpen(false);
    } catch (error) {
      console.error("Error deleting food:", error);
    }
  };

  const handleNutritionLabelClose = () => {
    setIsNutritionLabelOpen(false);
    setSelectedFood(null);
  };
  const handleSearch = async (page = 1) => {
    if (!newFood.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/foods?query=${encodeURIComponent(newFood)}&page=${page}`
      );
      const data = await response.json();

      if (data.foods?.food) {
        setSearchResults(data.foods.food);
        setTotalPages(data.foods.total_pages);
        setCurrentPage(data.foods.page_number);
      }
    } catch (error) {
      console.error("Search error:", error);
      alert(`Search failed: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };
  
  const formatServing = (serving) => {
    if (!serving) return "";
    
    // Prioritize metric information
    const metric = `${serving.metric_serving_amount || ''} ${serving.metric_serving_unit || ''}`.trim();
    const description = serving.description || '';
  
    // If description contains metric info, just use description
    if (description.toLowerCase().includes(metric.toLowerCase())) {
      return description;
    }
  
    // Combine description and metric if both exist
    return [description, metric].filter(Boolean).join(" - ");
  };
  

  if (!userLoggedIn) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-zinc-900">
      <Navbar />
      <main className="flex-1 p-4 md:p-8">
        <div className="container max-w-4xl space-y-6 mx-auto">
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
              <MetricsSection
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                userMetrics={userMetrics}
                caloriesConsumed={caloriesConsumed}
              />
              <FoodDiary
                selectedMeal={selectedMeal}
                setSelectedMeal={setSelectedMeal}
                foodEntries={foodEntries}
                loadingFoodLog={loadingFoodLog}
                formatServingDisplay={formatServingDisplay}
                searchResults={searchResults}
                setSearchResults={setSearchResults}
                newFood={newFood}
                setNewFood={setNewFood}
                isSearching={isSearching}
                handleAddFood={handleAddFood}
                handleQuickAdd={handleQuickAdd}
                handleAddFoodWithServing={handleAddFoodWithServing}
                handleFoodSelection={handleFoodSelection}
                currentPage={currentPage}
                totalPages={totalPages}
                handleSearch={handleSearch}
                isNutritionLabelOpen={isNutritionLabelOpen}
                setIsNutritionLabelOpen = {setIsNutritionLabelOpen}
                selectedFood={selectedFood}
                setSelectedFood={setSelectedFood}
                handleNutritionLabelClose={handleNutritionLabelClose}
                handleEditFood={handleEditFood}
                handleDeleteFood={handleDeleteFood}
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