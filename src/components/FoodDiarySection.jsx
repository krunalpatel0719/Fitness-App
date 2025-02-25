import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MealButton } from "@/components/MealButton";
import { FiX } from "react-icons/fi";
import { LuInfo, LuPlus, LuSearch } from "react-icons/lu";
import { NutritionLabel } from "@/components/NutritionLabel";

export function FoodDiarySection({
  selectedMeal,
  setSelectedMeal,
  foodEntries,
  loadingFoodLog,
  formatServingDisplay,
  searchResults,
  setSearchResults,
  newFood,
  setNewFood,
  isSearching,
  handleAddFood,
  handleQuickAdd,
  handleAddFoodWithServing,
  handleFoodSelection,
  currentPage,
  totalPages,
  handleSearch,
  isNutritionLabelOpen,
  setIsNutritionLabelOpen,
  selectedFood,
  setSelectedFood,
  handleNutritionLabelClose,
  handleEditFood,
  handleDeleteFood,
}) {
  const handleInfoClick = async (entry) => {
    try {
      if (!entry.food_id) {
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
          servings: [
            {
              description: entry.servingType,
              calories: entry.baseCalories || entry.calories,
              protein: entry.baseProtein || entry.protein,
              carbs: entry.baseCarbs || entry.carbs,
              fat: entry.baseFat || entry.fat,
            },
          ],
        });
        setIsNutritionLabelOpen(true);
        return;
      }
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
          fat: entry.fat,
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
        servings: [
          {
            description: entry.servingType,
            calories: entry.baseCalories || entry.calories,
            protein: entry.baseProtein || entry.protein,
            carbs: entry.baseCarbs || entry.carbs,
            fat: entry.baseFat || entry.fat,
          },
        ],
      });
      setIsNutritionLabelOpen(true);
    }
  };

  const handleAddFoodWithDefaultMeal = (e) => {
    e.preventDefault();
    if (selectedMeal === "all") {
      setSelectedMeal("breakfast");
    }
    handleAddFood(e);
  };

  const handleMealSelection = (meal) => {
    if (searchResults.length > 0 && meal === "all") return;
    setSelectedMeal(meal);
    if (meal === "all" || newFood.trim() === "") {
      setSearchResults([]);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setNewFood(value);
    if (value.trim() === "") {
      setSearchResults([]);
    }
  };

  return (
    <Card className="bg-white dark:bg-zinc-800 shadow-sm border-0 rounded-xl overflow-hidden">
      <CardHeader className="py-3 lg:py-4 border-b border-gray-200 dark:border-zinc-700 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-wrap gap-2">
          <MealButton meal="all" selected={selectedMeal} onClick={() => handleMealSelection("all")} disabled={searchResults.length > 0} />
          <MealButton meal="breakfast" selected={selectedMeal} onClick={() => handleMealSelection("breakfast")} />
          <MealButton meal="lunch" selected={selectedMeal} onClick={() => handleMealSelection("lunch")} />
          <MealButton meal="dinner" selected={selectedMeal} onClick={() => handleMealSelection("dinner")} />
          <MealButton meal="snack" selected={selectedMeal} onClick={() => handleMealSelection("snack")} />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loadingFoodLog ? (
          <div className="divide-y divide-gray-200 dark:divide-zinc-700">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="w-1/2">
                    <div className="h-4 w-[80px] bg-gray-200 dark:bg-zinc-700 rounded" />
                    <div className="mt-1 h-3 w-[100px] bg-gray-200 dark:bg-zinc-700 rounded" />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="h-4 w-[60px] bg-gray-200 dark:bg-zinc-700 rounded" />
                    <div className="h-5 w-5 bg-gray-200 dark:bg-zinc-700 rounded" />
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-zinc-700">
            {foodEntries
              .filter((entry) => selectedMeal === "all" || entry.mealType === selectedMeal)
              .map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50"
                >
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-medium">{entry.foodName}</h3>
                    <p className="capitalize text-sm text-gray-500 dark:text-gray-400">
                      {formatServingDisplay(entry.servingAmount || 1, entry.servingType)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-900 dark:text-white font-medium">{entry.calories} kcal</span>
                    <button
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      onClick={() => handleInfoClick(entry)}
                    >
                      <LuInfo className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
        <NutritionLabel
          isOpen={isNutritionLabelOpen}
          onClose={handleNutritionLabelClose}
          food={selectedFood}
          formatServingDisplay={formatServingDisplay}
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
      <CardFooter className="p-4 bg-gray-50 dark:bg-zinc-800/50">
        <div className="w-full">
          <form onSubmit={handleAddFoodWithDefaultMeal} className="flex space-x-4">
            <div className="flex-1 relative">
              <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                placeholder="Search for a food..."
                value={newFood}
                onChange={handleSearchInputChange}
                disabled={isSearching}
                type="text"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button type="submit" className="px-4 sm:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </form>
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-start items-center mb-2">
                <h3 className="font-medium text-gray-900 text-lg dark:text-white">Search Results</h3>
                {/* <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchResults([]);
                    setNewFood("");
                  }}
                  className="mt-px ml-1 h-5 w-5 dark:text-white hover:text-red-500 bg-transparent hover:bg-transparent"
                >
                  <FiX className="min-h-5 min-w-5" />
                </Button> */}
              </div>
              {searchResults.map((food) => {
                const defaultServing = food.servings.find((s) => s.default) || food.servings[0];
                return (
                  <div
                    key={food.food_id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-600 cursor-pointer"
                    onClick={() => handleFoodSelection(food.food_id)}
                  >
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{food.food_name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="capitalize">{defaultServing?.description}</span> • <span>{defaultServing?.calories || 0} kcal</span>
                      </p>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAdd(food, defaultServing);
                      }}
                      className="ml-8 h-8 w-16 text-xs sm:ml-0 sm:h-auto sm:w-auto sm:text-sm bg-blue-500 text-white hover:bg-blue-600"
                    >
                      Quick Add
                    </Button>
                  </div>
                );
              })}
              <div className="flex justify-center gap-2 mt-6 pt-2">
                <Button
                  variant="outline"
                  onClick={() => handleSearch(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="dark:hover:bg-zinc-400 dark:hover:border-zinc-400 dark:text-gray-800 hover:text-white"
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-gray-600 dark:text-gray-300">Page {currentPage} of {totalPages}</span>
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
        </div>
      </CardFooter>
    </Card>
  );
}