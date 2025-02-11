//src/components/NutritionLabel
"use client";

import { useState, useEffect} from 'react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [servingAmount, setServingAmount] = useState(food?.servingAmount || "1");
  const [servingType, setServingType] = useState(food?.servingType || "serving");
  const [selectedMeal, setSelectedMeal] = useState(food?.mealType || "breakfast");

  const calculateNutrition = (baseValue) => {
    const amount = parseFloat(servingAmount) || 1;
    return Math.round(baseValue * amount);
  };

  
  const handleClose = () => {
    onClose();
   
    setIsEditing(false); // If you have an editing state
  };

  const handleEdit = () => {
    if (isEditing) {
      onEdit({
        ...food,
        servingAmount,
        servingType,
        mealType: selectedMeal,
        calories: calculateNutrition(food.baseCalories || food.calories),
        protein: calculateNutrition(food.baseProtein || food.protein),
        carbs: calculateNutrition(food.baseCarbs || food.carbs),
        fat: calculateNutrition(food.baseFat || food.fat),
      });
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };
  useEffect(() => {
    if (food) {
      setServingAmount(food.servingAmount || "1");
      setServingType(food.servingType || "serving");
      setSelectedMeal(food.mealType || "breakfast");
    }
  }, [food]);

  if (!food) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent hideClose={true} className="max-w-md dark:bg-zinc-800">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="dark:text-white text-xl md:text-2xl">
              {food.foodName}
            </DialogTitle>
            <DialogClose asChild>
              {/* <Button variant="ghost" className="h-8 w-8 p-0"> */}
                <FiX className="h-5 w-5 dark:text-white hover:text-red-500" />
              {/* </Button> */}
            </DialogClose>
          </div>
          <DialogDescription className="dark:text-gray-300 text-lg">
            Nutrition Facts
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <div className="space-y-4 py-4">
            <div className="flex gap-4">
              <Input
                type="text"
                value={servingAmount}
                onChange={(e) => setServingAmount(e.target.value)}
                className="w-24"
                placeholder="Amount"
              />
              <Select className = 'capitalize' value={servingType} onValueChange={setServingType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serving">Serving</SelectItem>
                  <SelectItem value="g">Grams</SelectItem>
                  <SelectItem value="oz">Ounces</SelectItem>
                  <SelectItem value="cup">Cup</SelectItem>
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
        ) : null}

        <div className="border-t-2 border-b-2 dark:border-gray-700 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-lg">
              <span className="dark:text-gray-300">Calories</span>
              <span className="dark:text-white font-medium">
                {calculateNutrition(food.baseCalories || food.calories)}
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="dark:text-gray-300">Protein</span>
              <span className="dark:text-white font-medium">
                {calculateNutrition(food.baseProtein || food.protein)}g
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="dark:text-gray-300">Carbohydrates</span>
              <span className="dark:text-white font-medium">
                {calculateNutrition(food.baseCarbs || food.carbs)}g
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="dark:text-gray-300">Fat</span>
              <span className="dark:text-white font-medium">
                {calculateNutrition(food.baseFat || food.fat)}g
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between gap-2 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleEdit}
          >
            <FiEdit2 className="mr-2" />
            {isEditing ? 'Save Changes' : 'Edit Entry'}
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onDelete}
          >
            <FiTrash2 className="mr-2" />
            Delete Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}