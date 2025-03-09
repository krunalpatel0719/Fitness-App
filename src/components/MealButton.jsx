// src/components/MealButton.jsx
"use client";

import { Button } from "@/components/ui/button";

export function MealButton({ meal, selected, onClick, disabled }) {
  const formattedMeal = meal.charAt(0).toUpperCase() + meal.slice(1);

  return (
    <Button
      size="sm"
      onClick={onClick}
      className={`
        h-8 w-14 
        px-9
        text-sm 
        rounded-lg
        font-medium
        sm:text-md 
        md:px-10
        md:py-2
        md:text-md
        lg:px-12
        lg:py-4
        lg:text-lg
        transition-colors
        ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-gray-400"
            : selected === meal
            ? "hover:bg-blue-500 hover:text-white bg-blue-500 text-white"
            : "bg-transparent border-0 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
        }`}
    >
      {formattedMeal}
    </Button>
  );
}
