// src/components/FoodDiary.jsx

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FiX } from "react-icons/fi";
import { CiCircleInfo } from "react-icons/ci";
import { NutritionLabel } from "@/components/NutritionLabel";
import { LuInfo, LuPlus, LuSearch } from "react-icons/lu";
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

  // Note: handleAddFoodWithServing should be passed if used inside NutritionLabel.onEdit
}) {
  const handleInfoClick = async (entry) => {
    try {
      if (!entry.food_id) {
        // If no food_id, show the entry data as is

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
  return (
    <Card className="bg-white dark:bg-zinc-800 shadow-sm border-0 rounded-xl overflow-hidden">
      <CardHeader className="py-3 lg:py-4 border-b border-gray-200 dark:border-zinc-700 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-wrap gap-2">
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
      <CardContent className="p-0">
        {" "}
        {/* Remove padding from CardContent */}
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
              .filter((entry) => entry.mealType === selectedMeal)
              .map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50"
                >
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-medium">
                      {entry.foodName}
                    </h3>
                    <p className="capitalize text-sm text-gray-500 dark:text-gray-400">
                      {formatServingDisplay(
                        entry.servingAmount,
                        entry.servingType
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-900 dark:text-white font-medium">
                      {entry.calories} kcal
                    </span>
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
          formatServingDisplay = {formatServingDisplay}
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
        <div className=" w-full">
              <form onSubmit={handleAddFood} className="flex space-x-4 ">
                <div className="flex-1 relative">
                  <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                   placeholder="Search for a food..."
                               value={newFood}
                               onChange={(e) => setNewFood(e.target.value)}
                               disabled={isSearching}
                    type="text"
                  
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                </div>
                <Button type="submit" className="px-4 sm:px-6 py-2  bg-blue-500 text-white rounded-lg hover:bg-blue-600 " disabled={isSearching}>
                   {isSearching ? "Searching..." : "Search"}
                 </Button>
              </form>
              {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-start items-center mb-2">
              <h3 className="font-medium text-gray-900 text-lg   dark:text-white">
                Search Results
              </h3>
              <Button
                     onClick={(e) => {
                      e.stopPropagation();
                      setSearchResults([]);
                      setNewFood("");
                    }}
                      className="mt-px ml-1 h-5 w-5 dark:text-white hover:text-red-500 bg-transparent hover:bg-transparent"
                    >
                       <FiX
               
               className="min-h-5 min-w-5 "
                       />
                    </Button>
            
            </div>
            {/* <ul className="space-y-2"> */}
              {searchResults.map((food) => {
                const defaultServing =
                  food.servings.find((s) => s.default) || food.servings[0];
                return (
                  <div
                    key={food.food_id}
                     className="flex items-center justify-between p-3 bg-white dark:bg-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-600  cursor-pointer"
                     
                    onClick={() => handleFoodSelection(food.food_id)}
                  >
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {food.food_name}
                      </h4>
                     
                      <div className = 'flex '>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="capitalize">{defaultServing?.description}</span> • <span>{defaultServing?.calories || 0} kcal</span>
                      </p>
                      </div>
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
            {/* </ul> */}
            <div className="flex justify-center gap-2 mt-6 pt-2">
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
            </div>
      </CardFooter>
    </Card>
  );
}
//   return (
//     <Card className="bg-white dark:bg-zinc-800 shadow-sm  border-0 rounded-xl overflow-hidden">
//       <CardHeader className="py-3 lg:py-4 border-b border-gray-200 dark:border-zinc-700 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">

//         <div className="flex flex-wrap gap-2">
//                     <MealButton
//                       meal="breakfast"
//                       selected={selectedMeal}
//                       onClick={() => setSelectedMeal("breakfast")}
//                     />
//                     <MealButton
//                       meal="lunch"
//                       selected={selectedMeal}
//                       onClick={() => setSelectedMeal("lunch")}
//                     />
//                     <MealButton
//                       meal="dinner"
//                       selected={selectedMeal}
//                       onClick={() => setSelectedMeal("dinner")}
//                     />
//                     <MealButton
//                       meal="snack"
//                       selected={selectedMeal}
//                       onClick={() => setSelectedMeal("snack")}
//                     />
//                   </div>

//       </CardHeader>
//       <CardContent>
//         <div className="overflow-x-auto rounded-lg border dark:border-zinc-900">
//           <Table>
//             <TableHeader className="bg-gray-100 dark:bg-zinc-900 border-b-2 dark:border-zinc-900">
//               <TableRow className="hover:bg-transparent text-xs ">
//                 <TableHead className="text-gray-800 dark:text-gray-300 text-center sm:text-sm md:text-lg w-[20%] p-2">
//                   Meal
//                 </TableHead>
//                 <TableHead className="text-gray-800 dark:text-gray-300 text-center sm:text-sm md:text-lg w-[30%] p-2">
//                   Food
//                 </TableHead>
//                 <TableHead className="text-gray-800 dark:text-gray-300 text-center sm:text-sm md:text-lg w-[25%] p-2">
//                   Serving
//                 </TableHead>
//                 <TableHead className="text-gray-800 dark:text-gray-300 text-center sm:text-sm md:text-lg w-[15%] p-2">
//                   Cal
//                 </TableHead>
//                 <TableHead className="text-gray-800 dark:text-gray-300 text-center sm:text-sm md:text-lg w-[10%] p-2">
//                   Info
//                 </TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody className="hover:bg-transparent ">
//               {loadingFoodLog
//                 ? Array(3)
//                     .fill(0)
//                     .map((_, i) => (
//                       <TableRow key={i}>
//                         <TableCell>
//                           <Skeleton className="h-4 w-[80px]" />
//                         </TableCell>
//                         <TableCell>
//                           <Skeleton className="h-4 w-[120px]" />
//                         </TableCell>
//                         <TableCell>
//                           <Skeleton className="h-4 w-[80px]" />
//                         </TableCell>
//                         <TableCell>
//                           <Skeleton className="h-4 w-[60px] ml-auto" />
//                         </TableCell>
//                         <TableCell>
//                           <Skeleton className="h-4 w-[40px] ml-auto" />
//                         </TableCell>
//                       </TableRow>
//                     ))
//                 : foodEntries.map((entry) => (
//                     <TableRow key={entry.id} className="hover:bg-transparent  border-b dark:border-zinc-900">
//                       <TableCell className="dark:text-gray-300 md:text-lg capitalize text-center p-2 text-xs sm:text-sm">
//                         {entry.mealType}
//                       </TableCell>
//                       <TableCell className="dark:text-gray-300 md:text-lg text-center p-2 text-xs sm:text-sm break-words">
//                         {entry.foodName}
//                       </TableCell>
//                       <TableCell className="dark:text-gray-300 md:text-lg text-center capitalize p-2 text-xs sm:text-sm break-words">
//                         {formatServingDisplay(entry.servingAmount, entry.servingType)}
//                       </TableCell>
//                       <TableCell className="dark:text-gray-300 md:text-lg text-center p-2 text-xs sm:text-sm">
//                         {entry.calories}
//                       </TableCell>
//                       <TableCell className="text-center p-2 text-xl">

//                         <div className="flex justify-center items-center h-full ">
//                           <LuInfo
//                             className="h-4 w-4 sm:h-5 sm:w-5 dark:text-gray-300 md:h-6 md:w-6 cursor-pointer hover:text-gray-500 transition-colors"
//                              onClick={() => handleInfoClick(entry)}
//                           />
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//             </TableBody>
//             {/* <div className="divide-y divide-gray-200 dark:divide-zinc-700">
//             {foodEntries
//               .filter((entry) => entry.meal === selectedMeal)
//               .map((entry) => (
//                 <div
//                   key={entry.id}
//                   className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50"
//                 >
//                   <div>
//                     <h3 className="text-gray-900 dark:text-white font-medium">{entry.foodName}</h3>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">{entry.serving}</p>
//                   </div>
//                   <div className="flex items-center space-x-4">
//                     <span className="text-gray-900 dark:text-white font-medium">
//                       {entry.calories} kcal
//                     </span>
//                     <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
//                       <Info className="h-5 w-5" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//           </div> */}
//           </Table>
//         </div>
//         {searchResults.length > 0 && (
//           <div className="mt-4 p-4 bg-white dark:bg-zinc-700 rounded-lg">
//             <div className="flex justify-between items-center">
//               <h3 className="text-lg font-bold mb-2 dark:text-white">
//                 Search Results
//               </h3>
//               <FiX
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setSearchResults([]);
//                   setNewFood("");
//                 }}
//                 className="mb-4 mr-2 h-5 w-5 dark:text-white hover:text-red-500"
//               />
//             </div>
//             <ul className="space-y-2 ">
//               {searchResults.map((food) => {
//                 const defaultServing =
//                   food.servings.find((s) => s.default) || food.servings[0];
//                 return (
//                   <li
//                     key={food.food_id}
//                     className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-600 rounded cursor-pointer flex justify-between items-center"
//                     onClick={() => handleFoodSelection(food.food_id)}
//                   >
//                     <div>
//                       <div className="font-medium dark:text-white">
//                         {food.food_name}
//                       </div>
//                       <div className="text-sm text-gray-600 dark:text-gray-300">
//                         {food.brand_name && `Brand: ${food.brand_name}`}
//                       </div>
//                       <div className="text-xs text-gray-500 dark:text-gray-400">
//                         {defaultServing?.calories || 0} kcal per {defaultServing?.description}
//                       </div>
//                     </div>
//                     <Button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleQuickAdd(food, defaultServing);
//                       }}
//                       className="ml-8 h-8 w-16 text-xs sm:ml-0 sm:h-auto sm:w-auto sm:text-sm dark:hover:bg-zinc-700"
//                     >
//                       Quick Add
//                     </Button>
//                   </li>
//                 );
//               })}
//             </ul>
//             <div className="flex justify-center gap-2 mt-4">
//               <Button
//                 variant="outline"
//                 onClick={() => handleSearch(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className="dark:hover:bg-zinc-400 dark:hover:border-zinc-400 dark:text-gray-800 hover:text-white"
//               >
//                 Previous
//               </Button>
//               <span className="px-4 py-2 text-gray-600 dark:text-gray-300">
//                 Page {currentPage} of {totalPages}
//               </span>
//               <Button
//                 variant="outline"
//                 onClick={() => handleSearch(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className="dark:hover:bg-zinc-400 dark:hover:border-zinc-400 dark:text-gray-800 hover:text-white"
//               >
//                 Next
//               </Button>
//             </div>
//           </div>
//         )}
//         <NutritionLabel
//           isOpen={isNutritionLabelOpen}
//           onClose={handleNutritionLabelClose}
//           food={selectedFood}
//           onEdit={(foodData) => {
//             if (foodData.id) {
//               handleEditFood(foodData);
//             } else {
//               // If using a function like handleAddFoodWithServing, pass it here
//               handleAddFoodWithServing(foodData)
//               // handleAddFood(foodData);
//             }
//           }}
//           onDelete={handleDeleteFood}
//         />
//       </CardContent>
//       <CardFooter >
//         <form onSubmit={handleAddFood} className="relative flex-grow flex gap-2 w-full">
//           <LuSearch className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />

//           <Input
//             placeholder="Search food item to add..."
//             value={newFood}
//             onChange={(e) => setNewFood(e.target.value)}
//             className="pl-8 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300 dark:placeholder-gray-400"
//             disabled={isSearching}
//           />
//           <Button type="submit" className="w-full sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white md:text-lg" disabled={isSearching}>
//             {isSearching ? "Searching..." : "Search"}
//           </Button>
//         </form>
//       </CardFooter>
//     </Card>
//   );
// }
