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

export function NutritionLabel({ isOpen, onClose, food, onEdit, onDelete }) {
  const [servingAmount, setServingAmount] = useState("1");
  const [selectedServing, setSelectedServing] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(
    food?.mealType || "breakfast"
  );
  const [isEditing, setIsEditing] = useState(false);

  const isExistingEntry = !!food?.id;
  const [servingsList, setServingsList] = useState([]);
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

      // const hasGramServing = servingsList.some(s =>
      //   s.description.toLowerCase().includes('gram') ||
      //   (s.metric_serving_unit || '').toLowerCase() === 'g'
      // );

      // if (!hasGramServing) {

      //   const baseServing = servingsList.find(s =>
      //     (s.metric_serving_unit || '').toLowerCase() === 'g' &&
      //     s.metric_serving_amount
      //   );
      //   if (baseServing) {
      //     // Calculate per gram values
      //     const conversionFactor = 1 / baseServing.metric_serving_amount;

      //     // Create new "1 gram" serving option
      //     const gramServing = {
      //       serving_id: `gram_${Date.now()}`, // Unique ID
      //       description: "1 gram",
      //       calories: baseServing.calories * conversionFactor,
      //       protein: baseServing.protein * conversionFactor,
      //       carbs: baseServing.carbs * conversionFactor,
      //       fat: baseServing.fat * conversionFactor,
      //       metric_serving_amount: 1,
      //       metric_serving_unit: 'g',
      //       default: false
      //     };

      //     // Add the new serving option
      //     servingsList.push(gramServing);
      //   }
      // }
      // setServingsList(servingsList);
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
          metric_serving_amount: 1,
          metric_serving_unit: "g",
          default: false,
        };

        // Always add 1 gram option to the beginning of the list
        servingsList.push(oneGramServing);
      }

      setServingsList(servingsList);

      // Find the originally selected serving for existing entries
      const initialServing = food.servingType
        ? servingsList.find((s) => s.description === food.servingType)
        : servingsList.find((s) => s.default) || servingsList[0];

      setSelectedServing(initialServing);
      setServingAmount(food.servingAmount || "1");
      setSelectedMeal(food.mealType || "breakfast");
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
      calories: calculateNutrition(selectedServing.calories),
      protein: calculateNutrition(selectedServing.protein),
      carbs: calculateNutrition(selectedServing.carbs),
      fat: calculateNutrition(selectedServing.fat),
      mealType: selectedMeal,
      baseCalories: selectedServing.calories,
      baseProtein: selectedServing.protein,
      baseCarbs: selectedServing.carbs,
      baseFat: selectedServing.fat,
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent hideClose={true} className="max-w-md dark:bg-zinc-800">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="dark:text-white text-xl md:text-2xl border-b-2 border-gray-700 w-full pb-1">
              Nutrition Facts
            </DialogTitle>
            <DialogClose asChild>
              <FiX className="h-5 w-5 dark:text-white hover:text-red-500" />
            </DialogClose>
          </div>
          <DialogDescription className="text-black dark:text-gray-300 text-lg font-bold">
            {food?.food_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isEditing || !isExistingEntry ? (
            <>
              <div className="flex gap-4">
                <Input
                  type="number"
                  value={servingAmount}
                  onChange={(e) => setServingAmount(e.target.value)}
                  className="w-24"
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
            // View mode content
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="dark:text-gray-300">Serving Size:</span>
                <span className="dark:text-white">
                  {food.servingAmount} x {food.servingType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="dark:text-gray-300">Meal Type:</span>
                <span className="dark:text-white capitalize">
                  {food.mealType}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="border-b-2 border-gray-700 py-2">
          <div className="text-xl font-bold dark:text-white">
            Calories{" "}
            {calculateNutrition(
              selectedServing?.calories || food.calories || 0
            )}
          </div>
        </div>

        <div className="space-y-1 text-sm border-b border-gray-700 py-2">
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
            <span>Protein</span>
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
          {isExistingEntry ? (
            <>
              {isEditing ? (
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={() => setIsEditing(false)}
                    className="bg-red-500 hover:bg-red-600 flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEntry}
                    className="bg-emerald-600 hover:bg-emerald-700 flex-1"
                  >
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 w-full">
                  <Button
                    className="bg-gray-500 hover:bg-gray-600 flex-1"
                    variant=""
                    onClick={() => setIsEditing(true)}
                  >
                    <FiEdit2 className="mr-2" />
                    Edit Entry
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600 flex-1"
                    onClick={onDelete}
                  >
                    <FiTrash2 className="mr-2" />
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
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
