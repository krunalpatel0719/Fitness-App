// src/app/dashboard/page.jsx
"use client";

import { useState, useEffect } from "react";
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
import { format } from "date-fns";
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

    // Return the raw data instead of transforming it
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

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // For editing/deleting food entries:
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
    const today = format(new Date(), "yyyy-MM-dd");
    const q = query(
      collection(db, "food_logs"),
      where("userId", "==", currentUser.uid),
      where("date", "==", today),
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
        setCaloriesConsumed(Math.round(total)); // Round the total
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
  }, [currentUser, userLoggedIn, router]);

  const calculateCalories = (metrics) => {
    // Convert weight from lbs to kg
    const weightKg = parseFloat(metrics.weight) * 0.453592;
    // Convert height from feet/inches to centimeters
    const heightCm =
      parseFloat(metrics.feet) * 30.48 + parseFloat(metrics.inches) * 2.54;

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

  const handleAddFoodWithServing = async (foodData) => {
    try {
      await addDoc(collection(db, "food_logs"), {
        userId: currentUser.uid,
        foodName: foodData.food_name,
        calories: foodData.calories,
        protein: foodData.protein,
        carbs: foodData.carbs,
        fat: foodData.fat,
        servingSize: foodData.servingType, // This should be the formatted serving
        servingAmount: foodData.servingAmount,
        servingType: foodData.servingType, // Add this line
        mealType: foodData.mealType,
        baseCalories: foodData.baseCalories,
        baseProtein: foodData.baseProtein,
        baseCarbs: foodData.baseCarbs,
        baseFat: foodData.baseFat,
        date: format(new Date(), "yyyy-MM-dd"),
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Add food error:", error);
      alert("Failed to save food entry");
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

  const handleSelectFood = async (food) => {
    if (!food.name) {
      console.error("Selected food has no name", food);
      alert("Selected food data is incomplete.");
      return;
    }
    setLoadingFood(true);
    try {
      await addDoc(collection(db, "food_logs"), {
        userId: currentUser.uid,
        foodName: food.name,
        calories: food.calories,
        servingSize: food.servingSize,
        mealType: selectedMeal,
        date: format(new Date(), "yyyy-MM-dd"),
        createdAt: new Date(),
      });
      setSearchResults([]);
      setNewFood("");
    } catch (error) {
      console.error("Add food error:", error);
    } finally {
      setLoadingFood(false);
    }
  };

  const handleEditFood = async (updatedFood) => {
    try {
      const updatedData = {
        foodName: updatedFood.foodName,
        calories: Math.round(Number(updatedFood.calories)) || 0,
        protein: Math.round(Number(updatedFood.protein)) || 0,
        carbs: Math.round(Number(updatedFood.carbs)) || 0,
        fat: Math.round(Number(updatedFood.fat)) || 0,
        servingAmount: updatedFood.servingAmount,
        servingType: updatedFood.servingType,
        mealType: updatedFood.mealType,
        updatedAt: new Date()
      };
  
      await updateDoc(doc(db, "food_logs", updatedFood.id), updatedData);
      setSelectedFood(null);
      setIsNutritionLabelOpen(false);
    } catch (error) {
      console.error("Error updating food:", error);
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

  const handleQuickAdd = async (food, serving) => {
    try {
      // Ensure we're getting clean numbers
      const calories = Math.round(Number(serving.calories)) || 0;
      const protein = Math.round(Number(serving.protein)) || 0;
      const carbs = Math.round(Number(serving.carbs)) || 0;
      const fat = Math.round(Number(serving.fat)) || 0;
  
      // Create the food log entry
      const foodLogEntry = {
        userId: currentUser.uid,
        foodName: food.food_name,
        baseCalories: calories, // Store base values
        calories: calories,     // Store current values
        protein: protein,
        carbs: carbs,
        fat: fat,
        servingSize: formatServing(serving),
        servingAmount: "1",
        servingType: "serving",
        mealType: selectedMeal,
        date: format(new Date(), "yyyy-MM-dd"),
        createdAt: new Date(),
      };
  
      await addDoc(collection(db, "food_logs"), foodLogEntry);
      setSearchResults([]);
      setNewFood("");
    } catch (error) {
      console.error("Quick add error:", error);
      alert("Failed to add food item");
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

  // const formatServing = (serving) => {
  //   if (!serving || typeof serving !== 'object') return "";
  
  //   const metricAmount = serving.metric_serving_amount || '';
  //   const metricUnit = serving.metric_serving_unit || '';
  //   const description = serving.description || '';
  
  //   // If no meaningful data, return empty string
  //   if (!metricAmount && !metricUnit && !description) return "";
  
  //   const metric = `${metricAmount} ${metricUnit}`.trim();
  
  //   // If description is empty, return just the metric
  //   if (!description) return metric;
  
  //   // If metric is empty, return just the description
  //   if (!metric) return description;
  
  //   // Safely check if description includes metric
  //   if (description.toLowerCase().includes(metric.toLowerCase())) {
  //     return description;
  //   }
  
  //   // Check if metric units are already in description
  //   const hasMetricUnit = metricUnit && description.toLowerCase().includes(metricUnit.toLowerCase());
  
  //   // If units are already included, return just description
  //   if (hasMetricUnit) {
  //     return description;
  //   }
  
  //   // Otherwise return description with metric in parentheses
  //   return `${description} (${metric})`;
  // };
  

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
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="dark:bg-zinc-800">
                  <CardHeader>
                    <CardTitle className="dark:text-white text-lg md:text-xl">
                      Daily Goal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold dark:text-blue-400 md:text-4xl">
                      {userMetrics.dailyCalories}
                      <span className="text-sm ml-2 dark:text-gray-300 md:text-base">
                        kcal
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="dark:bg-zinc-800">
                  <CardHeader>
                    <CardTitle className="dark:text-white md:text-xl">
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
                  <CardTitle className="dark:text-white md:text-xl">
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
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="dark:text-gray-300 text-center md:text-lg">
                          Meal
                        </TableHead>
                        <TableHead className="dark:text-gray-300 text-center md:text-lg">
                          Food
                        </TableHead>
                        <TableHead className="dark:text-gray-300 text-center md:text-lg">
                          Serving
                        </TableHead>
                        <TableHead className="dark:text-gray-300 text-center md:text-lg">
                          Calories
                        </TableHead>
                        <TableHead className="dark:text-gray-300 text-center md:text-lg">
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
                                {entry.servingAmount + " " + entry.servingType}
                              </TableCell>
                              <TableCell className="dark:text-gray-100 md:text-lg text-center">
                                {entry.calories}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center items-center h-full">
                                  <CiCircleInfo
                                    className="h-5 w-5 dark:text-white md:h-7 md:w-7 cursor-pointer hover:text-blue-500 transition-colors"
                                    onClick={() => {
                                      setSelectedFood(entry);
                                      setIsNutritionLabelOpen(true);
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
                      <h3 className="text-lg font-bold mb-2 dark:text-white">
                        Search Results
                      </h3>
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
      <div className="absolute bottom-2 right-4 p-2 dark:text-white">
        {/* Fatsecret attribution snippet */}
        <a href="https://www.fatsecret.com">Powered by fatsecret</a>
      </div>
    </div>
  );
}
