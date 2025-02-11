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

async function searchFood(query) {
    try {
      const response = await fetch(`/api/foods?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Unknown API error');
      }
  
      // Handle FatSecret's response format
      console.log(response)
      console.log(data)
      if (data.foods && data.foods.food) {
        return data.foods.food.map((food) => ({
          id: food.food_id,
          // Use a fallback if food.food_name is undefined
          name: food.food_name || "Unknown Food",
          // Parse calories from description if available
          calories: food.food_description && food.food_description.match(/(\d+)kcal/)?.[1]
                    ? Number(food.food_description.match(/(\d+)kcal/)[1])
                    : 0,
          servingSize: (food.serving_sizes && food.serving_sizes.serving && food.serving_sizes.serving.metric) || "100g"
        }));
      }
      
      return [];
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
          total += data.calories;
        });
        setFoodEntries(entries);
        setCaloriesConsumed(total);
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
      console.log("API Results:", results);
      
      if (results.length > 0) {
        setSearchResults(results);
      }
    } catch (error) {
      console.error("Search error:", error);
      // Show user feedback
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
      await updateDoc(doc(db, "food_logs", updatedFood.id), {
        ...updatedFood,
        updatedAt: new Date(),
      });
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
      const response = await fetch(`/api/foods?query=${encodeURIComponent(newFood)}&page=${page}`);
      const data = await response.json();
      
      if (data.foods?.food) {
        setSearchResults(data.foods.food);
        setCurrentPage(Number(data.foods.page_number));
        setTotalPages(Math.ceil(data.foods.total_results / data.foods.max_results));
      }
    } catch (error) {
      console.error("Search error:", error);
      alert(`Search failed: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleFoodSelection = async (foodId) => {
    try {
      const response = await fetch(`/api/foods?id=${foodId}`);
      const data = await response.json();
      setSelectedFood(data.food);
      setIsNutritionLabelOpen(true);
    } catch (error) {
      console.error("Error fetching food details:", error);
    }
  };
  
  const handleQuickAdd = async (food) => {
    try {
      await addDoc(collection(db, "food_logs"), {
        userId: currentUser.uid,
        foodName: food.food_name,
        calories: food.calories,
        servingSize: food.serving_sizes?.serving?.metric || '100g',
        mealType: selectedMeal,
        date: format(new Date(), "yyyy-MM-dd"),
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Quick add error:", error);
    }
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
                            <TableRow className="hover:bg-transparent" key={entry.id}>
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
                    <h3 className="text-lg font-bold mb-2 dark:text-white">Search Results</h3>
                    <ul className="space-y-2">
                    {searchResults.map((food, index) => (
                        <li key={food.food_id || index}

                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded cursor-pointer flex justify-between items-center"
                        onClick={() => handleFoodSelection(food.food_id)}
                        >
                        <div>
                            <div className="font-medium dark:text-white">{food.food_name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                            {food.food_description}
                            </div>
                        </div>
                        <Button 
                            size="sm" 
                            onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAdd(food);
                            }}
                        >
                            Quick Add
                        </Button>
                        </li>
                    ))}
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
                    onEdit={handleEditFood}
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
