"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FiUser, FiSettings, FiBarChart2, FiX } from "react-icons/fi";
export function NutritionLabel({ isOpen, onClose, food }) {
  if (!food) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideClose={true} className="max-w-md dark:bg-zinc-800">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="dark:text-white text-xl md:text-2xl">
              {food.foodName}
            </DialogTitle>
            <DialogClose asChild>
              {/* <Button
                variant="ghost"
                className="h-8 w-8 p-0 dark:text-white hover:text-red-500 hover:bg-transparent transition-colors"
              > */}
                <FiX className="h-5 w-5 dark:text-white hover:text-red-500 hover:bg-transparent transition-colors"  />
              {/* </Button> */}
            </DialogClose>
          </div>
          <DialogDescription className="dark:text-gray-300 text-lg">
            Nutrition Facts
          </DialogDescription>
        </DialogHeader>
        <div className="border-t-2 border-b border-b-2 dark:border-gray-700 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-lg">
              <span className="dark:text-gray-300 ">Calories</span>
              <span className="dark:text-white font-medium">
                {food.calories}
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="dark:text-gray-300">Protein</span>
              <span className="dark:text-white font-medium">
                {food.protein}g
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="dark:text-gray-300">Carbohydrates</span>
              <span className="dark:text-white font-medium">{food.carbs}g</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="dark:text-gray-300">Fat</span>
              <span className="dark:text-white font-medium">{food.fat}g</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
