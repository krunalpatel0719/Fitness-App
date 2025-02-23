//src/components/NutritionLabel
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiX, FiEdit2, FiTrash2 } from "react-icons/fi";

export function NutritionLabel({ isOpen, onClose, food, formatServingDisplay, onEdit, onDelete }) {
  const [servingAmount, setServingAmount] = useState("1");
  const [selectedServing, setSelectedServing] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(
    food?.mealType || "breakfast"
  );
  const [isEditing, setIsEditing] = useState(false);

  const isExistingEntry = !!food?.id;
  const [servingsList, setServingsList] = useState([]);

  const isDailyTotal = food?.mealType === "daily total";

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };
  useEffect(() => {
    if (food?.servings) {
      let servingsList = [...food.servings];
  
      const gramBasedServing = servingsList.find(
        (s) =>
          (s.metric_serving_unit || "").toLowerCase() === "g" &&
          s.metric_serving_amount > 0
      );
  
      if (gramBasedServing) {
        // Calculate conversion factor to get per-gram values
        const gramsInServing = gramBasedServing.metric_serving_amount;
        const conversionFactor = 1 / gramsInServing;
  
        // Create new 1 gram serving option
        const oneGramServing = {
          serving_id: "one_gram",
          description: "1 g",
          calories: gramBasedServing.calories * conversionFactor,
          protein: gramBasedServing.protein * conversionFactor,
          carbs: gramBasedServing.carbs * conversionFactor,
          fat: gramBasedServing.fat * conversionFactor,
          fiber: gramBasedServing.fiber * conversionFactor,
          sugar: gramBasedServing.sugar * conversionFactor,
          saturated_fat: gramBasedServing.saturated_fat * conversionFactor,
          trans_fat: gramBasedServing.trans_fat * conversionFactor,
          polyunsaturated_fat: gramBasedServing.polyunsaturated_fat * conversionFactor,
          monounsaturated_fat: gramBasedServing.monounsaturated_fat * conversionFactor,
          cholesterol: gramBasedServing.cholesterol * conversionFactor,
          sodium: gramBasedServing.sodium * conversionFactor,
          potassium: gramBasedServing.potassium * conversionFactor,
          vitamin_a: gramBasedServing.vitamin_a * conversionFactor,
          vitamin_c: gramBasedServing.vitamin_c * conversionFactor,
          vitamin_d: gramBasedServing.vitamin_d * conversionFactor,
          calcium: gramBasedServing.calcium * conversionFactor,
          iron: gramBasedServing.iron * conversionFactor,
          metric_serving_amount: 1,
          metric_serving_unit: "g",
          default: false,

          baseCalories: gramBasedServing.calories,
          baseProtein: gramBasedServing.protein,
          baseCarbs: gramBasedServing.carbs,
          baseFat: gramBasedServing.fat,
          baseFiber: gramBasedServing.fiber,
          baseSugar: gramBasedServing.sugar,
          baseSaturatedFat: gramBasedServing.saturated_fat,
          baseTransFat: gramBasedServing.trans_fat,
          basePolyunsaturatedFat: gramBasedServing.polyunsaturated_fat,
          baseMonounsaturatedFat: gramBasedServing.monounsaturated_fat,
          baseCholesterol: gramBasedServing.cholesterol,
          baseSodium: gramBasedServing.sodium,
          basePotassium: gramBasedServing.potassium,
          baseVitaminA: gramBasedServing.vitamin_a,
          baseVitaminC: gramBasedServing.vitamin_c,
          baseVitaminD: gramBasedServing.vitamin_d,
          baseCalcium: gramBasedServing.calcium,
          baseIron: gramBasedServing.iron,



        };
  
        // Add 1 gram option to the beginning of the list
        servingsList.push(oneGramServing);
      }
  
      setServingsList(servingsList);
  
      // Find the originally selected serving for existing entries
      const initialServing = food.servingType
        ? servingsList.find((s) => s.description === food.servingType)
        : servingsList.find((s) => s.default) || servingsList[0];
  
      if (initialServing) {
        setSelectedServing(initialServing);
        setServingAmount(food.servingAmount || "1");
        setSelectedMeal(food.mealType || "breakfast");
      }
    }
  }, [food]);

  const calculateNutrition = useCallback(
    (baseValue) => {
      const amount = parseFloat(servingAmount) || 1;
      return Math.round(baseValue * amount);
    },
    [servingAmount]
  );

  const handleSaveEntry = useCallback(() => {
    if (!selectedServing) return;
  
    const entryData = {
      ...food,
      servingAmount,
      servingType: selectedServing.description,
      mealType: selectedMeal,
      // Add base values for calculations
      baseCalories: selectedServing.calories || 0,
      baseProtein: selectedServing.protein || 0,
      baseCarbs: selectedServing.carbs || 0,
      baseFat: selectedServing.fat || 0,
      baseFiber: selectedServing.fiber || 0,
      baseSugar: selectedServing.sugar || 0,
      baseSaturatedFat: selectedServing.saturated_fat || 0,
      baseTransFat: selectedServing.trans_fat || 0,
      basePolyunsaturatedFat: selectedServing.polyunsaturated_fat || 0,
      baseMonounsaturatedFat: selectedServing.monounsaturated_fat || 0,
      baseCholesterol: selectedServing.cholesterol || 0,
      baseSodium: selectedServing.sodium || 0,
      basePotassium: selectedServing.potassium || 0,
      baseVitaminA: selectedServing.vitamin_a || 0,
      baseVitaminC: selectedServing.vitamin_c || 0,
      baseVitaminD: selectedServing.vitamin_d || 0,
      baseCalcium: selectedServing.calcium || 0,
      baseIron: selectedServing.iron || 0,
      baseServingUnit: selectedServing.metric_serving_unit || selectedServing.description,
      baseServingAmount: selectedServing.metric_serving_amount || 1,
      // Add calculated values
      calories: calculateNutrition(selectedServing.calories || 0),
      protein: calculateNutrition(selectedServing.protein || 0),
      carbs: calculateNutrition(selectedServing.carbs || 0),
      fat: calculateNutrition(selectedServing.fat || 0),
      fiber: calculateNutrition(selectedServing.fiber || 0),
      sugar: calculateNutrition(selectedServing.sugar || 0),
      saturated_fat: calculateNutrition(selectedServing.saturated_fat || 0),
      trans_fat: calculateNutrition(selectedServing.trans_fat || 0),
      polyunsaturated_fat: calculateNutrition(selectedServing.polyunsaturated_fat || 0),
      monounsaturated_fat: calculateNutrition(selectedServing.monounsaturated_fat || 0),
      cholesterol: calculateNutrition(selectedServing.cholesterol || 0),
      sodium: calculateNutrition(selectedServing.sodium || 0),
      potassium: calculateNutrition(selectedServing.potassium || 0),
      vitamin_a: calculateNutrition(selectedServing.vitamin_a || 0),
      vitamin_c: calculateNutrition(selectedServing.vitamin_c || 0),
      vitamin_d: calculateNutrition(selectedServing.vitamin_d || 0),
      calcium: calculateNutrition(selectedServing.calcium || 0),
      iron: calculateNutrition(selectedServing.iron || 0),
      
      // Preserve the servings array for future edits
      servings: food.servings
    };
  
    if (isExistingEntry) {
      entryData.id = food.id;
      entryData.updatedAt = new Date();
    }
  
    onEdit(entryData);
    setIsEditing(false);
    if (!isExistingEntry) onClose();
  }, [
    selectedServing,
    servingAmount,
    selectedMeal,
    food,
    isExistingEntry,
    onEdit,
    onClose,
    calculateNutrition,
  ]);

  if (!isOpen || !food) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}  >
      <DialogContent hideClose={true} className="w-10/12 max-w-sm sm:w-full sm:max-w-md dark:bg-zinc-800 max-h-[90vh] overflow-y-auto border-0">
        <DialogHeader>
          <div className="flex items-center justify-between pb-4">
            <DialogTitle className="text-left dark:text-white text-xl md:text-2xl w-full ">
              {isDailyTotal ? "Daily Total" : "Nutrition Facts"}
            </DialogTitle>
            <DialogClose className = "ml-6 sm:ml-0" asChild>
              <FiX className="h-7 w-7 sm:h-5 sm:w-5 dark:text-white hover:text-red-500" />
            </DialogClose>
          </div>
          <div>
          <DialogDescription className=" text-left  mr-12 sm:mr-0 text-black dark:text-white text-lg font-bold">
           {food?.food_name} 
            
          </DialogDescription>
          <DialogDescription className=" text-left  capitalize mr-12 sm:mr-0   text-gray-500 dark:text-gray-400 ">
            
            {formatServingDisplay(
                        food?.servingAmount,
                        food?.servingType
                      )}
          </DialogDescription>
          </div>
          
        
        </DialogHeader>

        <div className={`
        space-y-4
        border-t
       
        ${isEditing && !isDailyTotal || !isExistingEntry && !isDailyTotal  
          ? 'border-t-0' 
          : ''
        }`}>
          {isEditing && !isDailyTotal || !isExistingEntry && !isDailyTotal  ? (
            <>
            
              <div className="flex gap-4 ">
                <Input
                  type="number"
                  value={servingAmount}
                  onChange={(e) => setServingAmount(e.target.value)}
                  className="w-24 "
                  min="0.1"
                  step="0.1"
                />
                <Select
                  value={selectedServing?.serving_id}
                  onValueChange={(value) => {
                    const newServing = servingsList.find(
                      (s) => s.serving_id === value
                    );
                    setSelectedServing(newServing);
                    setServingAmount("1");
                  }}
                >
                  <SelectTrigger className="capitalize">
                    {selectedServing?.description || "Select serving"}
                  </SelectTrigger>
                  <SelectContent>
                    {servingsList.map((serving) => (
                      <SelectItem
                        key={serving.serving_id}
                        value={serving.serving_id}
                        className="capitalize"
                      >
                        {serving.description}
                        {serving.metric_serving_amount &&
                          serving.metric_serving_unit &&
                          serving.description.toLowerCase() !== "1 gram"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Select value={selectedMeal} onValueChange={setSelectedMeal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </>
          ) : (
            !isDailyTotal ? (
            // View mode content
            // <div className="space-y-2">
            //   <div className="flex justify-between">
            //     <span className="dark:text-gray-300">Serving Size:</span>
            //     <span className="dark:text-white">
            //       {food.servingAmount} x {food.servingType}
            //     </span>
            //   </div>
            //   <div className="flex justify-between">
            //     <span className="dark:text-gray-300">Meal Type:</span>
            //     <span className="dark:text-white capitalize">
            //       {food.mealType}
            //     </span>
            //   </div>
            // </div>
            <> </>
            ) : ( <></>)
          )}
        </div>

        <div className="">
          <div className="flex justify-between text-xl font-bold dark:text-white">
          <span className = "font-bold dark:text-white"> Calories</span> {" "}
          <span className = "font-bold dark:text-white"> {calculateNutrition(
              selectedServing?.calories || food.calories || 0
            )} </span>
          </div>
        </div>

        <div className="space-y-1 text-sm border-b  border-white py-2">
          <div className="flex justify-between font-bold dark:text-white">
            <span>Total Fat</span>
            <span>{calculateNutrition(selectedServing?.fat || 0)}g</span>
          </div>
          <div className="flex justify-between pl-4 dark:text-gray-300">
            <span>Saturated Fat</span>
            <span>
              {calculateNutrition(selectedServing?.saturated_fat || 0)}g
            </span>
          </div>
          <div className="flex justify-between pl-4 dark:text-gray-300">
            <span>Trans Fat</span>
            <span>{calculateNutrition(selectedServing?.trans_fat || 0)}g</span>
          </div>
          <div className="flex justify-between pl-4 dark:text-gray-300">
            <span>Polyunsaturated Fat</span>
            <span>
              {calculateNutrition(selectedServing?.polyunsaturated_fat || 0)}g
            </span>
          </div>
          <div className="flex justify-between pl-4 dark:text-gray-300">
            <span>Monounsaturated Fat</span>
            <span>
              {calculateNutrition(selectedServing?.monounsaturated_fat || 0)}g
            </span>
          </div>

          <div className="flex justify-between font-bold dark:text-white pt-1">
            <span>Cholesterol</span>
            <span>
              {calculateNutrition(selectedServing?.cholesterol || 0)}mg
            </span>
          </div>
          <div className="flex justify-between font-bold dark:text-white">
            <span>Sodium</span>
            <span>{calculateNutrition(selectedServing?.sodium || 0)}mg</span>
          </div>

          <div className="flex justify-between font-bold dark:text-white pt-1">
            <span>Total Carbohydrates</span>
            <span>{calculateNutrition(selectedServing?.carbs || 0)}g</span>
          </div>
          <div className="flex justify-between pl-4 dark:text-gray-300">
            <span>Dietary Fiber</span>
            <span>{calculateNutrition(selectedServing?.fiber || 0)}g</span>
          </div>
          <div className="flex justify-between pl-4 dark:text-gray-300">
            <span>Total Sugars</span>
            <span>{calculateNutrition(selectedServing?.sugar || 0)}g</span>
          </div>
          <div className="flex justify-between pl-8 dark:text-gray-300">
            <span>Added Sugars</span>
            <span>
              {calculateNutrition(selectedServing?.added_sugar || 0)}g
            </span>
          </div>

          <div className="flex justify-between font-bold dark:text-white pt-1">
            <span className = "font-medium">Protein</span>
            <span>{calculateNutrition(selectedServing?.protein || 0)}g</span>
          </div>
        </div>

        <div className="space-y-1 text-sm py-2">
          <div className="flex justify-between dark:text-gray-300">
            <span>Vitamin D</span>
            <span>
              {calculateNutrition(selectedServing?.vitamin_d || 0)}mcg
            </span>
          </div>
          <div className="flex justify-between dark:text-gray-300">
            <span>Calcium</span>
            <span>{calculateNutrition(selectedServing?.calcium || 0)}mg</span>
          </div>
          <div className="flex justify-between dark:text-gray-300">
            <span>Iron</span>
            <span>{calculateNutrition(selectedServing?.iron || 0)}mg</span>
          </div>
          <div className="flex justify-between dark:text-gray-300">
            <span>Potassium</span>
            <span>{calculateNutrition(selectedServing?.potassium || 0)}mg</span>
          </div>
          <div className="flex justify-between dark:text-gray-300">
            <span>Vitamin A</span>
            <span>
              {calculateNutrition(selectedServing?.vitamin_a || 0)}mcg
            </span>
          </div>
          <div className="flex justify-between dark:text-gray-300">
            <span>Vitamin C</span>
            <span>{calculateNutrition(selectedServing?.vitamin_c || 0)}mg</span>
          </div>
        </div>

        <DialogFooter className="pt-4">
          {!isDailyTotal && (
            isExistingEntry ? (
              <>
                {isEditing ? (
                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={() => setIsEditing(false)}
                      className="bg-red-600 hover:bg-red-500 flex-1 rounded-lg dark:text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveEntry}
                      className="bg-emerald-700 hover:bg-emerald-600 flex-1 rounded-lg dark:text-gray-300"
                    >
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 w-full">
                    <Button
                      className="flex-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-600"
                      variant=""
                      onClick={() => setIsEditing(true)}
                    >
                      <FiEdit2 className="mr-2" />
                      Edit Entry
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-500 flex-1 rounded-lg dark:text-gray-300"
                      onClick={onDelete}
                    >
                      <FiTrash2 className="mr-2"/>
                      Delete
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full">
                <Button onClick={handleSaveEntry} className="w-full">
                  Add Entry
                </Button>
              </div>
            )
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


