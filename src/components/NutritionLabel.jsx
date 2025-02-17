//src/components/NutritionLabel
"use client";

import { useState, useEffect, useCallback} from 'react';
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

export function NutritionLabel({ isOpen, onClose, food, onEdit, onDelete }) {

  const [servingAmount, setServingAmount] = useState("1");
  const [selectedServing, setSelectedServing] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(food?.mealType || "breakfast");
  const [isEditing, setIsEditing] = useState(false);

  const isExistingEntry = !!food?.id;

  useEffect(() => {
    if (food?.servings) {
      // Find the originally selected serving for existing entries
      const originalServing = food.servings.find(s => 
        s.description === food.servingType
      ) || food.servings[0];
      
      setSelectedServing(originalServing);
      setServingAmount(food.servingAmount || "1");
      setSelectedMeal(food.mealType || "breakfast");
    }
  }, [food]);


 
  const calculateNutrition = useCallback((baseValue) => {
    const amount = parseFloat(servingAmount) || 1;
    return Math.round(baseValue * amount);
  }, [servingAmount]);

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
      baseFat: selectedServing.fat
    };

    if (isExistingEntry) {
      entryData.id = food.id;
      entryData.updatedAt = new Date();
    }

    onEdit(entryData);
    setIsEditing(false);
    if (!isExistingEntry) onClose();
  }, [selectedServing, servingAmount, selectedMeal, food, isExistingEntry, onEdit, onClose, calculateNutrition]);

  if (!isOpen || !food) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideClose={true} className="max-w-md dark:bg-zinc-800">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="dark:text-white text-xl md:text-2xl">
              {food.food_name}
            </DialogTitle>
            <DialogClose asChild>
              <FiX className="h-5 w-5 dark:text-white hover:text-red-500" />
            </DialogClose>
          </div>
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
                    const newServing = food.servings.find(s => s.serving_id === value);
                    setSelectedServing(newServing);
                    setServingAmount("1");
                  }}
                >
                  <SelectTrigger>
                    {selectedServing?.description || "Select serving"}
                  </SelectTrigger>
                  <SelectContent>
                    {food?.servings?.map((serving) => (
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

        <div className="border-t-2 border-b-2 dark:border-gray-700 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-lg">
              <span className="dark:text-gray-300">Calories</span>
              <span className="dark:text-white font-medium">
                {calculateNutrition(selectedServing?.calories || food.calories || 0)}
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
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEntry}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <FiEdit2 className="mr-2" />
                    Edit Entry
                  </Button>
                  <Button variant="destructive" onClick={onDelete}>
                    <FiTrash2 className="mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </>
          ) : (
            <Button onClick={handleSaveEntry} className="w-full">
              Add Entry
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}