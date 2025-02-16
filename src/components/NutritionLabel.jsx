"use client";

import { useState, useEffect, useCallback } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FiX, FiEdit2, FiTrash2 } from "react-icons/fi";

// "1.5 100 g"    -> 1.5 * 100 = 150
function getEffectiveMultiplier(description) {
  if (!description) return 1;
  const numbers = description.match(/[\d\.]+/g)?.map(Number) || [];
  if (numbers.length >= 3 && numbers[0] === 1) {
    return numbers[1] * numbers[2];
  } else if (numbers.length >= 2) {
    return numbers[0] * numbers[1];
  } else if (numbers.length === 1) {
    return numbers[0];
  }
  return 1;
}


export function NutritionLabel({ isOpen, onClose, food, onEdit, onDelete }) {
  const [servingAmount, setServingAmount] = useState("1");
  const [selectedServing, setSelectedServing] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [servingsList, setServingsList] = useState([]);

  // Always call hooks at the top; perform food-dependent initialization here.
  useEffect(() => {
    if (food?.servings) {
      // Copy the servings array.
      let servingsCopy = food.servings.slice();

      // If none of the servings include "gram" and a metric serving is available, add a "1 gram" option.
      if (
        !servingsCopy.some(s => s.description.toLowerCase().includes("gram")) &&
        servingsCopy[0]?.metric_serving_amount
      ) {
        const base = servingsCopy[0];
        servingsCopy.push({
          serving_id: "gram_1",
          description: "1 gram",
          // Calculate per gram nutrient values based on the base serving metric.
          calories: base.calories / base.metric_serving_amount,
          protein: base.protein / base.metric_serving_amount,
          carbs: base.carbs / base.metric_serving_amount,
          fat: base.fat / base.metric_serving_amount,
          default: false,
          metric_serving_amount: 1,
          metric_serving_unit: "g",
        });
      }
      
      setServingsList(servingsCopy);

      // Determine the initial selection.
      const servingToSet = food.id && food.servingType
        ? servingsCopy.find(s => s.description === food.servingType) || servingsCopy[0]
        : servingsCopy.find(s => s.default) || servingsCopy[0];
      setSelectedServing(servingToSet);
      setServingAmount(food.servingAmount || "1");
    }
  }, [food]);

  const isExistingEntry = !!food?.id;

  const calculateNutrition = useCallback((baseValue) => {
    const amount = parseFloat(servingAmount) || 1;
    const multiplier = selectedServing ? getEffectiveMultiplier(selectedServing.description) : 1;
    return Math.round(baseValue * amount * multiplier);
  }, [servingAmount, selectedServing]);


  const handleAddEntry = useCallback(() => {
    if (!selectedServing || !food) return;
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
    onClose();
  }, [selectedServing, servingAmount, selectedMeal, food, isExistingEntry, onEdit, onClose, calculateNutrition]);

  if (!isOpen || !food) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideClose={true} className="max-w-md dark:bg-zinc-800">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="dark:text-white text-xl md:text-2xl">
              {food?.food_name || 'Food Entry'}
            </DialogTitle>
            <DialogClose asChild>
              <FiX className="h-5 w-5 dark:text-white hover:text-red-500" />
            </DialogClose>
          </div>
          <DialogDescription className="dark:text-gray-300 text-lg">
            Nutrition Facts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
                const newServing = servingsList.find(s => s.serving_id === value);
                setSelectedServing(newServing);
                setServingAmount("1");
              }}
            >
              <SelectTrigger>
                {selectedServing?.description || "Select serving"}
              </SelectTrigger>
              <SelectContent>
                {servingsList.map((serving) => (
                  <SelectItem 
                    key={serving.serving_id} 
                    value={serving.serving_id}
                  >
                    {serving.description}
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
        </div>

        <div className="border-t-2 border-b-2 dark:border-gray-700 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-lg">
              <span className="dark:text-gray-300">Calories</span>
              <span className="dark:text-white font-medium">
                {calculateNutrition(selectedServing?.calories || 0)}
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="dark:text-gray-300">Protein</span>
              <span className="dark:text-white font-medium">
                {calculateNutrition(selectedServing?.protein || 0)}g
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="dark:text-gray-300">Carbohydrates</span>
              <span className="dark:text-white font-medium">
                {calculateNutrition(selectedServing?.carbs || 0)}g
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="dark:text-gray-300">Fat</span>
              <span className="dark:text-white font-medium">
                {calculateNutrition(selectedServing?.fat || 0)}g
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4">
          {isExistingEntry ? (
            <>
              <Button variant="outline" onClick={handleAddEntry}>
                <FiEdit2 className="mr-2" />
                Save
              </Button>
              <Button variant="destructive" onClick={onDelete}>
                <FiTrash2 className="mr-2" />
                Delete
              </Button>
            </>
          ) : (
            <Button onClick={handleAddEntry} className="w-full">
              Add Entry
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}