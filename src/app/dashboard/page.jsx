// src/app/dashboard/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { MealButton } from "@/components/MealButton";
import { ProgressBar } from "@/components/ProgressBar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricsForm } from "@/components/MetricsForm";
import { NutritionLabel } from "@/components/NutritionLabel";
import { Skeleton } from "@/components/ui/skeleton";
import { CiCircleInfo } from "react-icons/ci";
import { FiX } from "react-icons/fi";


// Commenting out OpenFoodFacts import for fallback:
// import { searchFoodProducts } from "@/lib/openfoodfacts";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { format, subDays, addDays } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/firebase";

// New helper function that calls your FatSecret API route

// async function searchFood(query) {
//     try {
//       const response = await fetch(`/api/foods?query=${encodeURIComponent(query)}`);
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Unknown API error');
//       }

//       // Handle FatSecret's response format
//       console.log(response)
//       console.log(data)
//       if (data.foods && data.foods.food) {
//         return data.foods.food.map((food) => ({
//           id: food.food_id,
//           // Use a fallback if food.food_name is undefined
//           name: food.food_name || "Unknown Food",
//           // Parse calories from description if available
//           calories: food.food_description && food.food_description.match(/(\d+)kcal/)?.[1]
//                     ? Number(food.food_description.match(/(\d+)kcal/)[1])
//                     : 0,
//           servingSize: (food.serving_sizes && food.serving_sizes.serving && food.serving_sizes.serving.metric) || "100g"
//         }));
//       }

//       return [];
//     } catch (error) {
//       console.error("Search failed:", error);
//       throw error;
//     }
//   }

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
  const [loadingFood, setLoadingFood] = useState(false);
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

  // const formatServingDisplay = (amount, type) => {
  //   if (!amount || !type) return "";
    
  //   const numericAmount = parseFloat(amount);
    
  //   const nonPluralUnits = ['g', 'oz', 'ml', 'kg', 'lb', 'mg', 'dl', 'cl'];
    
  //   if (type.toLowerCase().includes('serving')) {
  //     return `${numericAmount} ${numericAmount > 1 ? 'Servings' : 'Serving'}`;
  //   }
  
  //   const typeMatch = type.match(/^(\d+(\.\d+)?)\s+(.+)$/);
  //   if (typeMatch) {
  //     const [_, typeAmount, __, description] = typeMatch;
  //     const totalAmount = numericAmount * parseFloat(typeAmount);
  
  //     const hasParentheses = description.includes('(');
  //     if (hasParentheses) {
  //       const [mainText, parenthetical] = description.split(/\s*(\(.*\))/);
  //       const words = mainText.trim().split(' ');
  //       const lastWord = words[words.length - 1];
  
  //       const endsWithNonPluralUnit = nonPluralUnits.some(unit => 
  //         lastWord.toLowerCase().endsWith(unit.toLowerCase())
  //       );
  
  //       if (!endsWithNonPluralUnit && totalAmount > 1 && !lastWord.endsWith('s')) {
  //         words[words.length - 1] = `${lastWord}s`;
  //       }
  //       return `${totalAmount} ${words.join(' ')} ${parenthetical}`;
  //     }
  //     // Handle non-parenthetical cases as before
  //     const endsWithNonPluralUnit = nonPluralUnits.some(unit => 
  //       description.toLowerCase().endsWith(unit.toLowerCase())
  //     );
  
  //     if (endsWithNonPluralUnit) {
  //       return `${totalAmount} ${description}`;
  //     }
  
  //     const words = description.split(' ');
  //     const lastWord = words[words.length - 1];
      
  //     if (totalAmount > 1 && !lastWord.endsWith('s')) {
  //       words[words.length - 1] = `${lastWord}s`;
  //     }
  //     return `${totalAmount} ${words.join(' ')}`;
  //   }
  
  //   // Handle simple cases without numbers in the type
  //   const hasParentheses = type.includes('(');
  //   if (hasParentheses) {
  //     const [mainText, parenthetical] = type.split(/(\(.*\))/);
  //     const words = mainText.trim().split(' ');
  //     const lastWord = words[words.length - 1];
  
  //     const endsWithNonPluralUnit = nonPluralUnits.some(unit => 
  //       lastWord.toLowerCase().endsWith(unit.toLowerCase())
  //     );
  
  //     if (!endsWithNonPluralUnit && numericAmount > 1 && !lastWord.endsWith('s')) {
  //       words[words.length - 1] = `${lastWord}s`;
  //     }
  //     return `${numericAmount} ${words.join(' ')} + ${parenthetical}`;
  //   }
  
  //   // Handle remaining cases
  //   const endsWithNonPluralUnit = nonPluralUnits.some(unit => 
  //     type.toLowerCase().endsWith(unit.toLowerCase())
  //   );
  
  //   if (endsWithNonPluralUnit) {
  //     return `${numericAmount} ${type}`;
  //   }
  
  //   const words = type.split(' ');
  //   const lastWord = words[words.length - 1];
    
  //   if (numericAmount > 1 && !lastWord.endsWith('s')) {
  //     words[words.length - 1] = `${lastWord}s`;
  //   }
  
  //   return `${numericAmount} ${type}`;
  // };
  

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
        date: format(selectedDate, "yyyy-MM-dd"),
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Add food error:", error);
      alert("Failed to save food entry");
    }
  };
  
  const handleEditFood = async (updatedFood) => {
    try {
      const selectedServing = updatedFood.servings.find(s => 
        s.description === updatedFood.servingType
      );
  
      const updatedData = {
        foodName: updatedFood.food_name,
        food_id: updatedFood.food_id, // Add food_id
        calories: Math.round(Number(selectedServing.calories) * parseFloat(updatedFood.servingAmount)),
        protein: Math.round(Number(selectedServing.protein) * parseFloat(updatedFood.servingAmount)),
        carbs: Math.round(Number(selectedServing.carbs) * parseFloat(updatedFood.servingAmount)),
        fat: Math.round(Number(selectedServing.fat) * parseFloat(updatedFood.servingAmount)),
        servingAmount: updatedFood.servingAmount,
        servingType: updatedFood.servingType,
        mealType: updatedFood.mealType,
        updatedAt: new Date(),
        baseCalories: selectedServing.calories,
        baseProtein: selectedServing.protein,
        baseCarbs: selectedServing.carbs,
        baseFat: selectedServing.fat
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
  
  // const handleFoodSelection = async (foodId) => {
  //   if (!foodId) {
  //     console.error("No food ID provided");
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`/api/foods?id=${foodId}`);
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const data = await response.json();
  //     if (data.food) {
  //       setSelectedFood(data.food);
  //       setIsNutritionLabelOpen(true);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching food details:", error);
  //   }
  // };

  
  
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

  const progressPercentage =
    userMetrics && userMetrics.dailyCalories
      ? Math.min((caloriesConsumed / userMetrics.dailyCalories) * 100, 100)
      : 0;

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
            <Card className="dark:bg-zinc-800">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                      className="h-8 w-20 text-xs sm:text-sm sm:h-auto sm:w-auto dark:hover:bg-zinc-400 dark:hover:border-zinc-400 dark:text-gray-800 hover:text-white"
                      >
                      Previous Day
                    </Button>
                    <div className="flex flex-col items-center">
                      <span className="text-lg md:text-2xl font-semibold dark:text-white">
                        {format(selectedDate, "EEEE")}
                      </span>
                      <span className="text-sm md:text-md dark:text-gray-300">
                        {format(selectedDate, "MMMM d, yyyy")}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                      className="h-8 w-20 text-xs sm:text-sm sm:h-auto sm:w-auto dark:hover:bg-zinc-400 dark:hover:border-zinc-400 dark:text-gray-800 hover:text-white"
                    >
                      Next Day
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <div className="grid gap-4 md:grid-cols-2">
              
                <Card className="dark:bg-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-gray-800 dark:text-white text-lg md:text-xl">
                      Daily Goal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-400 md:text-4xl">
                      {userMetrics.dailyCalories}
                      <span className="text-sm ml-2 dark:text-gray-300 md:text-base">
                        kcal
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="dark:bg-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-gray-800 dark:text-white md:text-xl">
                      Daily Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressBar
                      current={caloriesConsumed}
                      goal={userMetrics.dailyCalories}
                    />
                  </CardContent>
                </Card>
              </div>

              <Card className="dark:bg-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-gray-800 dark:text-white text-lg md:text-xl">
                    Food Diary
                  </CardTitle>
                  <div className="flex gap-2">
                    <MealButton
                      meal="breakfast"
                      selected={selectedMeal}
                      onClick={() => setSelectedMeal("breakfast")}
                    />
                    <MealButton
                      meal="lunch"
                      selected={selectedMeal}
                      onClick={() => setSelectedMeal("lunch")}
                    />
                    <MealButton
                      meal="dinner"
                      selected={selectedMeal}
                      onClick={() => setSelectedMeal("dinner")}
                    />
                    <MealButton
                      meal="snack"
                      selected={selectedMeal}
                      onClick={() => setSelectedMeal("snack")}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className = "">
                      <TableRow className="hover:bg-transparent text-xs ">
                        <TableHead className="text-gray-800 dark:text-gray-300 text-center md:text-lg">
                          Meal
                        </TableHead>
                        <TableHead className="text-gray-800 dark:text-gray-300 text-center md:text-lg">
                          Food
                        </TableHead>
                        <TableHead className="text-gray-800 dark:text-gray-300 text-center md:text-lg">
                          Serving
                        </TableHead>
                        <TableHead className="text-gray-800 dark:text-gray-300 text-center md:text-lg">
                          Calories
                        </TableHead>
                        <TableHead className="text-gray-800 dark:text-gray-300 text-center md:text-lg">
                          Info
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="hover:bg-transparent">
                      {loadingFoodLog
                        ? Array(3)
                            .fill(0)
                            .map((_, i) => (
                              <TableRow key={i}>
                                <TableCell>
                                  <Skeleton className="h-4 w-[80px]" />
                                </TableCell>
                                <TableCell>
                                  <Skeleton className="h-4 w-[120px]" />
                                </TableCell>
                                <TableCell> 
                                  <Skeleton className="h-4 w-[80px]" />
                                </TableCell>
                                <TableCell>
                                  <Skeleton className="h-4 w-[60px] ml-auto" />
                                </TableCell>
                                <TableCell>
                                  <Skeleton className="h-4 w-[40px] ml-auto" />
                                </TableCell>
                              </TableRow>
                            ))
                        : foodEntries.map((entry) => (
                            <TableRow
                              className="hover:bg-transparent"
                              key={entry.id}
                            >
                              <TableCell className="dark:text-gray-100 md:text-lg capitalize text-center">
                                {entry.mealType}
                              </TableCell>
                              <TableCell className="dark:text-gray-100 md:text-lg text-center">
                                {entry.foodName}
                              </TableCell>
                              <TableCell className="dark:text-gray-100 md:text-lg text-center capitalize">
                                 {formatServingDisplay(entry.servingAmount, entry.servingType)}
                              </TableCell>
                              <TableCell className="dark:text-gray-100 md:text-lg text-center">
                                {entry.calories}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center items-center h-full">
                                <CiCircleInfo
                                  className="h-5 w-5 dark:text-gray-100 md:h-7 md:w-7 cursor-pointer hover:text-blue-500 transition-colors"
                                  onClick={async () => {
                                    try {
                                      if (!entry.food_id) {
                                        // If no food_id, just show the existing entry data
                                        setSelectedFood({
                                          id: entry.id,
                                          food_name: entry.foodName,
                                          servingAmount: entry.servingAmount,
                                          servingType: entry.servingType,
                                          mealType: entry.mealType,
                                          calories: entry.calories,
                                          protein: entry.protein,
                                          carbs: entry.carbs,
                                          fat: entry.fat,
                                          servings: [{
                                            description: entry.servingType,
                                            calories: entry.baseCalories || entry.calories,
                                            protein: entry.baseProtein || entry.protein,
                                            carbs: entry.baseCarbs || entry.carbs,
                                            fat: entry.baseFat || entry.fat
                                          }]
                                        });
                                        setIsNutritionLabelOpen(true);
                                        return;
                                      }

                                      // Fetch fresh food data when clicking info icon
                                      const response = await fetch(`/api/foods?id=${entry.food_id}`);
                                      if (!response.ok) throw new Error("Food lookup failed");
                                      const data = await response.json();
                                      
                                      if (data.food) {
                                        setSelectedFood({
                                          ...data.food,
                                          id: entry.id,
                                          food_id: entry.food_id,
                                          servingAmount: entry.servingAmount,
                                          servingType: entry.servingType,
                                          mealType: entry.mealType,
                                          calories: entry.calories,
                                          protein: entry.protein,
                                          carbs: entry.carbs,
                                          fat: entry.fat
                                        });
                                        setIsNutritionLabelOpen(true);
                                      }
                                    } catch (error) {
                                      console.error("Error fetching food details:", error);
                                    
                                      setSelectedFood({
                                        id: entry.id,
                                        food_name: entry.foodName,
                                        servingAmount: entry.servingAmount,
                                        servingType: entry.servingType,
                                        mealType: entry.mealType,
                                        calories: entry.calories,
                                        protein: entry.protein,
                                        carbs: entry.carbs,
                                        fat: entry.fat,
                                        servings: [{
                                          description: entry.servingType,
                                          calories: entry.baseCalories || entry.calories,
                                          protein: entry.baseProtein || entry.protein,
                                          carbs: entry.baseCarbs || entry.carbs,
                                          fat: entry.baseFat || entry.fat
                                        }]
                                      });
                                      setIsNutritionLabelOpen(true);
                                    }
                                  }}
                                />

                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                  {searchResults.length > 0 && (
                    <div className="mt-4 p-4 bg-white dark:bg-zinc-700 rounded-lg">
                      <div className = 'flex justify-between items-center'>  
                      <h3 className="text-lg font-bold mb-2 dark:text-white">
                        Search Results
                      </h3>
                      
                        <FiX 
                          onClick={(e) => {
                                  e.stopPropagation();
                                  setSearchResults([]);
                                  setNewFood("");
                                }} 
                          className="mb-4 mr-2 h-5 w-5 dark:text-white hover:text-red-500" 
                          />
                        </div>
                      <ul className="space-y-2">
                        {searchResults.map((food) => {
                          const defaultServing =
                            food.servings.find((s) => s.default) ||
                            food.servings[0];
                          return (
                            <li
                              key={food.food_id}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded cursor-pointer flex justify-between items-center"
                              onClick={() => handleFoodSelection(food.food_id)}
                            >
                              <div>
                                <div className="font-medium dark:text-white">
                                  {food.food_name}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                  {food.brand_name &&
                                    `Brand: ${food.brand_name}`}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {defaultServing?.calories || 0} kcal per{" "}
                                  {formatServing(defaultServing)}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickAdd(food, defaultServing);
                                }}
                                className = "dark:hover:bg-zinc-700"
                              >
                                Quick Add
                              </Button>
                            </li>
                          );
                        })}
                      </ul>

                      {/* Pagination controls */}
                      <div className="flex justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => handleSearch(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="dark:hover:bg-zinc-400 dark:hover:border-zinc-400 dark:text-gray-800 hover:text-white"
                       >
                          Previous
                        </Button>
                        <span className="px-4 py-2 text-gray-600 dark:text-gray-300">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => handleSearch(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="dark:hover:bg-zinc-400 dark:hover:border-zinc-400 dark:text-gray-800 hover:text-white"
                       
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                <NutritionLabel
                    isOpen={isNutritionLabelOpen}
                    onClose={handleNutritionLabelClose}
                    food={selectedFood}
                    onEdit={(foodData) => {
                      if (foodData.id) {
                        handleEditFood(foodData);
                      } else {
                        handleAddFoodWithServing(foodData);
                      }
                    }}
                    onDelete={handleDeleteFood}
                  />
                </CardContent>
                <CardFooter>
                  <form onSubmit={handleAddFood} className="flex gap-2 w-full">
                    <Input
                      placeholder="Search food item to add..."
                      value={newFood}
                      onChange={(e) => setNewFood(e.target.value)}
                      className="flex-1 dark:border-zinc-600 md:text-lg"
                      disabled={isSearching}
                    />
                    <Button
                      type="submit"
                      className="md:text-lg hover:bg-zinc-700"
                      disabled={isSearching}
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                  </form>
                </CardFooter>
              </Card>
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